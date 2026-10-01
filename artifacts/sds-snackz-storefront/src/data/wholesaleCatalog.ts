import {
  BEST_SELLER_CATEGORIES,
  PRODUCTS_BY_COLLECTION,
  ALL_PRODUCTS,
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
  unitSingular: string;
  unitPlural: string;
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
  unitSingular: string;
  unitPlural: string;
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

/**
 * Generates accurate wholesale case packaging and wholesale tier prices
 * directly grounded in 70wholesale.com B2B commercial specs:
 * e.g. Kinder Bueno bars: 20 pieces/box ($25.00), Takis: 20 bags/case ($32.50),
 * Takis Crisps: 15 cans/case ($42.00), Alien Fresh Jerky: 25 bags/case ($177.50),
 * Lenny & Larry's cookies: 12 pcs/box ($23.50), Legendary Pastries: 10 pcs/box ($29.99).
 */
function generatePackOptions(
  categorySlug: string,
  msrp: number,
  productName: string
): {
  unitSingular: string;
  unitPlural: string;
  packOptions: CasePackOption[];
} {
  const nameLower = productName.toLowerCase();

  // 1. Kinder Bueno & Chocolate Bars (70wholesale: 20 pieces per display box at $25.00)
  if (nameLower.includes('bueno') || (nameLower.includes('kinder') && !nameLower.includes('joy'))) {
    const unitPrice20 = 1.25;
    const casePrice20 = 25.00;
    const unitPrice40 = 1.20;
    const casePrice40 = 48.00;
    const unitPrice120 = 1.15;
    const casePrice120 = 138.00;

    return {
      unitSingular: 'piece',
      unitPlural: 'pieces',
      packOptions: [
        {
          id: 'caddy',
          name: '20-Piece Display Box',
          shortLabel: '20-Piece Box',
          units: 20,
          unitPrice: unitPrice20,
          casePrice: casePrice20,
          marginPercent: Number((((msrp - unitPrice20) / msrp) * 100).toFixed(1)),
          unitSingular: 'piece',
          unitPlural: 'pieces',
        },
        {
          id: 'master',
          name: '40-Piece Master Shipper',
          shortLabel: '40-Piece Master',
          units: 40,
          unitPrice: unitPrice40,
          casePrice: casePrice40,
          marginPercent: Number((((msrp - unitPrice40) / msrp) * 100).toFixed(1)),
          unitSingular: 'piece',
          unitPlural: 'pieces',
        },
        {
          id: 'pallet',
          name: '120-Piece Master Tier',
          shortLabel: '120-Piece Tier',
          units: 120,
          unitPrice: unitPrice120,
          casePrice: casePrice120,
          marginPercent: Number((((msrp - unitPrice120) / msrp) * 100).toFixed(1)),
          unitSingular: 'piece',
          unitPlural: 'pieces',
        },
      ],
    };
  }

  // 2. Kinder Joy Chocolates (70wholesale: 16 pieces per display box at $30.00)
  if (nameLower.includes('kinder joy')) {
    const unitPrice16 = 1.875;
    const casePrice16 = 30.00;
    const unitPrice32 = 1.812;
    const casePrice32 = 58.00;
    const unitPrice64 = 1.75;
    const casePrice64 = 112.00;

    return {
      unitSingular: 'piece',
      unitPlural: 'pieces',
      packOptions: [
        {
          id: 'caddy',
          name: '16-Piece Display Box',
          shortLabel: '16-Piece Box',
          units: 16,
          unitPrice: unitPrice16,
          casePrice: casePrice16,
          marginPercent: Number((((msrp - unitPrice16) / msrp) * 100).toFixed(1)),
          unitSingular: 'piece',
          unitPlural: 'pieces',
        },
        {
          id: 'master',
          name: '32-Piece Master Shipper',
          shortLabel: '32-Piece Master',
          units: 32,
          unitPrice: unitPrice32,
          casePrice: casePrice32,
          marginPercent: Number((((msrp - unitPrice32) / msrp) * 100).toFixed(1)),
          unitSingular: 'piece',
          unitPlural: 'pieces',
        },
        {
          id: 'pallet',
          name: '64-Piece Floor Stand',
          shortLabel: '64-Piece Stand',
          units: 64,
          unitPrice: unitPrice64,
          casePrice: casePrice64,
          marginPercent: Number((((msrp - unitPrice64) / msrp) * 100).toFixed(1)),
          unitSingular: 'piece',
          unitPlural: 'pieces',
        },
      ],
    };
  }

  // 3. The Complete Cookie (Lenny & Larry's 4oz) (70wholesale: 12 pieces per box at $23.50)
  if (nameLower.includes('cookie')) {
    const unitPrice12 = 1.958;
    const casePrice12 = 23.50;
    const unitPrice24 = 1.875;
    const casePrice24 = 45.00;
    const unitPrice48 = 1.80;
    const casePrice48 = 86.40;

    return {
      unitSingular: 'cookie',
      unitPlural: 'cookies',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Cookie Display Box',
          shortLabel: '12-Pack Box',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'cookie',
          unitPlural: 'cookies',
        },
        {
          id: 'master',
          name: '24-Cookie Master Shipper',
          shortLabel: '24-Pack Master',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'cookie',
          unitPlural: 'cookies',
        },
        {
          id: 'pallet',
          name: '48-Cookie Pallet Shipper',
          shortLabel: '48-Pack Pallet',
          units: 48,
          unitPrice: unitPrice48,
          casePrice: casePrice48,
          marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
          unitSingular: 'cookie',
          unitPlural: 'cookies',
        },
      ],
    };
  }

  // 4. Legendary Foods Protein Pastries (70wholesale: 10 pieces per box at $29.99)
  if (nameLower.includes('pastry') || nameLower.includes('legendary')) {
    const unitPrice10 = 2.999;
    const casePrice10 = 29.99;
    const unitPrice20 = 2.90;
    const casePrice20 = 58.00;
    const unitPrice40 = 2.80;
    const casePrice40 = 112.00;

    return {
      unitSingular: 'pastry',
      unitPlural: 'pastries',
      packOptions: [
        {
          id: 'caddy',
          name: '10-Pastry Display Box',
          shortLabel: '10-Pack Box',
          units: 10,
          unitPrice: unitPrice10,
          casePrice: casePrice10,
          marginPercent: Number((((msrp - unitPrice10) / msrp) * 100).toFixed(1)),
          unitSingular: 'pastry',
          unitPlural: 'pastries',
        },
        {
          id: 'master',
          name: '20-Pastry Master Shipper',
          shortLabel: '20-Pack Master',
          units: 20,
          unitPrice: unitPrice20,
          casePrice: casePrice20,
          marginPercent: Number((((msrp - unitPrice20) / msrp) * 100).toFixed(1)),
          unitSingular: 'pastry',
          unitPlural: 'pastries',
        },
        {
          id: 'pallet',
          name: '40-Pastry Shipper Display',
          shortLabel: '40-Pack Shipper',
          units: 40,
          unitPrice: unitPrice40,
          casePrice: casePrice40,
          marginPercent: Number((((msrp - unitPrice40) / msrp) * 100).toFixed(1)),
          unitSingular: 'pastry',
          unitPlural: 'pastries',
        },
      ],
    };
  }

  // 4b. Barebells Protein Bars (70wholesale: 12 bars per box at $27.50)
  if (nameLower.includes('barebells')) {
    const unitPrice12 = 2.291;
    const casePrice12 = 27.50;
    const unitPrice24 = 2.20;
    const casePrice24 = 52.80;
    const unitPrice48 = 2.10;
    const casePrice48 = 100.80;

    return {
      unitSingular: 'bar',
      unitPlural: 'bars',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Bar Display Box',
          shortLabel: '12-Pack Box',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'bar',
          unitPlural: 'bars',
        },
        {
          id: 'master',
          name: '24-Bar Master Shipper',
          shortLabel: '24-Pack Master',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'bar',
          unitPlural: 'bars',
        },
        {
          id: 'pallet',
          name: '48-Bar Pallet Tier',
          shortLabel: '48-Pack Pallet',
          units: 48,
          unitPrice: unitPrice48,
          casePrice: casePrice48,
          marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
          unitSingular: 'bar',
          unitPlural: 'bars',
        },
      ],
    };
  }

  // 5. Takis Crisps Cans (70wholesale: 15 cans per case at $42.00)
  if (nameLower.includes('takis') && (nameLower.includes('crisp') || nameLower.includes('can'))) {
    const unitPrice15 = 2.80;
    const casePrice15 = 42.00;
    const unitPrice30 = 2.73;
    const casePrice30 = 82.00;
    const unitPrice60 = 2.65;
    const casePrice60 = 159.00;

    return {
      unitSingular: 'can',
      unitPlural: 'cans',
      packOptions: [
        {
          id: 'caddy',
          name: '15-Can Retail Case',
          shortLabel: '15-Can Case',
          units: 15,
          unitPrice: unitPrice15,
          casePrice: casePrice15,
          marginPercent: Number((((msrp - unitPrice15) / msrp) * 100).toFixed(1)),
          unitSingular: 'can',
          unitPlural: 'cans',
        },
        {
          id: 'master',
          name: '30-Can Master Shipper',
          shortLabel: '30-Can Master',
          units: 30,
          unitPrice: unitPrice30,
          casePrice: casePrice30,
          marginPercent: Number((((msrp - unitPrice30) / msrp) * 100).toFixed(1)),
          unitSingular: 'can',
          unitPlural: 'cans',
        },
        {
          id: 'pallet',
          name: '60-Can Pallet Tier',
          shortLabel: '60-Can Pallet',
          units: 60,
          unitPrice: unitPrice60,
          casePrice: casePrice60,
          marginPercent: Number((((msrp - unitPrice60) / msrp) * 100).toFixed(1)),
          unitSingular: 'can',
          unitPlural: 'cans',
        },
      ],
    };
  }

  // 5b. Pringles Cans (70wholesale: 12 cans per case at $24.00)
  if (nameLower.includes('pringles')) {
    const unitPrice12 = 2.00;
    const casePrice12 = 24.00;
    const unitPrice24 = 1.90;
    const casePrice24 = 45.60;
    const unitPrice48 = 1.80;
    const casePrice48 = 86.40;

    return {
      unitSingular: 'can',
      unitPlural: 'cans',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Can Retail Case',
          shortLabel: '12-Can Case',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'can',
          unitPlural: 'cans',
        },
        {
          id: 'master',
          name: '24-Can Master Shipper',
          shortLabel: '24-Can Master',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'can',
          unitPlural: 'cans',
        },
        {
          id: 'pallet',
          name: '48-Can Pallet Tier',
          shortLabel: '48-Can Pallet',
          units: 48,
          unitPrice: unitPrice48,
          casePrice: casePrice48,
          marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
          unitSingular: 'can',
          unitPlural: 'cans',
        },
      ],
    };
  }

  // 6. Takis 3.25 oz (70wholesale: 20 bags per case at $32.50)
  if (nameLower.includes('takis') && !nameLower.includes('9.9')) {
    const unitPrice20 = 1.625;
    const casePrice20 = 32.50;
    const unitPrice40 = 1.575;
    const casePrice40 = 63.00;
    const unitPrice80 = 1.525;
    const casePrice80 = 122.00;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '20-Bag Retail Case',
          shortLabel: '20-Bag Case',
          units: 20,
          unitPrice: unitPrice20,
          casePrice: casePrice20,
          marginPercent: Number((((msrp - unitPrice20) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '40-Bag Master Shipper',
          shortLabel: '40-Bag Master',
          units: 40,
          unitPrice: unitPrice40,
          casePrice: casePrice40,
          marginPercent: Number((((msrp - unitPrice40) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '80-Bag Half Pallet',
          shortLabel: '80-Bag Pallet',
          units: 80,
          unitPrice: unitPrice80,
          casePrice: casePrice80,
          marginPercent: Number((((msrp - unitPrice80) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 7. Alien Fresh Jerky 3.25 oz (70wholesale: 25 bags master case at $177.50)
  if (categorySlug === 'alien-fresh-jerky' || nameLower.includes('alien fresh')) {
    const unitPrice12 = 7.40;
    const casePrice12 = 88.80;
    const unitPrice25 = 7.10;
    const casePrice25 = 177.50;
    const unitPrice50 = 6.90;
    const casePrice50 = 345.00;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Bag Clip Strip Caddy',
          shortLabel: '12-Bag Caddy',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '25-Bag Master Case',
          shortLabel: '25-Bag Master',
          units: 25,
          unitPrice: unitPrice25,
          casePrice: casePrice25,
          marginPercent: Number((((msrp - unitPrice25) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '50-Bag Floor Stand Shipper',
          shortLabel: '50-Bag Shipper',
          units: 50,
          unitPrice: unitPrice50,
          casePrice: casePrice50,
          marginPercent: Number((((msrp - unitPrice50) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 8. Country Archer Jerky (70wholesale: 6 pcs $27.00, 12 pcs $54.00)
  if (nameLower.includes('country archer')) {
    const unitPrice6 = 4.50;
    const casePrice6 = 27.00;
    const unitPrice12 = 4.50;
    const casePrice12 = 54.00;
    const unitPrice24 = 4.33;
    const casePrice24 = 104.00;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '6-Bag Half Case',
          shortLabel: '6-Bag Half',
          units: 6,
          unitPrice: unitPrice6,
          casePrice: casePrice6,
          marginPercent: Number((((msrp - unitPrice6) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '12-Bag Full Case',
          shortLabel: '12-Bag Case',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '24-Bag Master Shipper',
          shortLabel: '24-Bag Shipper',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 9. Old Trapper 10 oz Beef Jerky (70wholesale: $13.00/bag wholesale)
  if (nameLower.includes('old trapper') || nameLower.includes('10 oz')) {
    const unitPrice8 = 12.375;
    const casePrice8 = 99.00;
    const unitPrice16 = 11.875;
    const casePrice16 = 190.00;
    const unitPrice32 = 11.50;
    const casePrice32 = 368.00;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '8-Bag Retail Case',
          shortLabel: '8-Bag Case',
          units: 8,
          unitPrice: unitPrice8,
          casePrice: casePrice8,
          marginPercent: Number((((msrp - unitPrice8) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '16-Bag Master Shipper',
          shortLabel: '16-Bag Master',
          units: 16,
          unitPrice: unitPrice16,
          casePrice: casePrice16,
          marginPercent: Number((((msrp - unitPrice16) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '32-Bag Floor Stand',
          shortLabel: '32-Bag Stand',
          units: 32,
          unitPrice: unitPrice32,
          casePrice: casePrice32,
          marginPercent: Number((((msrp - unitPrice32) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 10. Micheladas El Gordo Cups (70wholesale: 24 pcs per case at $72.00)
  if (nameLower.includes('cup') && (nameLower.includes('michelada') || nameLower.includes('el gordo') || nameLower.includes('cubanito'))) {
    const unitPrice12 = 3.16;
    const casePrice12 = 38.00;
    const unitPrice24 = 3.00;
    const casePrice24 = 72.00;
    const unitPrice48 = 2.85;
    const casePrice48 = 136.80;

    return {
      unitSingular: 'cup',
      unitPlural: 'cups',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Cup Half Case',
          shortLabel: '12-Cup Half',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'cup',
          unitPlural: 'cups',
        },
        {
          id: 'master',
          name: '24-Cup Master Case',
          shortLabel: '24-Cup Master',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'cup',
          unitPlural: 'cups',
        },
        {
          id: 'pallet',
          name: '48-Cup Pallet Tier',
          shortLabel: '48-Cup Pallet',
          units: 48,
          unitPrice: unitPrice48,
          casePrice: casePrice48,
          marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
          unitSingular: 'cup',
          unitPlural: 'cups',
        },
      ],
    };
  }

  // 11. Pulparindo Rim Dips (70wholesale: 12 pcs at $42.00)
  if (nameLower.includes('rim dip')) {
    const unitPrice12 = 3.50;
    const casePrice12 = 42.00;
    const unitPrice24 = 3.35;
    const casePrice24 = 80.40;
    const unitPrice48 = 3.20;
    const casePrice48 = 153.60;

    return {
      unitSingular: 'tub',
      unitPlural: 'tubs',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Tub Display Caddy',
          shortLabel: '12-Tub Caddy',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'tub',
          unitPlural: 'tubs',
        },
        {
          id: 'master',
          name: '24-Tub Master Case',
          shortLabel: '24-Tub Master',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'tub',
          unitPlural: 'tubs',
        },
        {
          id: 'pallet',
          name: '48-Tub Floor Stand',
          shortLabel: '48-Tub Stand',
          units: 48,
          unitPrice: unitPrice48,
          casePrice: casePrice48,
          marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
          unitSingular: 'tub',
          unitPlural: 'tubs',
        },
      ],
    };
  }

  // 12. De La Rosa Pulparindo Squeeze Paste (70wholesale: 6 pcs $19.00, 12 pcs $36.00)
  if (nameLower.includes('squeeze paste') || nameLower.includes('squeeze')) {
    const unitPrice6 = 3.166;
    const casePrice6 = 19.00;
    const unitPrice12 = 3.00;
    const casePrice12 = 36.00;
    const unitPrice24 = 2.85;
    const casePrice24 = 68.40;

    return {
      unitSingular: 'bottle',
      unitPlural: 'bottles',
      packOptions: [
        {
          id: 'caddy',
          name: '6-Bottle Half Case',
          shortLabel: '6-Bottle Half',
          units: 6,
          unitPrice: unitPrice6,
          casePrice: casePrice6,
          marginPercent: Number((((msrp - unitPrice6) / msrp) * 100).toFixed(1)),
          unitSingular: 'bottle',
          unitPlural: 'bottles',
        },
        {
          id: 'master',
          name: '12-Bottle Full Case',
          shortLabel: '12-Bottle Case',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'bottle',
          unitPlural: 'bottles',
        },
        {
          id: 'pallet',
          name: '24-Bottle Master Shipper',
          shortLabel: '24-Bottle Shipper',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'bottle',
          unitPlural: 'bottles',
        },
      ],
    };
  }

  // 13. Amos Peelerz (70wholesale: 6 bags $16.50, 12 bags $33.00)
  if (categorySlug === 'amos-peelerz' || nameLower.includes('peelerz')) {
    const unitPrice6 = 2.75;
    const casePrice6 = 16.50;
    const unitPrice12 = 2.75;
    const casePrice12 = 33.00;
    const unitPrice24 = 2.65;
    const casePrice24 = 63.60;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '6-Bag Half Case',
          shortLabel: '6-Bag Half',
          units: 6,
          unitPrice: unitPrice6,
          casePrice: casePrice6,
          marginPercent: Number((((msrp - unitPrice6) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '12-Bag Full Case',
          shortLabel: '12-Bag Full Case',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '24-Bag Master Shipper',
          shortLabel: '24-Bag Shipper',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 14. Sour Strips Bites (70wholesale: 10 bags at $31.00)
  if (nameLower.includes('sour strips bites') || nameLower.includes('bites')) {
    const unitPrice10 = 3.10;
    const casePrice10 = 31.00;
    const unitPrice20 = 3.00;
    const casePrice20 = 60.00;
    const unitPrice40 = 2.90;
    const casePrice40 = 116.00;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '10-Bag Retail Case',
          shortLabel: '10-Bag Case',
          units: 10,
          unitPrice: unitPrice10,
          casePrice: casePrice10,
          marginPercent: Number((((msrp - unitPrice10) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '20-Bag Master Shipper',
          shortLabel: '20-Bag Master',
          units: 20,
          unitPrice: unitPrice20,
          casePrice: casePrice20,
          marginPercent: Number((((msrp - unitPrice20) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '40-Bag Pallet Tier',
          shortLabel: '40-Bag Pallet',
          units: 40,
          unitPrice: unitPrice40,
          casePrice: casePrice40,
          marginPercent: Number((((msrp - unitPrice40) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 15. Standard Sour Strips 3.7 oz (70wholesale: $2.65 - $2.75 / pack wholesale)
  if (categorySlug === 'sour-strips' || nameLower.includes('sour strips')) {
    const unitPrice12 = 2.65;
    const casePrice12 = 31.80;
    const unitPrice24 = 2.55;
    const casePrice24 = 61.20;
    const unitPrice48 = 2.45;
    const casePrice48 = 117.60;

    return {
      unitSingular: 'pack',
      unitPlural: 'packs',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Pack Display Caddy',
          shortLabel: '12-Pack Caddy',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'pack',
          unitPlural: 'packs',
        },
        {
          id: 'master',
          name: '24-Pack Master Shipper',
          shortLabel: '24-Pack Master',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'pack',
          unitPlural: 'packs',
        },
        {
          id: 'pallet',
          name: '48-Pack Floor Stand Shipper',
          shortLabel: '48-Pack Stand',
          units: 48,
          unitPrice: unitPrice48,
          casePrice: casePrice48,
          marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
          unitSingular: 'pack',
          unitPlural: 'packs',
        },
      ],
    };
  }

  // 16. Hola Saladitos (70wholesale: 10 pcs at $12.50)
  if (nameLower.includes('saladito')) {
    const unitPrice10 = 1.25;
    const casePrice10 = 12.50;
    const unitPrice20 = 1.20;
    const casePrice20 = 24.00;
    const unitPrice40 = 1.15;
    const casePrice40 = 46.00;

    return {
      unitSingular: 'pack',
      unitPlural: 'packs',
      packOptions: [
        {
          id: 'caddy',
          name: '10-Pack Display Box',
          shortLabel: '10-Pack Box',
          units: 10,
          unitPrice: unitPrice10,
          casePrice: casePrice10,
          marginPercent: Number((((msrp - unitPrice10) / msrp) * 100).toFixed(1)),
          unitSingular: 'pack',
          unitPlural: 'packs',
        },
        {
          id: 'master',
          name: '20-Pack Master Shipper',
          shortLabel: '20-Pack Master',
          units: 20,
          unitPrice: unitPrice20,
          casePrice: casePrice20,
          marginPercent: Number((((msrp - unitPrice20) / msrp) * 100).toFixed(1)),
          unitSingular: 'pack',
          unitPlural: 'packs',
        },
        {
          id: 'pallet',
          name: '40-Pack Floor Display',
          shortLabel: '40-Pack Display',
          units: 40,
          unitPrice: unitPrice40,
          casePrice: casePrice40,
          marginPercent: Number((((msrp - unitPrice40) / msrp) * 100).toFixed(1)),
          unitSingular: 'pack',
          unitPlural: 'packs',
        },
      ],
    };
  }

  // 17. Lucas Gummies (70wholesale: 12 bags at $26.00)
  if (nameLower.includes('lucas')) {
    const unitPrice12 = 2.166;
    const casePrice12 = 26.00;
    const unitPrice24 = 2.083;
    const casePrice24 = 50.00;
    const unitPrice48 = 2.00;
    const casePrice48 = 96.00;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Bag Display Caddy',
          shortLabel: '12-Bag Caddy',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '24-Bag Master Shipper',
          shortLabel: '24-Bag Master',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '48-Bag Floor Stand',
          shortLabel: '48-Bag Stand',
          units: 48,
          unitPrice: unitPrice48,
          casePrice: casePrice48,
          marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 18. Nerds Gummy Clusters (70wholesale: 12 pieces at $31.00)
  if (nameLower.includes('nerds')) {
    const unitPrice12 = 2.583;
    const casePrice12 = 31.00;
    const unitPrice24 = 2.50;
    const casePrice24 = 60.00;
    const unitPrice48 = 2.40;
    const casePrice48 = 115.20;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '12-Bag Display Caddy',
          shortLabel: '12-Bag Caddy',
          units: 12,
          unitPrice: unitPrice12,
          casePrice: casePrice12,
          marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '24-Bag Master Shipper',
          shortLabel: '24-Bag Master',
          units: 24,
          unitPrice: unitPrice24,
          casePrice: casePrice24,
          marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '48-Bag Pallet Tier',
          shortLabel: '48-Bag Pallet',
          units: 48,
          unitPrice: unitPrice48,
          casePrice: casePrice48,
          marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 19. Sabritas Mexican Chips (Cheetos, Tostitos, Fritos, Crujiente, Adobadas, Turbos, Dinamita)
  // Standard Mexican convenience store wholesale case: 20-bag caddy / 40-bag master
  if (categorySlug === 'mexican-chips' || nameLower.includes('sabritas')) {
    const unitPrice20 = 2.45;
    const casePrice20 = 49.00;
    const unitPrice40 = 2.35;
    const casePrice40 = 94.00;
    const unitPrice80 = 2.25;
    const casePrice80 = 180.00;

    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      packOptions: [
        {
          id: 'caddy',
          name: '20-Bag Retail Case',
          shortLabel: '20-Bag Case',
          units: 20,
          unitPrice: unitPrice20,
          casePrice: casePrice20,
          marginPercent: Number((((msrp - unitPrice20) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'master',
          name: '40-Bag Master Shipper',
          shortLabel: '40-Bag Master',
          units: 40,
          unitPrice: unitPrice40,
          casePrice: casePrice40,
          marginPercent: Number((((msrp - unitPrice40) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
        {
          id: 'pallet',
          name: '80-Bag Half Pallet',
          shortLabel: '80-Bag Pallet',
          units: 80,
          unitPrice: unitPrice80,
          casePrice: casePrice80,
          marginPercent: Number((((msrp - unitPrice80) / msrp) * 100).toFixed(1)),
          unitSingular: 'bag',
          unitPlural: 'bags',
        },
      ],
    };
  }

  // 20. Default Generic Candy, Snacks, Jerky, Chips (Snak Club, Haribo, American Gourmet, Jack Link's)
  const isJerky = categorySlug.includes('jerky') || nameLower.includes('jerky');
  const unitPrice12 = isJerky ? Number((msrp * 0.58).toFixed(2)) : Number((msrp * 0.50).toFixed(2));
  const casePrice12 = Number((unitPrice12 * 12).toFixed(2));
  const unitPrice24 = isJerky ? Number((msrp * 0.54).toFixed(2)) : Number((msrp * 0.47).toFixed(2));
  const casePrice24 = Number((unitPrice24 * 24).toFixed(2));
  const unitPrice48 = isJerky ? Number((msrp * 0.50).toFixed(2)) : Number((msrp * 0.44).toFixed(2));
  const casePrice48 = Number((unitPrice48 * 48).toFixed(2));

  return {
    unitSingular: 'bag',
    unitPlural: 'bags',
    packOptions: [
      {
        id: 'caddy',
        name: '12-Bag Display Caddy',
        shortLabel: '12-Bag Caddy',
        units: 12,
        unitPrice: unitPrice12,
        casePrice: casePrice12,
        marginPercent: Number((((msrp - unitPrice12) / msrp) * 100).toFixed(1)),
        unitSingular: 'bag',
        unitPlural: 'bags',
      },
      {
        id: 'master',
        name: '24-Bag Master Shipper',
        shortLabel: '24-Bag Master',
        units: 24,
        unitPrice: unitPrice24,
        casePrice: casePrice24,
        marginPercent: Number((((msrp - unitPrice24) / msrp) * 100).toFixed(1)),
        unitSingular: 'bag',
        unitPlural: 'bags',
      },
      {
        id: 'pallet',
        name: '48-Bag Floor Stand Shipper',
        shortLabel: '48-Bag Stand',
        units: 48,
        unitPrice: unitPrice48,
        casePrice: casePrice48,
        marginPercent: Number((((msrp - unitPrice48) / msrp) * 100).toFixed(1)),
        unitSingular: 'bag',
        unitPlural: 'bags',
      },
    ],
  };
}

function generateWholesaleCatalog(): WholesaleItem[] {
  const items: WholesaleItem[] = [];
  const seenIds = new Set<string>();

  // Include all products from all collections to give a rich, comprehensive wholesale catalog
  const collectionsToInclude = [
    ...BEST_SELLER_CATEGORIES.map((c) => ({ slug: c.slug, name: c.name })),
    { slug: 'all-protein-bars', name: 'Protein & Cookies' },
    { slug: 'all-candy', name: 'Commercial Candy' },
    { slug: 'all-chips', name: 'Specialty Chips' },
    { slug: 'all-beef-jerky', name: 'Artisan Jerky' },
  ];

  for (const category of collectionsToInclude) {
    const products = PRODUCTS_BY_COLLECTION[category.slug] || [];

    products.forEach((product: Product, index: number) => {
      if (seenIds.has(product.id)) return;
      seenIds.add(product.id);

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

      const { unitSingular, unitPlural, packOptions } = generatePackOptions(
        category.slug,
        msrp,
        product.name
      );

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
        unitSingular,
        unitPlural,
      });
    });
  }

  return items;
}

export const ALL_WHOLESALE_ITEMS: WholesaleItem[] = generateWholesaleCatalog();

export const WHOLESALE_CATEGORIES = [
  'All Cases',
  ...Array.from(new Set(ALL_WHOLESALE_ITEMS.map((item) => item.category))),
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
