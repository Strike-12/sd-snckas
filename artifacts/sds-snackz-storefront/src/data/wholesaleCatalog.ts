import {
  BEST_SELLER_CATEGORIES,
  PRODUCTS_BY_COLLECTION,
  type Product,
} from './productsData';

export interface CasePackOption {
  id: 'caddy' | 'master' | 'pallet';
  name: string;
  shortLabel: string;
  units: number;
  unitPrice: number;
  casePrice: number;
  marginPercent: number;
}

export interface WholesaleItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  flavorOrVariant: string;
  category: string;
  categorySlug: string;
  brand: string;
  image: string;
  suggestedMSRP: number;
  defaultPackOptionId: 'caddy' | 'master' | 'pallet';
  packOptions: CasePackOption[];
  minCases: number;
  inStock: boolean;
  palletCases: number;
  shelfLife: string;
  origin: string;
  barcode: string;
}

function cleanFlavorName(name: string, brand: string): string {
  let cleaned = name
    .replace(new RegExp(`^${brand}\\s*[-:]*\\s*`, 'i'), '')
    .replace(/^Peelerz\s*[-–:]*\s*/i, '')
    .replace(/^Sour Strips\s*[-–:]*\s*/i, '')
    .replace(/^Snak Club:\s*/i, '')
    .replace(/^Micheladas El Gordo\s*[-–:]*\s*/i, '')
    .replace(/\s*\d+(\.\d+)?\s*(oz|OZ|g|G|ct|count|pc|pcs|Bags|bags).*$/i, '')
    .trim();
  return cleaned || name;
}

function generatePackOptions(
  categorySlug: string,
  msrp: number,
  productName: string
): CasePackOption[] {
  const nameLower = productName.toLowerCase();

  // Chips & Crisps (Sabritas, Takis)
  if (categorySlug === 'mexican-chips' || categorySlug === 'takis') {
    const unit18 = Number((msrp * 0.48).toFixed(2));
    const unit36 = Number((msrp * 0.45).toFixed(2));
    const unit72 = Number((msrp * 0.42).toFixed(2));
    return [
      {
        id: 'caddy',
        name: '18-Bag Retail Case',
        shortLabel: '18-Pack Case',
        units: 18,
        unitPrice: unit18,
        casePrice: Number((unit18 * 18).toFixed(2)),
        marginPercent: Number((((msrp - unit18) / msrp) * 100).toFixed(1)),
      },
      {
        id: 'master',
        name: '36-Bag Master Shipper (Best Margin)',
        shortLabel: '36-Pack Master',
        units: 36,
        unitPrice: unit36,
        casePrice: Number((unit36 * 36).toFixed(2)),
        marginPercent: Number((((msrp - unit36) / msrp) * 100).toFixed(1)),
      },
      {
        id: 'pallet',
        name: '72-Bag Half-Pallet Tier',
        shortLabel: '72-Bag Pallet',
        units: 72,
        unitPrice: unit72,
        casePrice: Number((unit72 * 72).toFixed(2)),
        marginPercent: Number((((msrp - unit72) / msrp) * 100).toFixed(1)),
      },
    ];
  }

  // Beef Jerky
  if (categorySlug === 'alien-fresh-jerky' || categorySlug === 'old-trapper-beef-jerky' || nameLower.includes('jerky')) {
    const unit12 = Number((msrp * 0.55).toFixed(2));
    const unit24 = Number((msrp * 0.52).toFixed(2));
    const unit48 = Number((msrp * 0.49).toFixed(2));
    return [
      {
        id: 'caddy',
        name: '12-Pack Clip Strip Case',
        shortLabel: '12-Pack Caddy',
        units: 12,
        unitPrice: unit12,
        casePrice: Number((unit12 * 12).toFixed(2)),
        marginPercent: Number((((msrp - unit12) / msrp) * 100).toFixed(1)),
      },
      {
        id: 'master',
        name: '24-Pack Master Shipper',
        shortLabel: '24-Pack Master',
        units: 24,
        unitPrice: unit24,
        casePrice: Number((unit24 * 24).toFixed(2)),
        marginPercent: Number((((msrp - unit24) / msrp) * 100).toFixed(1)),
      },
      {
        id: 'pallet',
        name: '48-Pack Floor Stand Shipper',
        shortLabel: '48-Pack Stand',
        units: 48,
        unitPrice: unit48,
        casePrice: Number((unit48 * 48).toFixed(2)),
        marginPercent: Number((((msrp - unit48) / msrp) * 100).toFixed(1)),
      },
    ];
  }

  // Micheladas & Antojitos
  if (categorySlug === 'micheladas-el-gordo-candy' || categorySlug === 'michelada-cups-rim-dip') {
    const unit12 = Number((msrp * 0.52).toFixed(2));
    const unit24 = Number((msrp * 0.48).toFixed(2));
    const unit48 = Number((msrp * 0.45).toFixed(2));
    return [
      {
        id: 'caddy',
        name: '12-Pack Display Tray',
        shortLabel: '12-Pack Tray',
        units: 12,
        unitPrice: unit12,
        casePrice: Number((unit12 * 12).toFixed(2)),
        marginPercent: Number((((msrp - unit12) / msrp) * 100).toFixed(1)),
      },
      {
        id: 'master',
        name: '24-Pack Master Carton',
        shortLabel: '24-Pack Master',
        units: 24,
        unitPrice: unit24,
        casePrice: Number((unit24 * 24).toFixed(2)),
        marginPercent: Number((((msrp - unit24) / msrp) * 100).toFixed(1)),
      },
      {
        id: 'pallet',
        name: '48-Pack Pallet Display',
        shortLabel: '48-Pack Pallet',
        units: 48,
        unitPrice: unit48,
        casePrice: Number((unit48 * 48).toFixed(2)),
        marginPercent: Number((((msrp - unit48) / msrp) * 100).toFixed(1)),
      },
    ];
  }

  // Sour Strips, Peelerz, Haribo, Chocolates, Snak Club, American Gourmet
  const unit12 = Number((msrp * 0.49).toFixed(2));
  const unit24 = Number((msrp * 0.46).toFixed(2));
  const unit48 = Number((msrp * 0.43).toFixed(2));
  return [
    {
      id: 'caddy',
      name: '12-Pack Gravity Caddy',
      shortLabel: '12-Pack Caddy',
      units: 12,
      unitPrice: unit12,
      casePrice: Number((unit12 * 12).toFixed(2)),
      marginPercent: Number((((msrp - unit12) / msrp) * 100).toFixed(1)),
    },
    {
      id: 'master',
      name: '24-Pack Master Case',
      shortLabel: '24-Pack Master',
      units: 24,
      unitPrice: unit24,
      casePrice: Number((unit24 * 24).toFixed(2)),
      marginPercent: Number((((msrp - unit24) / msrp) * 100).toFixed(1)),
    },
    {
      id: 'pallet',
      name: '48-Pack Floor Shipper Display',
      shortLabel: '48-Pack Shipper',
      units: 48,
      unitPrice: unit48,
      casePrice: Number((unit48 * 48).toFixed(2)),
      marginPercent: Number((((msrp - unit48) / msrp) * 100).toFixed(1)),
    },
  ];
}

