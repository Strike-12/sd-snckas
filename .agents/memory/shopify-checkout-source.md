---
name: Shopify checkout source
description: The product catalog and hosted checkout path used by the SDS Snackz storefront.
---

Use the live public Shopify product feed at `www.sdsnackz.com` for current product, variant, price, and availability data. Build Shopify cart permalinks only from available variant IDs returned by that feed; never restore a hard-coded variant map. Shopify's hosted checkout handles payment details, taxes, shipping, and order status.

**Why:** The attached Replit Shopify Storefront connection returned an empty catalog while the public SDS Snackz store exposed its products. A cart permalink built from a live available variant was accepted by Shopify and redirected to Shopify-hosted checkout without submitting a payment.

**How to apply:** Keep the feed paginated and live, validate product handle, variant ID, and availability on the server before constructing cart links, and leave payment-method setup to Shopify Admin. Do not collect card data or report an order as paid in the storefront.

Shopify checkout must open outside the storefront iframe. Open a blank tab synchronously from the buyer's click, navigate it after the server returns the cart URL, and show a direct new-tab link if the browser blocks the popup.

**Why:** Navigating the Replit preview iframe to the merchant's Shopify domain is refused because hosted checkout does not allow itself to be framed.

**How to apply:** Keep checkout navigation top-level and provide a user-clickable fallback link; do not send the preview iframe itself to the Shopify cart URL.