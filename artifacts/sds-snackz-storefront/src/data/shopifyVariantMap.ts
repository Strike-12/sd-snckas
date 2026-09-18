import mapData from './shopifyVariantMap.json';

export const SHOPIFY_VARIANT_MAP: Record<string, number> = mapData as Record<string, number>;

export function getShopifyVariantId(handle: string, defaultId?: string): string | number {
  if (SHOPIFY_VARIANT_MAP[handle]) {
    return SHOPIFY_VARIANT_MAP[handle];
  }
  return defaultId || '';
}

export function buildShopifyCartUrl(items: Array<{ handle: string; id: string; quantity: number }>): string {
  const parts: string[] = [];
  
  for (const item of items) {
    const variantId = SHOPIFY_VARIANT_MAP[item.handle];
    if (variantId) {
      parts.push(`${variantId}:${item.quantity}`);
    }
  }

  if (parts.length > 0) {
    return `https://www.sdsnackz.com/cart/${parts.join(',')}`;
  }
  return 'https://www.sdsnackz.com/cart';
}