function generateWholesaleCatalog(): WholesaleItem[] {
  const items: WholesaleItem[] = [];

  // Build items from all collections
  for (const category of BEST_SELLER_CATEGORIES) {
    const products = PRODUCTS_BY_COLLECTION[category.slug] || [];

    products.forEach((product: Product, index: number) => {
      const msrp = product.rawPrice && product.rawPrice > 0 ? product.rawPrice : 3.99;
      const brand = product.categoryName || category.name;
      const flavor = cleanFlavorName(product.name, brand);

      // Generate a clean commercial SKU
      const prefix = category.slug
        .split('-')
        .map((w) => w.slice(0, 3).toUpperCase())
        .join('');
      const skuNumber = String(index + 1).padStart(3, '0');
      const sku = `SDS-${prefix}-${skuNumber}`;

      const packOptions = generatePackOptions(category.slug, msrp, product.name);

      items.push({
        id: `ws-${product.id}`,
        productId: product.id,
        sku,
        name: product.name,
        flavorOrVariant: flavor,
        category: category.name,
        categorySlug: category.slug,
        brand,
        image: product.image,
        suggestedMSRP: msrp,
        defaultPackOptionId: 'caddy',
        packOptions,
        minCases: 1,
        inStock: true,
        palletCases: 48,
        shelfLife: '8-12 Months Guaranteed',
        origin: category.slug.includes('mexican') ? 'Imported from Mexico' : 'USA Distribution',
        barcode: `8${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      });
    });
  }

  return items;
}

export const ALL_WHOLESALE_ITEMS: WholesaleItem[] = generateWholesaleCatalog();

export const WHOLESALE_CATEGORIES = [
  'All Cases',
  ...BEST_SELLER_CATEGORIES.map((c) => c.name),
];

export function getItemsByCategory(categoryName: string): WholesaleItem[] {
  if (categoryName === 'All Cases' || categoryName === 'All') {
    return ALL_WHOLESALE_ITEMS;
  }
  return ALL_WHOLESALE_ITEMS.filter((item) => item.category === categoryName);
}

export function getFlavorsForBrand(brandSlug: string): WholesaleItem[] {
  return ALL_WHOLESALE_ITEMS.filter((item) => item.categorySlug === brandSlug);
}
