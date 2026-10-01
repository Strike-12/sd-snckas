import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
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
  Lock,
} from 'lucide-react';
import {
  ALL_PRODUCTS,
  BEST_SELLER_CATEGORIES,
  PRODUCTS_BY_COLLECTION,
  type Category,
  type Product,
} from './data/productsData';
import { WholesalePortal } from './pages/WholesalePortal';
import { ShopifyIntegrationModal } from './components/ShopifyIntegrationModal';

type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  priceAmount: string;
  currencyCode: string;
};

type ShopifyCatalogProduct = {
  handle: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  variants: ShopifyVariant[];
};

type StoreProduct = Product & {
  shopifyVariants: ShopifyVariant[];
  shopifyCatalogReady: boolean;
};

type CartLine = StoreProduct & {
  quantity: number;
  shopifyVariantId: string;
  shopifyVariantTitle: string;
  shopifyCurrencyCode: string;
};

function formatShopifyPrice(amount: string | number, currencyCode = 'USD') {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 'Price unavailable';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

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
            Need Cases? Open Wholesale Portal (No Minimums) →
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
            <Lock size={11} /> Secure Shopify checkout
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
                title="Commercial Store Buyers & Wholesale Cases (No Minimums)"
              >
                <div className="ws-switch-icon-wrap">
                  <Building2 size={13} />
                </div>
                <div className="ws-switch-copy">
                  <span className="ws-switch-main">Wholesale & B2B</span>
                  <span className="ws-switch-sub">Stores · Cases · No Minimums</span>
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
                  <span className="ws-switch-sub">Stores & Cases · No Minimums</span>
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
                <Lock size={14} /> Secure Shopify checkout
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
  onCheckout,
  checkoutPending,
  checkoutError,
  checkoutFallbackUrl,
}: {
  open: boolean;
  lines: CartLine[];
  onClose: () => void;
  onChangeQuantity: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
  onOpenShopifyModal: () => void;
  onCheckout: () => void;
  checkoutPending: boolean;
  checkoutError: string;
  checkoutFallbackUrl: string | null;
}) {
  const subtotal = lines.reduce((total, line) => total + line.rawPrice * line.quantity, 0);

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-label="Shopping cart" aria-hidden={!open}>
        <div className="drawer-head">
          <h2>
            Your cart{' '}
            <span style={{ color: '#7a8581', fontSize: 14, fontFamily: 'var(--app-font-sans)' }}>
              ({lines.reduce((n, line) => n + line.quantity, 0)} {lines.reduce((n, line) => n + line.quantity, 0) === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close cart" data-testid="button-close-cart">
            <X size={19} />
          </button>
        </div>

        {/* Single Unit Retail Reassurance */}
        <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', padding: '8px 16px', fontSize: 12, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🛍️</span>
          <span><strong>Single Unit Retail:</strong> All products are sold as individual single units.</span>
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
                  {line.shopifyVariantTitle && line.shopifyVariantTitle !== 'Default Title' ? (
                    <div style={{ fontSize: 11, color: '#64748b' }}>{line.shopifyVariantTitle}</div>
                  ) : null}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{line.price}</span>
                    <span className="single-unit-badge" style={{ fontSize: 10, padding: '1px 6px' }}>
                      {getProductPackaging(line).badgeLabel}
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
                      disabled={line.quantity >= 99}
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
                  ({lines.reduce((n, l) => n + l.quantity, 0)} {lines.reduce((n, l) => n + l.quantity, 0) === 1 ? 'single item' : 'single items'})
                </span>
              </div>
              <span data-testid="text-cart-subtotal">
                {formatShopifyPrice(subtotal, lines[0]?.shopifyCurrencyCode)}
              </span>
            </div>
            <button
              className="button"
              type="button"
              onClick={onCheckout}
              disabled={checkoutPending}
              data-testid="button-checkout"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                background: '#047857',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                padding: '12px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                opacity: checkoutPending ? 0.72 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Lock size={15} />
                <span>{checkoutPending ? 'Opening Shopify checkout…' : 'Continue to secure Shopify checkout'}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.9 }}>
                Payment, shipping, and tax are handled by Shopify
              </span>
            </button>
            {checkoutError ? (
              <p role="alert" style={{ color: '#9f1239', fontSize: 12, lineHeight: 1.45, margin: '10px 0 0' }}>
                {checkoutError}
              </p>
            ) : null}
            {checkoutFallbackUrl ? (
              <a
                href={checkoutFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-open-shopify-checkout"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  marginTop: 10,
                  padding: '10px 12px',
                  border: '1px solid #047857',
                  borderRadius: 8,
                  color: '#047857',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Open Shopify checkout in a new tab <ExternalLink size={15} />
              </a>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, fontSize: 11 }}>
              <button
                type="button"
                onClick={onOpenShopifyModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                About secure checkout
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}

export function getProductPackaging(product: { name: string; vendor?: string; categorySlug?: string }): {
  unitSingular: string;
  unitPlural: string;
  badgeLabel: string;
  priceNote: string;
  addBtnLabel: string;
  caseCount: string;
  wholesaleCaseNote: string;
} {
  const name = product.name.toLowerCase();
  const vendor = (product.vendor || '').toLowerCase();
  const slug = (product.categorySlug || '').toLowerCase();

  // 1. Kinder Bueno & Chocolate Bars (70wholesale: 20 pieces per display box at $25.00)
  if (
    name.includes('bueno') ||
    (name.includes('kinder') && !name.includes('joy')) ||
    name.includes('dubaco') ||
    name.includes('pistachio milk chocolate') ||
    (slug === 'chocolate' && !name.includes('biscuits') && !name.includes('joy'))
  ) {
    return {
      unitSingular: 'bar',
      unitPlural: 'bars',
      badgeLabel: '1 Chocolate Bar',
      priceNote: 'Price is for 1 bar',
      addBtnLabel: 'Add 1 Bar',
      caseCount: '20 pieces/box',
      wholesaleCaseNote: 'Need a 20-piece display box ($25.00/box)?',
    };
  }

  // 2. Kinder Joy Chocolates (70wholesale: 16 pieces per box at $30.00)
  if (name.includes('kinder joy')) {
    return {
      unitSingular: 'piece',
      unitPlural: 'pieces',
      badgeLabel: '1 Chocolate Egg',
      priceNote: 'Price is for 1 piece',
      addBtnLabel: 'Add 1 Piece',
      caseCount: '16 pieces/box',
      wholesaleCaseNote: 'Need a 16-piece display box ($30.00/box)?',
    };
  }

  // 3. The Complete Cookie (Lenny & Larry's 4oz) (70wholesale: 12 cookies per box at $23.50)
  if (name.includes('cookie') || vendor.includes('complete cookie')) {
    return {
      unitSingular: 'cookie',
      unitPlural: 'cookies',
      badgeLabel: '1 Cookie',
      priceNote: 'Price is for 1 cookie',
      addBtnLabel: 'Add 1 Cookie',
      caseCount: '12 cookies/box',
      wholesaleCaseNote: 'Need a 12-cookie display box ($23.50/box)?',
    };
  }

  // 4. Legendary Foods Protein Pastries (70wholesale: 10 pastries per box at $29.99)
  if (name.includes('pastry') || name.includes('legendary') || vendor.includes('legendary')) {
    return {
      unitSingular: 'pastry',
      unitPlural: 'pastries',
      badgeLabel: '1 Pastry',
      priceNote: 'Price is for 1 pastry',
      addBtnLabel: 'Add 1 Pastry',
      caseCount: '10 pastries/box',
      wholesaleCaseNote: 'Need a 10-pastry display box ($29.99/box)?',
    };
  }

  // 5. Barebells Protein Bars (70wholesale: 12 bars per box at $27.50)
  if (name.includes('barebells') || vendor.includes('barebells')) {
    return {
      unitSingular: 'bar',
      unitPlural: 'bars',
      badgeLabel: '1 Protein Bar',
      priceNote: 'Price is for 1 bar',
      addBtnLabel: 'Add 1 Bar',
      caseCount: '12 bars/box',
      wholesaleCaseNote: 'Need a 12-bar display box ($27.50/box)?',
    };
  }

  // 6. Takis Crisps & Pringles (15 cans / case for Takis, 12 cans / case for Pringles)
  if (name.includes('crisp') || name.includes('can') || name.includes('pringles') || vendor.includes('pringles')) {
    const count = name.includes('takis') ? '15 cans/case' : '12 cans/case';
    return {
      unitSingular: 'can',
      unitPlural: 'cans',
      badgeLabel: '1 Can',
      priceNote: 'Price is for 1 can',
      addBtnLabel: 'Add 1 Can',
      caseCount: count,
      wholesaleCaseNote: `Need bulk cases (${count})?`,
    };
  }

  // 7. Micheladas El Gordo Cups & Cubanito Mix (70wholesale: 24 cups per case at $72.00)
  if (name.includes('cup') && (name.includes('michelada') || name.includes('el gordo') || name.includes('cubanito'))) {
    return {
      unitSingular: 'cup',
      unitPlural: 'cups',
      badgeLabel: '1 Michelada Cup',
      priceNote: 'Price is for 1 cup',
      addBtnLabel: 'Add 1 Cup',
      caseCount: '24 cups/case',
      wholesaleCaseNote: 'Need a 24-cup master case ($72.00/case)?',
    };
  }

  // 8. Pulparindo & Michelada Rim Dips (70wholesale: 12 tubs per case at $42.00)
  if (name.includes('rim dip') || name.includes('rimming dip') || name.includes('dip')) {
    return {
      unitSingular: 'tub',
      unitPlural: 'tubs',
      badgeLabel: '1 Rim Dip Tub',
      priceNote: 'Price is for 1 tub',
      addBtnLabel: 'Add 1 Tub',
      caseCount: '12 tubs/case',
      wholesaleCaseNote: 'Need a 12-tub master case ($42.00/case)?',
    };
  }

  // 9. De La Rosa Squeeze Paste & Michelada Mix Bottles (70wholesale: 6–12 bottles/case)
  if (name.includes('squeeze') || name.includes('bottle') || name.includes('paste')) {
    return {
      unitSingular: 'bottle',
      unitPlural: 'bottles',
      badgeLabel: '1 Bottle',
      priceNote: 'Price is for 1 bottle',
      addBtnLabel: 'Add 1 Bottle',
      caseCount: '6–12 bottles/case',
      wholesaleCaseNote: 'Need bulk cases (6–12 bottles)?',
    };
  }

  // 10. Hola Saladitos (70wholesale: 10 packs per box at $12.50)
  if (name.includes('saladito') || vendor.includes('saladito')) {
    return {
      unitSingular: 'pack',
      unitPlural: 'packs',
      badgeLabel: '1 Pack',
      priceNote: 'Price is for 1 pack',
      addBtnLabel: 'Add 1 Pack',
      caseCount: '10 packs/box',
      wholesaleCaseNote: 'Need a 10-pack display box ($12.50/box)?',
    };
  }

  // 11. Sour Strips (Trays vs Bites)
  if (slug === 'sour-strips' || name.includes('sour strips')) {
    if (name.includes('bites')) {
      return {
        unitSingular: 'bag',
        unitPlural: 'bags',
        badgeLabel: '1 Pouch Bag',
        priceNote: 'Price is for 1 bag',
        addBtnLabel: 'Add 1 Bag',
        caseCount: '10 bags/case',
        wholesaleCaseNote: 'Need a 10-bag retail case ($31.00/case)?',
      };
    }
    return {
      unitSingular: 'pack',
      unitPlural: 'packs',
      badgeLabel: '1 Pack',
      priceNote: 'Price is for 1 pack',
      addBtnLabel: 'Add 1 Pack',
      caseCount: '12 packs/caddy',
      wholesaleCaseNote: 'Need a 12-pack display caddy ($31.80/caddy)?',
    };
  }

  // 12. Alien Fresh Jerky (70wholesale: 25 bags per master case at $177.50)
  if (slug === 'alien-fresh-jerky' || name.includes('alien fresh')) {
    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      badgeLabel: '1 Jerky Bag',
      priceNote: 'Price is for 1 bag',
      addBtnLabel: 'Add 1 Bag',
      caseCount: '25 bags/case',
      wholesaleCaseNote: 'Need a 25-bag master case ($177.50/case)?',
    };
  }

  // 13. Country Archer Jerky (70wholesale: 12 bags per full case at $54.00)
  if (name.includes('country archer') || vendor.includes('country archer')) {
    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      badgeLabel: '1 Jerky Bag',
      priceNote: 'Price is for 1 bag',
      addBtnLabel: 'Add 1 Bag',
      caseCount: '12 bags/case',
      wholesaleCaseNote: 'Need a 12-bag full case ($54.00/case)?',
    };
  }

  // 14. Takis 3.25 oz (70wholesale: 20 bags per case at $32.50)
  if (name.includes('takis') && !name.includes('9.9')) {
    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      badgeLabel: '1 Bag',
      priceNote: 'Price is for 1 bag',
      addBtnLabel: 'Add 1 Bag',
      caseCount: '20 bags/case',
      wholesaleCaseNote: 'Need a 20-bag retail case ($32.50/case)?',
    };
  }

  // 15. Sabritas Mexican Chips (70wholesale: 20 bags per case at $49.00)
  if (slug === 'mexican-chips' || name.includes('sabritas') || vendor.includes('sabritas')) {
    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      badgeLabel: '1 Bag',
      priceNote: 'Price is for 1 bag',
      addBtnLabel: 'Add 1 Bag',
      caseCount: '20 bags/case',
      wholesaleCaseNote: 'Need a 20-bag retail case ($49.00/case)?',
    };
  }

  // 16. Amos Peelerz (70wholesale: 12 bags full case at $33.00)
  if (slug === 'amos-peelerz' || name.includes('peelerz')) {
    return {
      unitSingular: 'bag',
      unitPlural: 'bags',
      badgeLabel: '1 Gummy Bag',
      priceNote: 'Price is for 1 bag',
      addBtnLabel: 'Add 1 Bag',
      caseCount: '12 bags/case',
      wholesaleCaseNote: 'Need a 12-bag full case ($33.00/case)?',
    };
  }

  // 17. Default single bag
  return {
    unitSingular: 'bag',
    unitPlural: 'bags',
    badgeLabel: '1 Single Bag',
    priceNote: 'Price is for 1 bag',
    addBtnLabel: 'Add 1 Bag',
    caseCount: '12–24 bags/case',
    wholesaleCaseNote: 'Need bulk master cases?',
  };
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
  product: StoreProduct;
  onAdd: (product: StoreProduct, quantity?: number, variant?: ShopifyVariant) => void;
  onQuickView: (product: StoreProduct) => void;
}) {
  const badge = getProductBadge(product);
  const availableVariants = product.shopifyVariants.filter((variant) => variant.availableForSale);
  const canPurchase = product.shopifyCatalogReady && availableVariants.length > 0;
  const packaging = getProductPackaging(product);

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
        {/* Dynamic unit overlay indicator */}
        <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
          <span className="single-unit-badge">{packaging.badgeLabel}</span>
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
            <span className="unit-pricing-helper">{packaging.priceNote}</span>
          </div>
          <button
            className="add-btn"
            type="button"
            onClick={() => {
              if (availableVariants.length === 1) onAdd(product, 1, availableVariants[0]);
              else onQuickView(product);
            }}
            disabled={!canPurchase}
            title={!product.shopifyCatalogReady ? 'Checking live Shopify availability' : undefined}
            data-testid={`button-add-${product.id}`}
          >
            {!product.shopifyCatalogReady
              ? 'Checking…'
              : !canPurchase
                ? 'Unavailable'
                : availableVariants.length > 1
                  ? 'Choose options'
                  : packaging.addBtnLabel}
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
  product: StoreProduct | null;
  onClose: () => void;
  onAdd: (product: StoreProduct, quantity: number, variant?: ShopifyVariant) => void;
  onOpenWholesale?: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  useEffect(() => {
    const firstAvailable = product?.shopifyVariants.find((variant) => variant.availableForSale);
    setSelectedVariantId(firstAvailable?.id ?? '');
    setQty(1);
  }, [product?.id]);
  if (!product) return null;
  const availableVariants = product.shopifyVariants.filter((variant) => variant.availableForSale);
  const selectedVariant = availableVariants.find((variant) => variant.id === selectedVariantId);
  const packaging = getProductPackaging(product);

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
            {selectedVariant
              ? formatShopifyPrice(selectedVariant.priceAmount, selectedVariant.currencyCode)
              : product.price}
            {product.compareAtPrice ? (
              <span className="compare-price">{product.compareAtPrice}</span>
            ) : null}
            <span style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>/ {packaging.badgeLabel}</span>
          </div>
          {availableVariants.length > 1 ? (
            <label style={{ display: 'grid', gap: 5, marginTop: 12, fontSize: 12, fontWeight: 600 }}>
              Choose an option
              <select
                value={selectedVariantId}
                onChange={(event) => setSelectedVariantId(event.target.value)}
                style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                aria-label={`Choose an option for ${product.name}`}
              >
                {availableVariants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title} — {formatShopifyPrice(variant.priceAmount, variant.currencyCode)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {!product.shopifyCatalogReady || availableVariants.length === 0 ? (
            <p role="status" style={{ color: '#9f1239', fontSize: 12 }}>
              {!product.shopifyCatalogReady
                ? 'Live Shopify availability is still loading.'
                : 'This product is currently unavailable for purchase.'}
            </p>
          ) : null}

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
            🛡️ <strong>Single Unit Guarantee:</strong> This listing is strictly for <strong>1 individual {packaging.unitSingular}</strong>. {packaging.wholesaleCaseNote}{' '}
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
                Go to Wholesale Portal →
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
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
                disabled={qty >= 99}
              >
                <Plus size={12} />
              </button>
            </div>
            <button
              className="button"
              type="button"
              onClick={() => {
                if (selectedVariant) onAdd(product, qty, selectedVariant);
                onClose();
              }}
              disabled={!selectedVariant}
              style={{ flex: 1 }}
            >
              Add {qty} {qty === 1 ? packaging.unitSingular.charAt(0).toUpperCase() + packaging.unitSingular.slice(1) : packaging.unitPlural.charAt(0).toUpperCase() + packaging.unitPlural.slice(1)} to cart
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
  products,
}: {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: StoreProduct) => void;
  onAdd: (product: StoreProduct) => void;
  products: StoreProduct[];
}) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        (product.vendor && product.vendor.toLowerCase().includes(q)) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [query, products]);

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
                    disabled={
                      !product.shopifyCatalogReady ||
                      !product.shopifyVariants.some((variant) => variant.availableForSale)
                    }
                    style={{ padding: '6px 10px', fontSize: 10 }}
                  >
                    {!product.shopifyCatalogReady
                      ? 'Checking…'
                      : product.shopifyVariants.some((variant) => variant.availableForSale)
                        ? product.shopifyVariants.filter((variant) => variant.availableForSale).length > 1
                          ? 'Choose'
                          : 'Add'
                        : 'Unavailable'}
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
  { id: 'all', label: "I'm not picky", icon: '⭐' },
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
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCraving, setActiveCraving] = useState<string>('all');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [shopifyCatalog, setShopifyCatalog] = useState<ShopifyCatalogProduct[]>([]);
  const [catalogState, setCatalogState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [catalogError, setCatalogError] = useState('');
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutFallbackUrl, setCheckoutFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogState('loading');
    setCatalogError('');
    fetch('/api/shopify/products', { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            typeof payload.error === 'string'
              ? payload.error
              : 'Live Shopify products could not be loaded.',
          );
        }
        if (!Array.isArray(payload.products)) {
          throw new Error('Shopify returned an invalid product catalog.');
        }
        return payload.products as ShopifyCatalogProduct[];
      })
      .then((products) => {
        setShopifyCatalog(products);
        setCatalogState('ready');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setCatalogError(error instanceof Error ? error.message : 'Shopify products could not be loaded.');
        setCatalogState('error');
      });

    return () => controller.abort();
  }, [catalogRetry]);

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

  const shopifyProductsByHandle = useMemo(
    () => new Map(shopifyCatalog.map((product) => [product.handle, product])),
    [shopifyCatalog],
  );

  const allStoreProducts = useMemo(
    () =>
      ALL_PRODUCTS.map((product): StoreProduct => {
        const liveProduct = shopifyProductsByHandle.get(product.handle);
        const variants = liveProduct?.variants ?? [];
        const lowestPricedVariant = [...variants]
          .filter((variant) => Number.isFinite(Number(variant.priceAmount)))
          .sort((a, b) => Number(a.priceAmount) - Number(b.priceAmount))[0];
        return {
          ...product,
          name: liveProduct?.title ?? product.name,
          image: liveProduct?.imageUrl || product.image,
          price: lowestPricedVariant
            ? formatShopifyPrice(lowestPricedVariant.priceAmount, lowestPricedVariant.currencyCode)
            : product.price,
          rawPrice: lowestPricedVariant ? Number(lowestPricedVariant.priceAmount) : product.rawPrice,
          compareAtPrice: liveProduct ? undefined : product.compareAtPrice,
          available: variants.some((variant) => variant.availableForSale),
          shopifyVariants: variants,
          shopifyCatalogReady: catalogState === 'ready',
        };
      }),
    [shopifyProductsByHandle, catalogState],
  );
  const storeProductsByHandle = useMemo(
    () => new Map(allStoreProducts.map((product) => [product.handle, product])),
    [allStoreProducts],
  );
  const verifiedStoreProducts = useMemo(
    () =>
      catalogState === 'ready'
        ? allStoreProducts.filter((product) =>
            product.shopifyVariants.some((variant) => variant.availableForSale),
          )
        : allStoreProducts,
    [allStoreProducts, catalogState],
  );

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  const addToCart = (product: StoreProduct, quantity = 1, requestedVariant?: ShopifyVariant) => {
    const availableVariants = product.shopifyVariants.filter((variant) => variant.availableForSale);
    const variant = requestedVariant ??
      (availableVariants.length === 1 ? availableVariants[0] : undefined);
    if (!product.shopifyCatalogReady || availableVariants.length === 0) return;
    if (!variant) {
      setQuickViewProduct(product);
      return;
    }

    const rawPrice = Number(variant.priceAmount);
    if (!Number.isFinite(rawPrice)) {
      setCheckoutError('Shopify did not return a valid price for this item.');
      return;
    }
    const quantityToAdd = Math.max(1, Math.min(99, quantity));
    const cartLine: CartLine = {
      ...product,
      id: variant.id,
      price: formatShopifyPrice(variant.priceAmount, variant.currencyCode),
      rawPrice,
      compareAtPrice: undefined,
      shopifyVariantId: variant.id,
      shopifyVariantTitle: variant.title,
      shopifyCurrencyCode: variant.currencyCode,
      quantity: quantityToAdd,
    };

    setCheckoutFallbackUrl(null);
    setCart((current) => {
      const existing = current.find((line) => line.shopifyVariantId === variant.id);
      return existing
        ? current.map((line) =>
            line.shopifyVariantId === variant.id
              ? { ...line, quantity: Math.min(99, line.quantity + quantityToAdd) }
              : line
          )
        : [...current, cartLine];
    });
    setCheckoutError('');
    setCartOpen(true);
  };

  const changeQuantity = (id: string, amount: number) => {
    setCheckoutFallbackUrl(null);
    setCheckoutError('');
    setCart((current) =>
      current
        .map((line) => (
          line.id === id
            ? { ...line, quantity: Math.max(0, Math.min(99, line.quantity + amount)) }
            : line
        ))
        .filter((line) => line.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCheckoutFallbackUrl(null);
    setCheckoutError('');
    setCart((current) => current.filter((line) => line.id !== id));
  };

  const startShopifyCheckout = async () => {
    setCheckoutError('');
    setCheckoutFallbackUrl(null);
    if (catalogState !== 'ready') {
      setCheckoutError('Live Shopify products are not available yet. Please try again shortly.');
      return;
    }
    if (cart.length === 0) return;
    if (cart.length > 50 || cart.some((line) => line.quantity > 99)) {
      setCheckoutError('Shopify checkout supports up to 50 items and 99 of each item per cart.');
      return;
    }

    // Open the tab synchronously from the button click so popup blockers allow
    // the later navigation after the checkout URL request completes.
    const checkoutWindow = window.open('about:blank', '_blank');
    if (checkoutWindow) checkoutWindow.opener = null;
    setCheckoutPending(true);
    try {
      const response = await fetch('/api/shopify/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: cart.map((line) => ({
            handle: line.handle,
            variantId: line.shopifyVariantId,
            quantity: line.quantity,
          })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string'
            ? payload.error
            : 'Secure Shopify checkout could not be started.',
        );
      }
      if (typeof payload.checkoutUrl !== 'string') {
        throw new Error('Shopify did not return a checkout link.');
      }
      const checkoutUrl = new URL(payload.checkoutUrl);
      if (
        checkoutUrl.protocol !== 'https:' ||
        checkoutUrl.hostname !== 'www.sdsnackz.com' ||
        !checkoutUrl.pathname.startsWith('/cart/')
      ) {
        throw new Error('Shopify returned an invalid checkout link.');
      }
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.location.replace(checkoutUrl.toString());
      } else {
        setCheckoutFallbackUrl(checkoutUrl.toString());
        setCheckoutError('Your browser blocked the new tab. Use the link below to open Shopify checkout.');
      }
      setCheckoutPending(false);
    } catch (error) {
      if (checkoutWindow && !checkoutWindow.closed) checkoutWindow.close();
      setCheckoutError(error instanceof Error ? error.message : 'Secure Shopify checkout could not be started.');
      setCheckoutPending(false);
      setCheckoutFallbackUrl(null);
    }
  };

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
        return ALL_PRODUCTS.filter((p) => {
          const text = `${p.name} ${p.handle} ${p.categoryName} ${p.vendor || ''} ${p.categorySlug}`.toLowerCase();
          const keywords = [
            'spicy',
            'flamin',
            'fuego',
            'takis',
            'tajin',
            'chamoy',
            'habanero',
            'jalapeno',
            'jalapeño',
            'chile',
            'chili',
            'turbos',
            'dinamita',
            'sriracha',
            'lucas',
            'hot & spicy',
            'hot and spicy',
            'xtra flamin',
          ];
          if (keywords.some((k) => text.includes(k))) return true;
          if (/\bhot\b/i.test(text) && !text.includes('hot cocoa') && !text.includes('shot')) return true;
          return false;
        });
      }
      if (activeCraving === 'sour') {
        return ALL_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes('sour') ||
            p.handle.toLowerCase().includes('sour') ||
            p.categorySlug === 'sour-strips' ||
            (p.vendor && p.vendor.toLowerCase().includes('haribo'))
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
        return ALL_PRODUCTS.filter(
          (p) =>
            p.categorySlug === 'all-beef-jerky' ||
            p.categoryName.toLowerCase().includes('jerky') ||
            p.name.toLowerCase().includes('jerky')
        );
      }
      if (activeCraving === 'choc') {
        return PRODUCTS_BY_COLLECTION['chocolate'] || [];
      }
    }

    if (!selectedCategory) {
      // Show all authentic products in the catalog
      return ALL_PRODUCTS;
    }
    return PRODUCTS_BY_COLLECTION[selectedCategory] || [];
  }, [selectedCategory, activeCraving]);

  const currentStoreProducts = useMemo(
    () =>
      currentProducts
        .map((product) =>
        storeProductsByHandle.get(product.handle) ?? {
          ...product,
          shopifyVariants: [],
          shopifyCatalogReady: catalogState === 'ready',
        },
        )
        .filter((product) =>
          catalogState !== 'ready' ||
          product.shopifyVariants.some((variant) => variant.availableForSale),
        ),
    [currentProducts, storeProductsByHandle, catalogState],
  );

  const activeCategoryObj = useMemo(() => {
    if (activeCraving !== 'all') {
      const cravingObj = CRAVINGS.find((c) => c.id === activeCraving);
      return {
        slug: activeCraving,
        name: cravingObj ? `${cravingObj.icon} ${cravingObj.label}` : 'Craving Selection',
        image: '',
        productCount: currentStoreProducts.length,
      };
    }
    if (!selectedCategory) return null;
    return BEST_SELLER_CATEGORIES.find((c) => c.slug === selectedCategory) || {
      slug: selectedCategory,
      name:
        navItems.find((n) => n.slug === selectedCategory)?.label ||
        selectedCategory.replace('all-', '').replace('-', ' ').toUpperCase(),
      image: '',
      productCount: currentStoreProducts.length,
    };
  }, [selectedCategory, activeCraving, currentStoreProducts]);
  const purchasableProductCount = allStoreProducts.filter((product) =>
    product.shopifyVariants.some((variant) => variant.availableForSale),
  ).length;

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
      {catalogState === 'loading' ? (
        <div role="status" style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#475569' }}>
          Checking live Shopify prices and availability…
        </div>
      ) : null}
      {catalogState === 'error' ? (
        <div role="alert" style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#9f1239' }}>
          {catalogError} Checkout is disabled until live products can be verified.{' '}
          <button
            type="button"
            onClick={() => setCatalogRetry((attempt) => attempt + 1)}
            style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 0, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      ) : null}
      {catalogState === 'ready' && purchasableProductCount === 0 ? (
        <div role="alert" style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: '#9f1239' }}>
          {shopifyCatalog.length === 0
            ? 'The Shopify store has no products published for checkout.'
            : 'No products in this storefront match a purchasable Shopify variant.'}{' '}
          Verify that products are published to the Online Store sales channel.
        </div>
      ) : null}

      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onAdd={addToCart}
        products={verifiedStoreProducts}
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
                {activeCategoryObj ? activeCategoryObj.name : 'All Products & Best Sellers'}
              </h2>
              <p className="section-note">
                {activeCategoryObj
                  ? `Showing ${currentStoreProducts.length} products from the live Shopify catalog in this collection.`
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
              All Products & Best Sellers
              <span className="pill-count">{ALL_PRODUCTS.length}</span>
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
                <span>{currentStoreProducts.filter((product) => product.shopifyVariants.some((variant) => variant.availableForSale)).length} items available</span>
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
              <span><strong>Retail Single Unit Guarantee:</strong> Every item is sold as <strong>1 individual single unit</strong> (bag, bar, can, cookie, or cup). Looking for wholesale cases? Visit our Wholesale Portal.</span>
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
            {currentStoreProducts.map((product) => (
              <ProductCard
                product={product}
                onAdd={addToCart}
                onQuickView={(p) => setQuickViewProduct(p)}
                key={product.id}
              />
            ))}
          </div>

          {currentStoreProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#788580' }}>
              {catalogState === 'ready'
                ? 'No purchasable Shopify products are available in this collection right now.'
                : 'No items found in this collection. Try picking another craving or category above!'}
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
              Direct distributor pricing by the case or full master pallet. Fast freight & Net 30 terms. Order any quantity with no minimums.
            </p>
            <button
              className="button"
              type="button"
              onClick={() => handleSwitchView('wholesale')}
              data-testid="link-wholesale-contact"
            >
              Open B2B Portal (No Minimums) <ArrowRight size={15} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
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
              🏢 Wholesale Portal (No Minimums)
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
              🔒 Checkout securely with Shopify
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
        onCheckout={startShopifyCheckout}
        checkoutPending={checkoutPending}
        checkoutError={checkoutError}
        checkoutFallbackUrl={checkoutFallbackUrl}
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
