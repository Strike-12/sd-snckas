import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Eye,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import {
  ALL_PRODUCTS,
  BEST_SELLER_CATEGORIES,
  PRODUCTS_BY_COLLECTION,
  type Category,
  type Product,
} from './data/productsData';
import { WholesalePortal } from './pages/WholesalePortal';
import { buildShopifyCartUrl } from './data/shopifyVariantMap';
import { ShopifyIntegrationModal } from './components/ShopifyIntegrationModal';

type CartLine = Product & { quantity: number };

const navItems: { label: string; slug: string | null }[] = [
  { label: 'Home', slug: null },
  { label: 'Snacks', slug: 'all-snacks' },
  { label: 'Candy', slug: 'all-candy' },
  { label: 'Chocolate', slug: 'chocolate' },
  { label: 'Chips', slug: 'all-chips' },
  { label: 'Protein Bars', slug: 'all-protein-bars' },
  { label: 'Beef Jerky', slug: 'all-beef-jerky' },
];

function Header({
  cartCount,
  onCart,
  onSearch,
  onSelectCategory,
  onSwitchView,
  onOpenShopifyModal,
}: {
  cartCount: number;
  onCart: () => void;
  onSearch: () => void;
  onSelectCategory: (slug: string | null) => void;
  onSwitchView: (view: 'retail' | 'wholesale') => void;
  onOpenShopifyModal: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (slug: string | null) => {
    onSelectCategory(slug);
    setMenuOpen(false);
    if (slug === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="announcement">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', width: '100%', padding: '0 8px' }}>
          <span>🛍️ <strong>Retail Store:</strong> All items sold as <strong>1 Single Bag</strong></span>
          <span style={{ opacity: 0.5 }}>·</span>
          <button
            type="button"
            onClick={() => onSwitchView('wholesale')}
            style={{
              background: 'none',
              border: 'none',
              color: '#15323c',
              textDecoration: 'underline',
              fontWeight: 800,
              cursor: 'pointer',
              padding: 0,
              fontSize: 'inherit',
              textTransform: 'none',
              letterSpacing: 'normal',
            }}
            data-testid="link-announcement-wholesale"
          >
            Need Cases? Open Wholesale Portal (MOQ $350) →
          </button>
          <span style={{ opacity: 0.5 }}>·</span>
          <button
            type="button"
            onClick={onOpenShopifyModal}
            style={{
              background: 'rgba(21, 50, 60, 0.12)',
              border: '1px solid rgba(21, 50, 60, 0.25)',
              color: '#15323c',
              borderRadius: 6,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '2px 8px',
              fontSize: 11,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            data-testid="button-open-shopify-modal"
          >
            <Download size={11} /> Shopify Checkout / Download App
          </button>
        </div>
      </div>
      <header className="header">
        <div className="nav-wrap">
          <div className="nav-row">
            <button
              className="icon-btn mobile-toggle"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
              data-testid="button-toggle-navigation"
            >
              {menuOpen ? <X size={19} /> : <Menu size={20} />}
            </button>
            <a
              className="brand"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(null);
              }}
              aria-label="SD Snack Distributor home"
              data-testid="link-home-logo"
            >
              <img src="/assets/asset-00.jpg" alt="SD Snack Distributor" />
            </a>
            <nav className="desktop-nav" aria-label="Primary navigation">
              {navItems.map((item, index) => (
                <a
                  className={`nav-link ${index === 0 ? 'active' : ''}`}
                  href={item.slug ? '#products' : '#top'}
                  key={item.label}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.slug);
                  }}
                  data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  {item.label}
                  {index > 0 ? <ChevronDown size={11} strokeWidth={1.8} /> : null}
                </a>
              ))}
              <a
                className="nav-link"
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(null);
                }}
                data-testid="link-nav-catalog"
              >
                Catalog
              </a>
              <a className="nav-link" href="#contact" data-testid="link-nav-contact">
                Contact
              </a>
            </nav>
            <div className="nav-actions">
              {/* Noticeable, professional B2B Wholesale Portal Switch */}
              <button
                type="button"
                className="wholesale-switch-btn"
                onClick={() => onSwitchView('wholesale')}
                data-testid="button-header-wholesale-portal"
                title="Commercial Store Buyers & Distributors (MOQ $350+)"
              >
                <div className="ws-switch-icon-wrap">
                  <Building2 size={13} />
                </div>
                <div className="ws-switch-copy">
                  <span className="ws-switch-main">Wholesale & B2B</span>
                  <span className="ws-switch-sub">Stores · Pallets · MOQ $350</span>
                </div>
              </button>

              <button
                className="icon-btn"
                type="button"
                onClick={onSearch}
                aria-label="Search"
                data-testid="button-open-search"
              >
                <Search size={18} />
              </button>
              <button className="icon-btn" type="button" aria-label="Account" data-testid="button-account">
                <UserRound size={18} />
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={onCart}
                aria-label="Open cart"
                data-testid="button-open-cart"
                style={{ position: 'relative' }}
              >
                <ShoppingBag size={18} />
                {cartCount > 0 ? (
                  <span className="cart-count" data-testid="text-cart-count">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
          {menuOpen ? (
            <nav className="mobile-menu" aria-label="Mobile navigation">
              <button
                type="button"
                className="wholesale-switch-btn"
                style={{ width: '100%', margin: '8px 0 12px', justifyContent: 'center' }}
                onClick={() => {
                  onSwitchView('wholesale');
                  setMenuOpen(false);
                }}
                data-testid="link-mobile-wholesale-portal"
              >
                <div className="ws-switch-icon-wrap">
                  <Building2 size={13} />
                </div>
                <div className="ws-switch-copy">
                  <span className="ws-switch-main">Wholesale Portal</span>
                  <span className="ws-switch-sub">Stores & Pallets · MOQ $350</span>
                </div>
              </button>

              {navItems.map((item) => (
                <a
                  className="nav-link"
                  href={item.slug ? '#products' : '#top'}
                  key={item.label}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.slug);
                  }}
                  data-testid={`link-mobile-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  {item.label}
                </a>
              ))}
              <a className="nav-link" href="#contact" onClick={() => setMenuOpen(false)} data-testid="link-mobile-contact">
                Contact
              </a>
              <button
                type="button"
                className="nav-link"
                style={{
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  color: '#047857',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={() => {
                  onOpenShopifyModal();
                  setMenuOpen(false);
                }}
                data-testid="link-mobile-shopify"
              >
                <Download size={14} /> Shopify Checkout & Download
              </button>
            </nav>
          ) : null}
        </div>
      </header>
    </>
  );
}

function CartDrawer({
  open,
  lines,
  onClose,
  onChangeQuantity,
  onRemove,
  onOpenShopifyModal,
}: {
  open: boolean;
  lines: CartLine[];
  onClose: () => void;
  onChangeQuantity: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
  onOpenShopifyModal: () => void;
}) {
  const [checkingOut, setCheckingOut] = useState(false);
  const subtotal = lines.reduce((total, line) => total + line.rawPrice * line.quantity, 0);

  const handleShopifyCheckout = () => {
    if (lines.length === 0) return;
    setCheckingOut(true);
    const cartUrl = buildShopifyCartUrl(lines);
    window.open(cartUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => setCheckingOut(false), 2000);
  };

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-label="Shopping cart" aria-hidden={!open}>
        <div className="drawer-head">
          <h2>
            Your cart{' '}
            <span style={{ color: '#7a8581', fontSize: 14, fontFamily: 'var(--app-font-sans)' }}>
              ({lines.reduce((n, line) => n + line.quantity, 0)} bags)
            </span>
          </h2>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close cart" data-testid="button-close-cart">
            <X size={19} />
          </button>
        </div>

        {/* Single Unit Retail Reassurance */}
        <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', padding: '8px 16px', fontSize: 12, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🛍️</span>
          <span><strong>Single Unit Retail:</strong> Every item is packaged as 1 single bag.</span>
        </div>

        <div className="drawer-items">
          {lines.length === 0 ? (
            <div className="empty-cart" data-testid="text-empty-cart">
              Your cart is waiting for something delicious.
            </div>
          ) : (
            lines.map((line) => (
              <div className="cart-item" key={line.id} data-testid={`cart-item-${line.id}`}>
                <img src={line.image} alt={line.name} />
                <div className="cart-item-info">
                  <strong>{line.name}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{line.price}</span>
                    <span className="single-unit-badge" style={{ fontSize: 10, padding: '1px 6px' }}>
                      1 Bag
                    </span>
                    <a
                      href={`https://www.sdsnackz.com/products/${line.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shopify-direct-link"
                      title="View on official Shopify store"
                    >
                      Shopify page ↗
                    </a>
                  </div>
                  <div className="qty-row">
                    <button
                      className="qty-btn"
                      type="button"
                      onClick={() => onChangeQuantity(line.id, -1)}
                      aria-label={`Decrease ${line.name}`}
                      data-testid={`button-decrease-${line.id}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span data-testid={`text-quantity-${line.id}`}>{line.quantity}</span>
                    <button
                      className="qty-btn"
                      type="button"
                      onClick={() => onChangeQuantity(line.id, 1)}
                      aria-label={`Increase ${line.name}`}
                      data-testid={`button-increase-${line.id}`}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      className="remove-btn"
                      type="button"
                      onClick={() => onRemove(line.id)}
                      data-testid={`button-remove-${line.id}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {lines.length > 0 ? (
          <div className="drawer-foot">
            <div className="subtotal">
              <div>
                <span>Subtotal</span>
                <span style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 400 }}>
                  ({lines.reduce((n, l) => n + l.quantity, 0)} single bags)
                </span>
              </div>
              <span data-testid="text-cart-subtotal">${subtotal.toFixed(2)}</span>
            </div>
            <button
              className="button"
              type="button"
              onClick={handleShopifyCheckout}
              disabled={checkingOut}
              data-testid="button-checkout"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#047857',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                padding: '12px 16px',
                borderRadius: 8,
                cursor: checkingOut ? 'wait' : 'pointer',
              }}
            >
              <ShoppingBag size={16} />
              {checkingOut ? 'Opening Shopify Checkout...' : 'Checkout on Shopify'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button
                type="button"
                onClick={onOpenShopifyModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 11,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                Need to install or embed storefront on Shopify? Click here ↗
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function getProductBadge(product: Product) {
  const pName = product.name.toLowerCase();
  const pVendor = (product.vendor || '').toLowerCase();
  const pId = product.id.toLowerCase();

  if (pName.includes('peelerz') || pId.includes('peelerz')) {
    return { type: 'badge-viral', text: 'Viral on TikTok' };
  }
  if (
    pName.includes('flamin') ||
    pVendor.includes('sabritas') ||
    pId.includes('sabritas') ||
    pName.includes('turbos') ||
    pName.includes('dinamita')
  ) {
    return { type: 'badge-import', text: 'Mexican Import' };
  }
  if (
    pId.includes('sour-strips') ||
    pId.includes('alien') ||
    pName.includes('el gordo') ||
    pName.includes('rim dip')
  ) {
    return { type: 'badge-popular', text: 'Top Seller' };
  }
  return null;
}

function ProductCard({
  product,
  onAdd,
  onQuickView,
}: {
  product: Product;
  onAdd: (product: Product) => void;
  onQuickView: (product: Product) => void;
}) {
  const badge = getProductBadge(product);

  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      {badge ? (
        <div className="product-badge-overlay">
          <span className={badge.type}>{badge.text}</span>
        </div>
      ) : product.tag ? (
        <span className="pill">{product.tag}</span>
      ) : null}
      <div
        className="product-image"
        onClick={() => onQuickView(product)}
        style={{ cursor: 'pointer', position: 'relative' }}
        title="Click to view details"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/asset-01.png';
          }}
        />
        {/* Single Bag overlay indicator */}
        <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
          <span className="single-unit-badge">1 Single Bag</span>
        </div>
      </div>
      <div className="product-body">
        {product.vendor ? <div className="product-vendor">{product.vendor}</div> : null}
        <h3
          className="product-title"
          onClick={() => onQuickView(product)}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>
        <div className="product-meta">
          <div className="price-box">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="price" data-testid={`text-price-${product.id}`}>
                {product.price}
              </span>
              {product.compareAtPrice ? (
                <span className="compare-price">{product.compareAtPrice}</span>
              ) : null}
            </div>
            <span className="unit-pricing-helper">Price is for 1 bag</span>
          </div>
          <button
            className="add-btn"
            type="button"
            onClick={() => onAdd(product)}
            data-testid={`button-add-${product.id}`}
          >
            Add 1 Bag
          </button>
        </div>
      </div>
    </article>
  );
}

function QuickViewModal({
  product,
  onClose,
  onAdd,
  onOpenWholesale,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
  onOpenWholesale?: () => void;
}) {
  const [qty, setQty] = useState(1);
  if (!product) return null;

  return (
    <div className="quickview-backdrop" onClick={onClose} aria-label="Product quick view modal">
      <div
        className="quickview-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <button
          className="quickview-close"
          type="button"
          onClick={onClose}
          aria-label="Close product view"
        >
          <X size={18} />
        </button>
        <div className="quickview-img">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/asset-01.png';
            }}
          />
        </div>
        <div className="quickview-details">
          {product.vendor ? <div className="product-vendor">{product.vendor}</div> : null}
          <h2 className="quickview-title">{product.name}</h2>
          <div className="quickview-price" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {product.price}
            {product.compareAtPrice ? (
              <span className="compare-price">{product.compareAtPrice}</span>
            ) : null}
            <span style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>/ 1 Single Bag</span>
          </div>

          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              padding: '8px 12px',
              margin: '8px 0 12px',
              fontSize: 12,
              color: '#065f46',
              lineHeight: 1.4,
            }}
          >
            🛡️ <strong>Single Unit Guarantee:</strong> This listing is strictly for <strong>1 individual bag</strong>. Need bulk cases (12–50 bags)?{' '}
            {onOpenWholesale && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWholesale();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                }}
              >
                Open Wholesale Portal
              </button>
            )}
          </div>

          <p className="quickview-desc">
            Directly from SD Snack Distributor. Authentic, high quality, and packaged fresh. Enjoy wholesale
            pricing and quick delivery straight to your door.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <div className="qty-row" style={{ margin: 0, border: '1px solid #dcd4c7', borderRadius: 999, padding: '4px 10px' }}>
              <button
                className="qty-btn"
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
              <button
                className="qty-btn"
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
            <button
              className="button"
              type="button"
              onClick={() => {
                onAdd(product, qty);
                onClose();
              }}
              style={{ flex: 1 }}
            >
              Add {qty} {qty === 1 ? 'Bag' : 'Bags'} to cart
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <a
              href={`https://www.sdsnackz.com/products/${product.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={13} />
              View on official Shopify store (sdsnackz.com) ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPanel({
  open,
  onClose,
  onSelectProduct,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAdd: (product: Product) => void;
}) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        (product.vendor && product.vendor.toLowerCase().includes(q)) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [query]);

  return (
    <>
      <div className={`search-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <section className={`search-panel ${open ? 'open' : ''}`} aria-label="Search store">
        <div className="search-head">
          <Search size={22} color="#173c43" />
          <input
            className="search-input"
            autoFocus={open}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Sour Strips, Takis, Snak Club, Jerky, Peelerz..."
            aria-label="Search products"
            data-testid="input-search-products"
          />
          <button
            className="icon-btn"
            type="button"
            onClick={onClose}
            aria-label="Close search"
            data-testid="button-close-search"
          >
            <X size={20} />
          </button>
        </div>
        {query ? (
          <div style={{ display: 'grid', gap: 8, marginTop: 16, maxHeight: '60vh', overflowY: 'auto' }}>
            {matches.length ? (
              matches.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom: '1px solid #eee5d7',
                  }}
                  data-testid={`link-search-result-${product.id}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: 44, height: 44, objectFit: 'contain', background: '#f5efe6', borderRadius: 8 }}
                  />
                  <div
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#173c43' }}>{product.name}</div>
                    <div style={{ fontSize: 11, color: '#7a8581' }}>{product.categoryName || product.vendor}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#173c43' }}>{product.price}</span>
                  <button
                    className="add-btn"
                    type="button"
                    onClick={() => onAdd(product)}
                    style={{ padding: '6px 10px', fontSize: 10 }}
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <span className="search-hint">No snacks found. Try “Sour Strips”, “Takis”, or “Haribo”.</span>
            )}
          </div>
        ) : (
          <p className="search-hint">
            Popular searches: “Sour Strips”, “Sabritas”, “Snak Club”, “Alien Fresh Jerky”, “Amos Peelerz”
          </p>
        )}
      </section>
    </>
  );
}

function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };
  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <p className="eyebrow">Need a hand?</p>
        <h2 className="section-title">Contact Us Form</h2>
        <p className="section-note">
          Questions about wholesale, a favorite snack, or an order? Send us a note.
        </p>
        {submitted ? (
          <div className="contact-success" data-testid="status-contact-success">
            <Check size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />
            Thanks for reaching out. We’ll be in touch soon.
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} data-testid="form-contact">
            <div className="form-row">
              <input
                className="field"
                name="name"
                placeholder="Name"
                required
                aria-label="Name"
                data-testid="input-contact-name"
              />
              <input
                className="field"
                name="email"
                type="email"
                placeholder="Email *"
                required
                aria-label="Email"
                data-testid="input-contact-email"
              />
            </div>
            <input
              className="field"
              name="phone"
              type="tel"
              placeholder="Phone number"
              aria-label="Phone number"
              data-testid="input-contact-phone"
            />
            <textarea
              className="field"
              name="comment"
              placeholder="Comment"
              required
              aria-label="Comment"
              data-testid="input-contact-comment"
            />
            <button className="button" type="submit" data-testid="button-submit-contact">
              <Send size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />
              Send
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <>
      {open ? (
        <div className="chat-window" data-testid="panel-live-chat">
          <div className="chat-top">
            <span>SDsnackz chat</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ color: '#fff', border: 0, background: 'transparent' }}
              data-testid="button-close-chat"
            >
              <X size={16} />
            </button>
          </div>
          <div className="chat-message">
            {sent
              ? 'Message sent. A snack expert will be with you shortly.'
              : 'Welcome to SDsnackz. How can I help you find your favorite snack?'}
          </div>
          {!sent ? (
            <form
              className="chat-input-wrap"
              onSubmit={(event) => {
                event.preventDefault();
                if (message.trim()) setSent(true);
              }}
            >
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask anything..."
                aria-label="Chat message"
                data-testid="input-chat-message"
              />
              <button type="submit" data-testid="button-send-chat">
                Send
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
      <button
        className="chat-button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        data-testid="button-live-chat"
      >
        <MessageCircle size={15} />
        Live chat
      </button>
    </>
  );
}

const CRAVINGS = [
  { id: 'all', label: 'All Cravings', icon: '⭐' },
  { id: 'spicy', label: 'Spicy & Flamin’', icon: '🌶️' },
  { id: 'sour', label: 'Extreme Sour Strips', icon: '🍋' },
  { id: 'peelerz', label: 'Viral TikTok Peelers', icon: '🥝' },
  { id: 'antojitos', label: 'Mexican Antojitos & Rim Dips', icon: '🇲🇽' },
  { id: 'jerky', label: 'Artisan Beef Jerky', icon: '🥩' },
  { id: 'choc', label: 'European Chocolates', icon: '🍫' },
];

function App() {
  const [view, setView] = useState<'retail' | 'wholesale'>('retail');
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCraving, setActiveCraving] = useState<string>('all');
  const [cart, setCart] = useState<CartLine[]>([]);

  // Sync view state with URL hash
  useEffect(() => {
    const syncHash = () => {
      if (window.location.hash === '#wholesale') {
        setView('wholesale');
      } else if (window.location.hash === '#retail' || window.location.hash === '#top' || !window.location.hash) {
        setView('retail');
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const handleSwitchView = (nextView: 'retail' | 'wholesale') => {
    setView(nextView);
    window.location.hash = nextView;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      return existing
        ? current.map((line) =>
            line.id === product.id ? { ...line, quantity: line.quantity + quantity } : line
          )
        : [...current, { ...product, quantity }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (id: string, amount: number) =>
    setCart((current) =>
      current
        .map((line) => (line.id === id ? { ...line, quantity: line.quantity + amount } : line))
        .filter((line) => line.quantity > 0)
    );

  const removeFromCart = (id: string) =>
    setCart((current) => current.filter((line) => line.id !== id));

  const handleSelectCategory = (slug: string | null) => {
    setSelectedCategory(slug);
    setActiveCraving('all');
    // Smoothly scroll down to products section
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine current products to display
  const currentProducts = useMemo(() => {
    if (activeCraving !== 'all') {
      if (activeCraving === 'spicy') {
        return ALL_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes('flamin') ||
            p.name.toLowerCase().includes('turbos') ||
            p.name.toLowerCase().includes('dinamita') ||
            (p.vendor && p.vendor.toLowerCase().includes('sabritas'))
        );
      }
      if (activeCraving === 'sour') {
        return ALL_PRODUCTS.filter(
          (p) =>
            p.id.includes('sour-strips') ||
            p.name.toLowerCase().includes('sour') ||
            p.id.includes('haribo')
        );
      }
      if (activeCraving === 'peelerz') {
        return PRODUCTS_BY_COLLECTION['amos-peelerz'] || [];
      }
      if (activeCraving === 'antojitos') {
        return [
          ...(PRODUCTS_BY_COLLECTION['micheladas-el-gordo-candy'] || []),
          ...(PRODUCTS_BY_COLLECTION['michelada-cups-rim-dip'] || []),
        ];
      }
      if (activeCraving === 'jerky') {
        return [
          ...(PRODUCTS_BY_COLLECTION['alien-fresh-jerky'] || []),
          ...(PRODUCTS_BY_COLLECTION['old-trapper-beef-jerky'] || []),
        ];
      }
      if (activeCraving === 'choc') {
        return PRODUCTS_BY_COLLECTION['chocolate'] || [];
      }
    }

    if (!selectedCategory) {
      // Default: show popular featured best sellers from across categories
      const sourStrips = (PRODUCTS_BY_COLLECTION['sour-strips'] || []).slice(0, 3);
      const sabritas = (PRODUCTS_BY_COLLECTION['mexican-chips'] || []).slice(0, 3);
      const snakClub = (PRODUCTS_BY_COLLECTION['snak-club'] || []).slice(0, 3);
      const alienJerky = (PRODUCTS_BY_COLLECTION['alien-fresh-jerky'] || []).slice(0, 2);
      const elGordo = (PRODUCTS_BY_COLLECTION['micheladas-el-gordo-candy'] || []).slice(0, 3);
      const peelerz = (PRODUCTS_BY_COLLECTION['amos-peelerz'] || []).slice(0, 3);
      const chocolate = (PRODUCTS_BY_COLLECTION['chocolate'] || []).slice(0, 2);
      const haribo = (PRODUCTS_BY_COLLECTION['haribo'] || []).slice(0, 2);
      return [
        ...sourStrips,
        ...sabritas,
        ...snakClub,
        ...alienJerky,
        ...elGordo,
        ...peelerz,
        ...chocolate,
        ...haribo,
      ];
    }
    return PRODUCTS_BY_COLLECTION[selectedCategory] || [];
  }, [selectedCategory, activeCraving]);

  const activeCategoryObj = useMemo(() => {
    if (activeCraving !== 'all') {
      const cravingObj = CRAVINGS.find((c) => c.id === activeCraving);
      return {
        slug: activeCraving,
        name: cravingObj ? `${cravingObj.icon} ${cravingObj.label}` : 'Craving Selection',
        image: '',
        productCount: currentProducts.length,
      };
    }
    if (!selectedCategory) return null;
    return BEST_SELLER_CATEGORIES.find((c) => c.slug === selectedCategory) || {
      slug: selectedCategory,
      name:
        navItems.find((n) => n.slug === selectedCategory)?.label ||
        selectedCategory.replace('all-', '').replace('-', ' ').toUpperCase(),
      image: '',
      productCount: currentProducts.length,
    };
  }, [selectedCategory, activeCraving, currentProducts]);

  // If in Wholesale mode, render the dedicated B2B Wholesale Portal
  if (view === 'wholesale') {
    return <WholesalePortal onBackToRetail={() => handleSwitchView('retail')} />;
  }

  return (
    <div className="site-shell" id="top">
      <Header
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onSearch={() => setSearchOpen(true)}
        onSelectCategory={handleSelectCategory}
        onSwitchView={handleSwitchView}
        onOpenShopifyModal={() => setShopifyModalOpen(true)}
      />

      {/* Live Trending & Restock Ticker */}
      <div className="ticker-bar" aria-label="Trending snacks announcement">
        <div className="ticker-content">
          <div className="ticker-item">
            <span className="ticker-tag">🔥 Trending</span>
            <span>Amos Peelerz 3D Gummy Peelers Restocked</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-tag">🌶️ Mexican Import</span>
            <span>Sabritas Cheetos Xtra Flamin Hot Direct from Mexico</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-tag">🍬 Viral Drops</span>
            <span>Sour Strips Doubleberry & Bites Single Bags Available</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-tag">🥩 Top Pick</span>
            <span>Alien Fresh Jerky Honey Teriyaki & Space Cowboy</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-tag">🚚 Fast Shipping</span>
            <span>Free Shipping On Orders Over $50</span>
          </div>
          {/* Continuous animation loop duplicates */}
          <div className="ticker-item">
            <span className="ticker-tag">🔥 Trending</span>
            <span>Amos Peelerz 3D Gummy Peelers Restocked</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-tag">🌶️ Mexican Import</span>
            <span>Sabritas Cheetos Xtra Flamin Hot Direct from Mexico</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-tag">🍬 Viral Drops</span>
            <span>Sour Strips Doubleberry & Bites Single Bags Available</span>
          </div>
        </div>
      </div>

      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onAdd={addToCart}
      />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAdd={addToCart}
        onOpenWholesale={() => handleSwitchView('wholesale')}
      />

      <main>
        <section className="hero">
          <img src="/assets/asset-01.png" alt="A colorful spread of snacks and candy" />
          <div className="hero-overlay">
            <button
              className="button"
              type="button"
              onClick={() => handleSelectCategory(null)}
              data-testid="link-hero-shop-all"
            >
              Shop all <ArrowRight size={15} style={{ verticalAlign: 'middle', marginLeft: 7 }} />
            </button>
          </div>
        </section>

        {/* Cravings & Flavor Selector Bar */}
        <section className="cravings-section" aria-label="Snack craving selector">
          <div className="cravings-container">
            <div className="cravings-title-row">
              <div className="cravings-title">
                <Sparkles size={17} color="#f7c945" /> What flavor are you craving right now?
              </div>
              <div className="cravings-proof">
                <Star size={13} fill="#f7c945" color="#f7c945" />
                <span><strong>4.9/5</strong> Rating from 2,800+ Happy Snackers</span>
              </div>
            </div>
            <div className="cravings-pills">
              {CRAVINGS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`cravings-pill ${activeCraving === c.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCraving(c.id);
                    setSelectedCategory(null);
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  data-testid={`button-craving-${c.id}`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section ("Our best sellers, your favorite purchase.") */}
        <section className="section" id="categories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Find your flavor</p>
              <h1 className="section-title">Our best sellers, your favorite purchase.</h1>
              <p className="section-note">
                Click any brand or category below to explore all genuine items in that collection.
              </p>
            </div>
            <button
              className="text-link"
              type="button"
              onClick={() => handleSelectCategory(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              data-testid="link-browse-all"
            >
              Browse all snacks <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
            </button>
          </div>

          <div className="category-grid">
            {BEST_SELLER_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.slug && activeCraving === 'all';
              return (
                <button
                  className={`category-card ${isActive ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => handleSelectCategory(category.slug)}
                  key={category.slug}
                  data-testid={`card-category-${category.slug}`}
                  aria-pressed={isActive}
                >
                  <div className="category-image">
                    <img src={category.image} alt={category.name} />
                  </div>
                  <div className="category-name">{category.name}</div>
                  <span className="category-cta">
                    {isActive ? (
                      <span style={{ color: 'hsl(var(--primary))', fontWeight: 700 }}>
                        Viewing ({category.productCount})
                      </span>
                    ) : (
                      <>
                        See Products ({category.productCount}){' '}
                        <ArrowRight size={11} style={{ verticalAlign: 'middle', marginLeft: 2 }} />
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Products Section */}
        <section className="product-section" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stock up on good stuff</p>
              <h2 className="section-title">
                {activeCategoryObj ? activeCategoryObj.name : 'Best sellers'}
              </h2>
              <p className="section-note">
                {activeCategoryObj
                  ? `Showing all ${currentProducts.length} authentic snacks in this collection.`
                  : 'The snacks that disappear first. Pick a category above or choose from favorites below.'}
              </p>
            </div>
            <a className="text-link" href="#categories" data-testid="link-view-categories">
              Shop by category <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
            </a>
          </div>

          {/* Filter Pills Bar */}
          <div className="filter-pills-bar" aria-label="Category filters">
            <button
              type="button"
              className={`filter-pill ${selectedCategory === null && activeCraving === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(null);
                setActiveCraving('all');
              }}
              data-testid="filter-pill-all"
            >
              All Best Sellers
              <span className="pill-count">Featured</span>
            </button>
            {BEST_SELLER_CATEGORIES.map((cat) => (
              <button
                type="button"
                className={`filter-pill ${selectedCategory === cat.slug && activeCraving === 'all' ? 'active' : ''}`}
                key={cat.slug}
                onClick={() => handleSelectCategory(cat.slug)}
                data-testid={`filter-pill-${cat.slug}`}
              >
                {cat.name}
                <span className="pill-count">{cat.productCount}</span>
              </button>
            ))}
          </div>

          {/* Active Filter Banner */}
          {activeCategoryObj ? (
            <div className="active-filter-banner">
              <div className="active-filter-text">
                Filtering by <strong>{activeCategoryObj.name}</strong> ·{' '}
                <span>{currentProducts.length} items available</span>
              </div>
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => {
                  setSelectedCategory(null);
                  setActiveCraving('all');
                }}
                data-testid="button-clear-filter"
              >
                <RotateCcw size={14} /> Clear filter (view all)
              </button>
            </div>
          ) : null}

          {/* Retail Single Bag Reassurance Banner */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#0f172a' }}>
              <ShieldCheck size={18} color="#047857" />
              <span><strong>Retail Single Bag Guarantee:</strong> Every item is sold as <strong>1 individual bag</strong> (single unit). Need bulk wholesale cases (12–50 bags)? Visit our Wholesale Portal.</span>
            </div>
            <button
              type="button"
              onClick={() => setShopifyModalOpen(true)}
              style={{ background: 'none', border: 'none', color: '#047857', fontSize: 12, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <ExternalLink size={13} /> Shopify Direct Checkout Info
            </button>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {currentProducts.map((product) => (
              <ProductCard
                product={product}
                onAdd={addToCart}
                onQuickView={(p) => setQuickViewProduct(p)}
                key={product.id}
              />
            ))}
          </div>

          {currentProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#788580' }}>
              No items found in this collection. Try picking another craving or category above!
            </div>
          ) : null}
        </section>

        <section className="split-banner">
          <article className="story-card image">
            <h2>Snack runs, upgraded.</h2>
            <p>
              From crunchy classics to the wildest candy on the shelf, make your next haul a good one.
            </p>
            <button
              className="button"
              type="button"
              onClick={() => handleSelectCategory(null)}
              data-testid="link-story-shop"
            >
              Shop all snacks
            </button>
          </article>
          <article className="story-card color">
            <p className="eyebrow">For convenience stores, bodegas & grocers</p>
            <h2>Wholesale is available.</h2>
            <p>
              Direct distributor pricing by the case or full master pallet. Fast freight & Net 30 terms. Minimum order $350.
            </p>
            <button
              className="button"
              type="button"
              onClick={() => handleSwitchView('wholesale')}
              data-testid="link-wholesale-contact"
            >
              Open B2B Portal (MOQ $350) <ArrowRight size={15} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
            </button>
          </article>
        </section>

        <ContactSection />
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <img className="footer-logo" src="/assets/asset-00.jpg" alt="SD Snack Distributor" />
            <p>
              Shop for the BEST snacks, candy, beef jerky, protein bars, mexican chips/candy, and a whole lot
              more!
            </p>
          </div>
          <div>
            <h3>Shop</h3>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                handleSelectCategory(null);
              }}
              data-testid="link-footer-best-sellers"
            >
              Best sellers
            </a>
            <a href="#categories" data-testid="link-footer-categories">
              Categories
            </a>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                handleSelectCategory(null);
              }}
              data-testid="link-footer-catalog"
            >
              Catalog
            </a>
          </div>
          <div>
            <h3>Wholesale & Help</h3>
            <button
              type="button"
              onClick={() => handleSwitchView('wholesale')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: 0,
                fontSize: 'inherit',
                textAlign: 'left',
                display: 'block',
                lineHeight: 1.8,
                fontWeight: 600,
              }}
              data-testid="link-footer-wholesale"
            >
              🏢 Wholesale Portal (MOQ $350)
            </button>
            <button
              type="button"
              onClick={() => setShopifyModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#047857',
                cursor: 'pointer',
                padding: 0,
                fontSize: 'inherit',
                textAlign: 'left',
                display: 'block',
                lineHeight: 1.8,
                fontWeight: 600,
              }}
              data-testid="link-footer-shopify"
            >
              🔗 Connect to Shopify / Download App
            </button>
            <a href="#contact" data-testid="link-footer-contact">
              Contact
            </a>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                handleSelectCategory(null);
              }}
              data-testid="link-footer-home"
            >
              Home
            </a>
          </div>
          <div>
            <h3>Get in touch</h3>
            <p>support@SDsnackz.com</p>
            <p>San Diego & Southern California Distribution.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SDsnackz · SD Snack Distributor</span>
          <span>Authentic Snacks & Commercial B2B Wholesale</span>
        </div>
      </footer>

      <CartDrawer
        open={cartOpen}
        lines={cart}
        onClose={() => setCartOpen(false)}
        onChangeQuantity={changeQuantity}
        onRemove={removeFromCart}
        onOpenShopifyModal={() => setShopifyModalOpen(true)}
      />
      <ShopifyIntegrationModal
        open={shopifyModalOpen}
        onClose={() => setShopifyModalOpen(false)}
      />
      <ChatWidget />
    </div>
  );
}

export default App;
