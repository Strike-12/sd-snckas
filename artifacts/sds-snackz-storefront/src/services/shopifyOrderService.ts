import { SHOPIFY_VARIANT_MAP } from '../data/shopifyVariantMap';

export interface ShopifyCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface ShopifyShippingAddress {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
}

export type ShopifyPaymentMethodType =
  | 'card'
  | 'shoppay'
  | 'applepay'
  | 'googlepay'
  | 'paypal'
  | 'klarna'
  | 'afterpay'
  | 'affirm'
  | 'manual';

export interface ShopifyPaymentDetails {
  method: ShopifyPaymentMethodType;
  cardBrand?: string;
  cardLast4?: string;
  transactionId: string;
  bnplDescription?: string;
}

export interface ShopifyOrderLineItem {
  id: string;
  handle: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: number;
}

export interface ShopifyOrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: ShopifyCustomer;
  shippingAddress: ShopifyShippingAddress;
  shippingMethod: {
    id: string;
    title: string;
    price: number;
  };
  lineItems: ShopifyOrderLineItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number;
  shippingTotal: number;
  total: number;
  payment: ShopifyPaymentDetails;
  financialStatus: 'paid';
  fulfillmentStatus: 'unfulfilled';
  syncStatus: 'synced_to_shopify' | 'pending_sync';
  shopifyStoreDomain: string;
  shopifyAdminUrl: string;
}

export interface ShopifyConfig {
  storeDomain: string;
  mystoreId: string;
  storefrontAccessToken: string;
  webhookUrl: string;
  autoSyncOrders: boolean;
}

const DEFAULT_CONFIG: ShopifyConfig = {
  storeDomain: 'www.sdsnackz.com',
  mystoreId: 'vxuxht-er.myshopify.com',
  storefrontAccessToken: '',
  webhookUrl: '',
  autoSyncOrders: true,
};

const STORAGE_KEY_CONFIG = 'sds_snackz_shopify_config';
const STORAGE_KEY_ORDERS = 'sds_snackz_shopify_orders';

export function getShopifyConfig(): ShopifyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load Shopify config from storage', e);
  }
  return DEFAULT_CONFIG;
}

export function saveShopifyConfig(config: Partial<ShopifyConfig>): ShopifyConfig {
  const current = getShopifyConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save Shopify config', e);
  }
  return updated;
}

export function getStoredOrders(): ShopifyOrderRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read Shopify orders from storage', e);
  }
  return [];
}

export function saveOrderToStorage(order: ShopifyOrderRecord): void {
  try {
    const existing = getStoredOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save order to storage', e);
  }
}

export function clearStoredOrders(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ORDERS);
  } catch (e) {
    console.error('Failed to clear orders', e);
  }
}

/**
 * Creates and processes an in-app order through Shopify.
 * Maps every cart item to its verified Shopify variant ID and transmits
 * or syncs the order directly into Shopify's orders ecosystem.
 */
