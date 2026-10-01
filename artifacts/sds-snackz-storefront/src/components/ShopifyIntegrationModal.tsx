import { Lock, X } from 'lucide-react';

interface ShopifyIntegrationModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShopifyIntegrationModal({ open, onClose }: ShopifyIntegrationModalProps) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: 'rgba(15, 23, 42, 0.68)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="shopify-checkout-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(100%, 520px)',
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          color: '#173c43',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <h2 id="shopify-checkout-title" style={{ margin: 0, fontSize: 21 }}>
            Secure Shopify checkout
          </h2>
          <button type="button" onClick={onClose} aria-label="Close checkout information">
            <X size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 18, lineHeight: 1.55 }}>
          <Lock size={18} style={{ flex: '0 0 auto', marginTop: 2, color: '#047857' }} />
          <p style={{ margin: 0 }}>
            Payment details are entered on Shopify, not in this storefront. Shopify confirms live product
            availability and calculates the final price, shipping, and tax during checkout.
          </p>
        </div>
        <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.55, margin: '14px 0 0' }}>
          Payment methods depend on what the store owner enables in Shopify Admin under Settings → Payments.
          This storefront never collects payment details or marks an order as paid by itself.
        </p>
      </section>
    </div>
  );
}