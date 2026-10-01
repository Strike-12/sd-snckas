import { Router, type IRouter } from "express";
import {
  CreateShopifyCheckoutBody,
  CreateShopifyCheckoutResponse,
  ListShopifyProductsResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type ShopifyProductNode = {
  handle: string;
  title: string;
  images?: Array<{ src: string; alt?: string | null }>;
  variants: Array<{
    id: number | string;
    title: string;
    available: boolean;
    price: string;
  }>;
};

type ProductPageResponse = {
  products: ShopifyProductNode[];
};

const SHOPIFY_STORE_URL = new URL("https://www.sdsnackz.com");
const SHOPIFY_PRODUCTS_URL = new URL("/products.json", SHOPIFY_STORE_URL);
const CATALOG_PAGE_SIZE = 250;
const MAX_CATALOG_PAGES = 10;
const SHOPIFY_FETCH_TIMEOUT_MS = 15_000;

const CATALOG_CACHE_TTL_MS = 30_000;
let cachedCatalog:
  | {
      products: ShopifyProductNode[];
      expiresAt: number;
    }
  | undefined;
let catalogRequest: Promise<ShopifyProductNode[]> | undefined;

async function getShopifyCatalog(): Promise<ShopifyProductNode[]> {
  if (cachedCatalog && Date.now() < cachedCatalog.expiresAt) {
    return cachedCatalog.products;
  }
  if (catalogRequest) return catalogRequest;

  catalogRequest = (async () => {
    const products: ShopifyProductNode[] = [];
    let hasMorePages = true;

    // Read the live product feed used by sdsnackz.com, and fail rather than
    // silently returning an incomplete catalog if the page cap is exceeded.
    for (let page = 1; hasMorePages && page <= MAX_CATALOG_PAGES; page += 1) {
      const pageUrl = new URL(SHOPIFY_PRODUCTS_URL);
      pageUrl.searchParams.set("limit", String(CATALOG_PAGE_SIZE));
      pageUrl.searchParams.set("page", String(page));

      const response = await fetch(pageUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(SHOPIFY_FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`Shopify product feed returned HTTP ${response.status}`);
      }

      const pageData = (await response.json()) as ProductPageResponse;
      if (!Array.isArray(pageData.products)) {
        throw new Error("Shopify product feed returned an invalid response");
      }
      products.push(...pageData.products);
      hasMorePages = pageData.products.length === CATALOG_PAGE_SIZE;
    }

    if (hasMorePages) {
      throw new Error("Shopify product catalog exceeded the supported page limit");
    }

    cachedCatalog = {
      products,
      expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
    };
    return products;
  })();

  try {
    return await catalogRequest;
  } finally {
    catalogRequest = undefined;
  }
}

function toCatalogResponse(products: ShopifyProductNode[]) {
  return {
    products: products.map((product) => ({
      handle: product.handle,
      title: product.title,
      ...(product.images?.[0]?.src
        ? {
            imageUrl: product.images[0].src,
            ...(product.images[0].alt
              ? { imageAlt: product.images[0].alt }
              : {}),
          }
        : {}),
      variants: product.variants.map((variant) => ({
        id: String(variant.id),
        title: variant.title,
        availableForSale: variant.available,
        priceAmount: variant.price,
        currencyCode: "USD",
      })),
    })),
  };
}

router.get("/shopify/products", async (_req, res) => {
  try {
    const catalog = await getShopifyCatalog();
    res.json(ListShopifyProductsResponse.parse(toCatalogResponse(catalog)));
  } catch (error) {
    logger.error({ err: error }, "Failed to load Shopify product catalog");
    res.status(503).json({
      error: "Shopify products are temporarily unavailable. Please try again shortly.",
    });
  }
});

router.post("/shopify/checkout", async (req, res) => {
  const parsed = CreateShopifyCheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Cart lines are invalid." });
    return;
  }

  try {
    const products = await getShopifyCatalog();
    const lines = parsed.data.lines;
    const cartQuantities = new Map<string, number>();

    for (const line of lines) {
      const product = products.find((item) => item.handle === line.handle);
      const variant = product?.variants.find(
        (item) => String(item.id) === line.variantId,
      );
      if (!product || !variant || !variant.available) {
        res.status(409).json({
          error: `${product?.title ?? "A product"} is no longer available. Refresh the catalog and try again.`,
        });
        return;
      }

      const variantId = String(variant.id);
      if (!/^\d+$/.test(variantId)) {
        throw new Error("Shopify returned an invalid product variant ID");
      }
      const totalQuantity = (cartQuantities.get(variantId) ?? 0) + line.quantity;
      if (totalQuantity > 99) {
        res.status(400).json({
          error: "Each product is limited to 99 bags per checkout.",
        });
        return;
      }
      cartQuantities.set(variantId, totalQuantity);
    }

    const checkoutUrl = new URL(
      `/cart/${Array.from(cartQuantities, ([variantId, quantity]) => `${variantId}:${quantity}`).join(",")}`,
      SHOPIFY_STORE_URL,
    );

    res.json(
      CreateShopifyCheckoutResponse.parse({
        checkoutUrl: checkoutUrl.toString(),
      }),
    );
  } catch (error) {
    logger.error({ err: error }, "Failed to create Shopify checkout");
    res.status(503).json({
      error: "Secure Shopify checkout could not be started. Please try again.",
    });
  }
});

export default router;