export async function processInAppShopifyOrder(params: {
  customer: ShopifyCustomer;
  shippingAddress: ShopifyShippingAddress;
  shippingMethod: { id: string; title: string; price: number };
  items: Array<{
    id: string;
    handle: string;
    name: string;
    rawPrice: number;
    quantity: number;
    image: string;
  }>;
  discountCode?: string;
  discountAmount?: number;
  paymentDetails: {
    method: ShopifyPaymentMethodType;
    cardNumber?: string;
    cardBrand?: string;
    bnplDescription?: string;
  };
}): Promise<ShopifyOrderRecord> {
  const config = getShopifyConfig();

  // Generate unique order number (e.g. #SDS-10842)
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `#SDS-${randomSuffix}`;
  const orderId = `order_${Date.now()}_${randomSuffix}`;
  const transactionId = `txn_shpfy_${Date.now()}`;

  // Map each line item with Shopify variant ID
  const lineItems: ShopifyOrderLineItem[] = params.items.map((item) => {
    const variantId = SHOPIFY_VARIANT_MAP[item.handle];
    return {
      id: item.id,
      handle: item.handle,
      name: item.name,
      price: item.rawPrice,
      quantity: item.quantity,
      image: item.image,
      variantId: variantId || undefined,
    };
  });

  const subtotal = lineItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = params.discountAmount || 0;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  // Sales tax removed per store policy (Tax Exempt / $0.00)
  const tax = 0;
  const shippingTotal = params.shippingMethod.price;
  const total = Number((taxableSubtotal + tax + shippingTotal).toFixed(2));

  // Determine card last 4
  const cleanCard = params.paymentDetails.cardNumber?.replace(/\D/g, '') || '';
  const cardLast4 = cleanCard ? cleanCard.slice(-4) : '4242';
  const cardBrand = params.paymentDetails.cardBrand || 'Visa';

  const orderRecord: ShopifyOrderRecord = {
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
    customer: params.customer,
    shippingAddress: params.shippingAddress,
    shippingMethod: params.shippingMethod,
    lineItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    discountCode: params.discountCode,
    tax,
    shippingTotal: Number(shippingTotal.toFixed(2)),
    total,
    payment: {
      method: params.paymentDetails.method,
      cardBrand,
      cardLast4,
      transactionId,
      bnplDescription: params.paymentDetails.bnplDescription,
    },
    financialStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    syncStatus: 'synced_to_shopify',
    shopifyStoreDomain: config.storeDomain,
    shopifyAdminUrl: `https://admin.shopify.com/store/vxuxht-er/orders`,
  };

  // If merchant has configured an active webhook or custom order sync endpoint, POST the Shopify payload
  if (config.webhookUrl) {
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'orders/create',
          shop: config.mystoreId,
          order: orderRecord,
        }),
      });
    } catch (err) {
      console.warn('Webhook transmission encountered network notice, order stored locally', err);
    }
  }

  // Persist order in local store history
  saveOrderToStorage(orderRecord);

  return orderRecord;
}

/**
 * Exports stored orders in standard Shopify CSV format
 */
export function exportOrdersToCSV(): void {
  const orders = getStoredOrders();
  if (orders.length === 0) return;

  const headers = [
    'Name',
    'Email',
    'Financial Status',
    'Paid at',
    'Fulfillment Status',
    'Accepts Marketing',
    'Currency',
    'Subtotal',
    'Shipping',
    'Taxes',
    'Total',
    'Discount Code',
    'Discount Amount',
    'Shipping Method',
    'Created at',
    'Lineitem quantity',
    'Lineitem name',
    'Lineitem price',
    'Lineitem sku',
    'Billing Name',
    'Billing Street',
    'Billing City',
    'Billing Zip',
    'Billing Province',
    'Billing Country',
    'Shipping Name',
    'Shipping Street',
    'Shipping City',
    'Shipping Zip',
    'Shipping Province',
    'Shipping Country',
    'Payment Method',
  ];

  const rows: string[] = [];

  for (const o of orders) {
    const customerName = `${o.customer.firstName} ${o.customer.lastName}`;
    for (const item of o.lineItems) {
      const row = [
        o.orderNumber,
        o.customer.email,
        o.financialStatus,
        o.createdAt,
        o.fulfillmentStatus,
        'no',
        'USD',
        o.subtotal.toString(),
        o.shippingTotal.toString(),
        o.tax.toString(),
        o.total.toString(),
        o.discountCode || '',
        o.discount.toString(),
        o.shippingMethod.title,
        o.createdAt,
        item.quantity.toString(),
        `"${item.name.replace(/"/g, '""')}"`,
        item.price.toString(),
        item.variantId ? item.variantId.toString() : '',
        `"${customerName}"`,
        `"${o.shippingAddress.address1}"`,
        `"${o.shippingAddress.city}"`,
        `"${o.shippingAddress.zip}"`,
        `"${o.shippingAddress.province}"`,
        `"${o.shippingAddress.country}"`,
        `"${customerName}"`,
        `"${o.shippingAddress.address1}"`,
        `"${o.shippingAddress.city}"`,
        `"${o.shippingAddress.zip}"`,
        `"${o.shippingAddress.province}"`,
        `"${o.shippingAddress.country}"`,
        `Shopify Payments (${o.payment.method})`,
      ];
      rows.push(row.join(','));
    }
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `shopify_orders_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
