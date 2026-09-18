import { useState, useMemo, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Grid,
  Info,
  Layers,
  Minus,
  Package,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import {
  ALL_WHOLESALE_ITEMS,
  WHOLESALE_CATEGORIES,
  type WholesaleItem,
  type CasePackOption,
  getFlavorsForBrand,
} from '../data/wholesaleCatalog';

export { ALL_WHOLESALE_ITEMS, type WholesaleItem, type CasePackOption };

export function WholesalePortal({ onBackToRetail }: { onBackToRetail: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Cases');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track selected pack option per item: itemId -> 'caddy' | 'master' | 'pallet'
  const [activePackOption, setActivePackOption] = useState<Record<string, 'caddy' | 'master' | 'pallet'>>({});
  
  // Track order quantities by key: `${itemId}__${packOptionId}` -> case count
  const [orderLines, setOrderLines] = useState<Record<string, number>>({});
  
  // Modals
  const [quickViewItem, setQuickViewItem] = useState<WholesaleItem | null>(null);
  const [matrixCategorySlug, setMatrixCategorySlug] = useState<string | null>(null);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [shippingType, setShippingType] = useState<'ltl' | 'local' | 'pickup'>('ltl');

  // Helper to look up an item by ID
  const itemMap = useMemo(() => {
    const map = new Map<string, WholesaleItem>();
    for (const item of ALL_WHOLESALE_ITEMS) {
      map.set(item.id, item);
    }
    return map;
  }, []);

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return ALL_WHOLESALE_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Cases' ||
        item.category === selectedCategory ||
        item.categorySlug === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.flavorOrVariant.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Cases': ALL_WHOLESALE_ITEMS.length };
    for (const item of ALL_WHOLESALE_ITEMS) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Get active pack option for an item
  const getItemPackOption = (item: WholesaleItem): CasePackOption => {
    const optId = activePackOption[item.id] || item.defaultPackOptionId;
    return item.packOptions.find((p) => p.id === optId) || item.packOptions[0];
  };

  // Switch pack option for an item
  const setItemPackOption = (itemId: string, optionId: 'caddy' | 'master' | 'pallet') => {
    setActivePackOption((prev) => ({ ...prev, [itemId]: optionId }));
  };

  // Stepper updates
  const updateLineQty = (itemId: string, packOptionId: string, delta: number) => {
    const key = `${itemId}__${packOptionId}`;
    setOrderLines((prev) => {
      const current = prev[key] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: next };
    });
  };

  const setLineQtyDirect = (itemId: string, packOptionId: string, val: number) => {
    const key = `${itemId}__${packOptionId}`;
    setOrderLines((prev) => {
      const next = Math.max(0, val);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: next };
    });
  };

  // Calculations for PO summary
  const { totalCases, totalUnits, subtotal, estRetailValue } = useMemo(() => {
    let tCases = 0;
    let tUnits = 0;
    let tSubtotal = 0;
    let tRetail = 0;

    for (const [key, cases] of Object.entries(orderLines)) {
      if (cases <= 0) continue;
      const [itemId, packOptionId] = key.split('__');
      const item = itemMap.get(itemId);
      if (!item) continue;
      const pack = item.packOptions.find((p) => p.id === packOptionId) || item.packOptions[0];

      tCases += cases;
      tUnits += cases * pack.units;
      tSubtotal += cases * pack.casePrice;
      tRetail += cases * pack.units * item.suggestedMSRP;
    }

    return {
      totalCases: tCases,
      totalUnits: tUnits,
      subtotal: tSubtotal,
      estRetailValue: tRetail,
    };
  }, [orderLines, itemMap]);

  const estGrossProfit = Math.max(0, estRetailValue - subtotal);
  const minOrderMet = subtotal >= 350 || totalCases >= 5;

  const handleAppSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppSubmitted(true);
  };

  const handleOrderSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
  };

  // Check if current category has multi-flavor matrix available
  const currentCategoryObj = useMemo(() => {
    if (selectedCategory === 'All Cases') return null;
    const found = ALL_WHOLESALE_ITEMS.find((i) => i.category === selectedCategory);
    return found ? { name: found.category, slug: found.categorySlug } : null;
  }, [selectedCategory]);

  const matrixItems = useMemo(() => {
    if (!matrixCategorySlug) return [];
    return getFlavorsForBrand(matrixCategorySlug);
  }, [matrixCategorySlug]);

  return (
    <div className="wholesale-portal-root">
      {/* Top B2B Announcement Bar */}
      <div className="ws-top-banner">
        <div className="ws-container ws-top-banner-inner">
          <div className="ws-badge-commercial">
            <Building2 size={13} />
            <span>B2B Commercial Store Supply</span>
          </div>
          <p className="ws-top-text">
            For Convenience Stores, Bodegas, Gas Stations, Vending & Distributors · Minimum Order: $350 / 5 Master Cases
          </p>
          <button
            type="button"
            className="ws-back-retail-btn"
            onClick={onBackToRetail}
            data-testid="button-back-to-retail"
          >
            <ArrowLeft size={13} /> Return to Retail Store
          </button>
        </div>
      </div>

      {/* Wholesale Header */}
      <header className="ws-header">
        <div className="ws-container ws-header-inner">
          <div className="ws-brand-row">
            <div className="ws-brand-group">
              <img src="/assets/asset-00.jpg" alt="SD Snack Distributor" className="ws-logo" />
              <div>
                <div className="ws-brand-title">SD SNACKZ WHOLESALE</div>
                <div className="ws-brand-sub">Direct Master Cases & Pallet Replenishment</div>
              </div>
            </div>
          </div>

          <div className="ws-header-actions">
            <div className="ws-header-stat">
              <span className="ws-stat-label">Min. Order Value</span>
              <span className="ws-stat-val">$350.00</span>
            </div>
            <div className="ws-header-stat">
              <span className="ws-stat-label">Active SKUs</span>
              <span className="ws-stat-val">175+ Bags</span>
            </div>
            <div className="ws-header-stat">
              <span className="ws-stat-label">Credit Terms</span>
              <span className="ws-stat-val">Net 30 Available</span>
            </div>

            <button
              type="button"
              className="ws-po-btn"
              onClick={() => setOrderDrawerOpen(true)}
              data-testid="button-open-wholesale-po"
            >
              <ShoppingCart size={17} />
              <span>Purchase Order ({totalCases} Cases)</span>
              {totalCases > 0 ? (
                <span className="ws-po-badge">${subtotal.toFixed(0)}</span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* Wholesale Hero */}
      <section className="ws-hero">
        <div className="ws-container ws-hero-grid">
          <div className="ws-hero-content">
            <div className="ws-hero-pill">
              <ShieldCheck size={14} color="#f7c945" /> Factory-Direct Commercial Inventory
            </div>
            <h1 className="ws-hero-h1">
              Every Bag, Every Flavor. Master Cases & Pallet Shippers.
            </h1>
            <p className="ws-hero-p">
              Access the complete 175-product catalog of Amos Peelerz, Sour Strips, Mexican Sabritas imports,
              Alien Fresh Jerky, and Micheladas El Gordo with packaging options for shelf displays, master cartons,
              and floor pallets.
            </p>

            <div className="ws-hero-ctas">
              <a href="#case-catalog" className="ws-btn-primary" data-testid="link-case-catalog">
                Browse All 175 Wholesale Cases <ArrowRight size={16} />
              </a>
              <a href="#wholesale-app" className="ws-btn-secondary" data-testid="link-apply-net30">
                Apply for Net 30 Terms
              </a>
              <button
                type="button"
                onClick={() => setOrderDrawerOpen(true)}
                className="ws-btn-outline"
                data-testid="button-quick-order-sheet"
              >
                <FileSpreadsheet size={16} /> View PO Summary ({totalCases} cs)
              </button>
            </div>

            <div className="ws-trust-strip">
              <div className="ws-trust-item">
                <CheckCircle2 size={16} color="#38bdf8" /> <span>350+ Stores Supplied in CA</span>
              </div>
              <div className="ws-trust-item">
                <CheckCircle2 size={16} color="#38bdf8" /> <span>Real Factory Bag Photos</span>
              </div>
              <div className="ws-trust-item">
                <CheckCircle2 size={16} color="#38bdf8" /> <span>12ct, 24ct & Pallet Packaging Options</span>
              </div>
            </div>
          </div>

          <div className="ws-hero-card">
            <div className="ws-card-header">
              <Store size={18} color="#f7c945" />
              <span>Commercial Account Advantages</span>
            </div>
            <div className="ws-card-content">
              <div className="ws-metric-row">
                <div>
                  <div className="ws-metric-num">~51.4%</div>
                  <div className="ws-metric-label">Avg. Retailer Profit Margin</div>
                </div>
                <div>
                  <div className="ws-metric-num">$350</div>
                  <div className="ws-metric-label">Low Commercial MOQ</div>
                </div>
              </div>

              <div className="ws-perks-list">
                <div className="ws-perk">
                  <Package size={15} color="#22c55e" />
                  <span>Factory-sealed gravity feed displays with retail UPC barcodes</span>
                </div>
                <div className="ws-perk">
                  <Truck size={15} color="#22c55e" />
                  <span>LTL liftgate, dock delivery, and San Diego warehouse will-call</span>
                </div>
                <div className="ws-perk">
                  <Boxes size={15} color="#22c55e" />
                  <span>Mix-and-match cases freely across all 12 brands</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Order Bar */}
      {totalCases > 0 ? (
        <div className="ws-sticky-bar" data-testid="bar-wholesale-sticky">
          <div className="ws-container ws-sticky-inner">
            <div className="ws-sticky-col">
              <span className="ws-sticky-label">Order Volume:</span>
              <strong>{totalCases} Cases ({totalUnits} Retail Bags)</strong>
            </div>
            <div className="ws-sticky-col">
              <span className="ws-sticky-label">Wholesale Total:</span>
              <strong className="ws-sticky-price">${subtotal.toFixed(2)}</strong>
            </div>
            <div className="ws-sticky-col hide-mobile">
              <span className="ws-sticky-label">Est. Retail Value:</span>
              <span className="ws-sticky-retail">${estRetailValue.toFixed(2)}</span>
            </div>
            <div className="ws-sticky-col hide-mobile">
              <span className="ws-sticky-label">Your Gross Profit:</span>
              <span className="ws-sticky-profit">+${estGrossProfit.toFixed(2)}</span>
            </div>
            <div className="ws-sticky-col">
              <span className="ws-sticky-label">Min. Order Status:</span>
              {minOrderMet ? (
                <span className="ws-status-met">✓ MOQ Met ($350+)</span>
              ) : (
                <span className="ws-status-unmet">Add ${(350 - subtotal).toFixed(2)} more for MOQ</span>
              )}
            </div>
            <button
              type="button"
              className="ws-btn-primary ws-sticky-btn"
              onClick={() => setOrderDrawerOpen(true)}
              data-testid="button-sticky-review-po"
            >
              Review PO <ArrowRight size={15} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Case Catalog Section */}
      <section className="ws-section" id="case-catalog">
        <div className="ws-container">
          <div className="ws-section-header">
            <div>
              <div className="ws-badge-section">Master Case & Pallet Inventory</div>
              <h2 className="ws-section-title">Wholesale Product & Packaging Catalog</h2>
              <p className="ws-section-desc">
                Browse all 175 authentic bags. Select your preferred packaging option (12-pack display caddy, 24-pack master carton, or floor pallet) for each flavor.
              </p>
            </div>

            <div className="ws-search-box">
              <Search size={17} color="#6b7c79" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 175 bags by flavor, SKU, brand..."
                aria-label="Search wholesale items"
                data-testid="input-search-wholesale"
              />
              {searchQuery ? (
                <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X size={15} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="ws-category-bar">
            {WHOLESALE_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  type="button"
                  key={cat}
                  className={`ws-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`button-ws-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span>{cat}</span>
                  <span className="ws-cat-badge">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Multi-Flavor Fast Order Banner (When a specific brand is selected) */}
          {currentCategoryObj ? (
            <div className="ws-matrix-banner" data-testid="banner-multi-flavor-matrix">
              <div className="ws-matrix-banner-info">
                <div className="ws-matrix-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="ws-matrix-title">
                    Stocking up on {currentCategoryObj.name}?
                  </div>
                  <div className="ws-matrix-desc">
                    View all {categoryCounts[currentCategoryObj.name] || 'available'} flavor bags side-by-side with individual photos and order all varieties simultaneously.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="ws-matrix-btn"
                onClick={() => setMatrixCategorySlug(currentCategoryObj.slug)}
                data-testid="button-open-matrix-modal"
              >
                <Grid size={15} /> Quick Multi-Flavor Order Grid
              </button>
            </div>
          ) : null}

          {/* Product Cards Grid */}
          <div className="ws-grid">
            {filteredItems.map((item) => {
              const activePack = getItemPackOption(item);
              const lineKey = `${item.id}__${activePack.id}`;
              const currentQty = orderLines[lineKey] || 0;
              const lineTotal = currentQty * activePack.casePrice;
              const estLineProfit = currentQty * (item.suggestedMSRP * activePack.units - activePack.casePrice);

              return (
                <article className="ws-card" key={item.id} data-testid={`card-ws-item-${item.id}`}>
                  <div className="ws-card-top">
                    <span className="ws-sku-tag">{item.sku}</span>
                    <span className="ws-case-units">{activePack.units} Bags / Case</span>
                  </div>

                  <div
                    className="ws-card-img-wrap"
                    onClick={() => setQuickViewItem(item)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                    title="Click to view bag details & specs"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/asset-01.png';
                      }}
                    />
                    <div className="ws-img-zoom-tag">
                      <Eye size={11} /> <span>View Bag</span>
                    </div>
                  </div>

                  <div className="ws-card-body">
                    <span className="ws-item-cat">{item.category}</span>
                    <h3 className="ws-item-name">{item.name}</h3>

                    {/* Packaging Options Selector */}
                    <div className="ws-options-section">
                      <div className="ws-options-label">
                        <span>Packaging Option:</span>
                        <span style={{ color: '#173c43', fontWeight: 800 }}>{activePack.shortLabel}</span>
                      </div>
                      <div className="ws-pack-pills-row">
                        {item.packOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className={`ws-pack-pill ${activePack.id === option.id ? 'active' : ''}`}
                            onClick={() => setItemPackOption(item.id, option.id)}
                            title={`${option.name} (${option.units} units) - $${option.casePrice.toFixed(2)}/case`}
                            data-testid={`btn-pack-opt-${item.id}-${option.id}`}
                          >
                            <span>{option.shortLabel}</span>
                            <span className="ws-pack-pill-sub">${option.casePrice.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Price Breakdown for Selected Pack */}
                    <div className="ws-price-breakdown">
                      <div className="ws-price-block">
                        <span className="ws-price-label">Wholesale / Case</span>
                        <span className="ws-case-price">${activePack.casePrice.toFixed(2)}</span>
                        <span className="ws-unit-price">(${activePack.unitPrice.toFixed(2)} / bag)</span>
                      </div>
                      <div className="ws-margin-block">
                        <span className="ws-price-label">MSRP Target</span>
                        <span className="ws-msrp">${item.suggestedMSRP.toFixed(2)}</span>
                        <span className="ws-margin-tag">{activePack.marginPercent}% Margin</span>
                      </div>
                    </div>

                    {/* Stepper Control */}
                    <div className="ws-card-stepper">
                      <div className="ws-stepper-label">
                        <span>Case Quantity:</span>
                        {currentQty > 0 ? (
                          <strong className="ws-stepper-calc">
                            {currentQty * activePack.units} bags · ${lineTotal.toFixed(2)}
                          </strong>
                        ) : null}
                      </div>

                      <div className="ws-stepper-control">
                        <button
                          type="button"
                          className="ws-stepper-btn"
                          onClick={() => updateLineQty(item.id, activePack.id, -1)}
                          aria-label="Decrease cases"
                          disabled={currentQty === 0}
                          data-testid={`button-ws-minus-${item.id}`}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) => setLineQtyDirect(item.id, activePack.id, parseInt(e.target.value, 10) || 0)}
                          className="ws-stepper-input"
                          aria-label="Case count"
                          data-testid={`input-ws-qty-${item.id}`}
                        />
                        <button
                          type="button"
                          className="ws-stepper-btn"
                          onClick={() => updateLineQty(item.id, activePack.id, 1)}
                          aria-label="Increase cases"
                          data-testid={`button-ws-plus-${item.id}`}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          className={`ws-add-case-btn ${currentQty > 0 ? 'added' : ''}`}
                          onClick={() => updateLineQty(item.id, activePack.id, 1)}
                          data-testid={`button-ws-add-${item.id}`}
                        >
                          {currentQty > 0 ? `+1 Case` : `Add Case`}
                        </button>
                      </div>

                      {currentQty > 0 ? (
                        <div className="ws-line-profit-note">
                          Est. Profit: +${estLineProfit.toFixed(2)} at MSRP
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredItems.length === 0 ? (
            <div className="ws-no-results">
              No wholesale cases match your search. Try clearing your query or switching category tabs.
            </div>
          ) : null}
        </div>
      </section>

      {/* Bag Quick View Modal */}
      {quickViewItem ? (
        <div className="ws-modal-backdrop" onClick={() => setQuickViewItem(null)}>
          <div
            className="ws-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Product Bag Specifications"
          >
            <div className="ws-modal-head">
              <h3>Bag Specifications & Packaging</h3>
              <button
                type="button"
                className="ws-modal-close"
                onClick={() => setQuickViewItem(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="ws-modal-body">
              <div className="ws-qv-grid">
                <div className="ws-qv-img-box">
                  <img src={quickViewItem.image} alt={quickViewItem.name} />
                </div>
                <div className="ws-qv-details">
                  <span className="ws-sku-tag">{quickViewItem.sku}</span>
                  <h2>{quickViewItem.name}</h2>
                  <p style={{ color: '#556c69', fontSize: 13, marginBottom: 16 }}>
                    Direct commercial distributor case pack. Authentic sealed packaging with GS1 barcode and guaranteed shelf life for store retail shelves.
                  </p>

                  <div className="ws-qv-specs">
                    <div className="ws-qv-spec-item">
                      <span>Brand / Vendor:</span> <strong>{quickViewItem.brand}</strong>
                    </div>
                    <div className="ws-qv-spec-item">
                      <span>Flavor / Variety:</span> <strong>{quickViewItem.flavorOrVariant}</strong>
                    </div>
                    <div className="ws-qv-spec-item">
                      <span>Shelf Life:</span> <strong>{quickViewItem.shelfLife}</strong>
                    </div>
                    <div className="ws-qv-spec-item">
                      <span>Sourcing:</span> <strong>{quickViewItem.origin}</strong>
                    </div>
                    <div className="ws-qv-spec-item">
                      <span>UPC Barcode:</span> <code>{quickViewItem.barcode}</code>
                    </div>
                    <div className="ws-qv-spec-item">
                      <span>Suggested MSRP:</span> <strong>${quickViewItem.suggestedMSRP.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Packaging Options in Modal */}
                  <div className="ws-options-section">
                    <div className="ws-options-label">
                      <span>Select Packaging Case Option:</span>
                    </div>
                    <div className="ws-pack-pills-row">
                      {quickViewItem.packOptions.map((option) => {
                        const isSelected = (activePackOption[quickViewItem.id] || quickViewItem.defaultPackOptionId) === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={`ws-pack-pill ${isSelected ? 'active' : ''}`}
                            onClick={() => setItemPackOption(quickViewItem.id, option.id)}
                          >
                            <span>{option.name}</span>
                            <span className="ws-pack-pill-sub">${option.casePrice.toFixed(2)} (${option.marginPercent}% margin)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Case Adder */}
                  {(() => {
                    const activePack = getItemPackOption(quickViewItem);
                    const lineKey = `${quickViewItem.id}__${activePack.id}`;
                    const currentQty = orderLines[lineKey] || 0;

                    return (
                      <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="ws-btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            updateLineQty(quickViewItem.id, activePack.id, 1);
                            setQuickViewItem(null);
                          }}
                        >
                          <Plus size={16} /> Add {activePack.shortLabel} (${activePack.casePrice.toFixed(2)}) to PO
                        </button>
                        {currentQty > 0 ? (
                          <span style={{ fontSize: 13, color: '#15803d', fontWeight: 700 }}>
                            ✓ {currentQty} cases in PO
                          </span>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Multi-Flavor Fast Order Grid Modal */}
      {matrixCategorySlug ? (
        <div className="ws-modal-backdrop" onClick={() => setMatrixCategorySlug(null)}>
          <div
            className="ws-modal"
            style={{ maxWidth: 940 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Multi-Flavor Order Matrix"
          >
            <div className="ws-modal-head">
              <div>
                <h3>Multi-Flavor Fast Order Sheet</h3>
                <span style={{ fontSize: 12, color: '#556c69' }}>
                  {matrixItems.length} Bags Available · Order multiple flavors in one click
                </span>
              </div>
              <button
                type="button"
                className="ws-modal-close"
                onClick={() => setMatrixCategorySlug(null)}
                aria-label="Close matrix"
              >
                <X size={20} />
              </button>
            </div>
            <div className="ws-modal-body">
              <div className="ws-matrix-list">
                {matrixItems.map((item) => {
                  const activePack = getItemPackOption(item);
                  const lineKey = `${item.id}__${activePack.id}`;
                  const currentQty = orderLines[lineKey] || 0;

                  return (
                    <div className="ws-matrix-item" key={item.id}>
                      <img src={item.image} alt={item.name} className="ws-matrix-img" />
                      <div className="ws-matrix-flavor">{item.flavorOrVariant}</div>
                      <div className="ws-matrix-price">
                        ${activePack.casePrice.toFixed(2)} / {activePack.shortLabel}
                      </div>

                      <div className="ws-matrix-controls">
                        <button
                          type="button"
                          className="ws-stepper-btn"
                          style={{ width: 28, height: 28 }}
                          onClick={() => updateLineQty(item.id, activePack.id, -1)}
                          disabled={currentQty === 0}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ minWidth: 24, fontWeight: 700, fontSize: 13 }}>
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          className="ws-stepper-btn"
                          style={{ width: 28, height: 28 }}
                          onClick={() => updateLineQty(item.id, activePack.id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2ebe9', paddingTop: 16 }}>
                <div>
                  <strong>{totalCases} Total Cases in PO</strong> (${subtotal.toFixed(2)})
                </div>
                <button
                  type="button"
                  className="ws-btn-primary"
                  onClick={() => {
                    setMatrixCategorySlug(null);
                    setOrderDrawerOpen(true);
                  }}
                >
                  Review Purchase Order <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Pallet Pricing Tier Matrix */}
      <section className="ws-section ws-pallet-section">
        <div className="ws-container">
          <div className="ws-badge-section">Volume Tiers</div>
          <h2 className="ws-section-title">Wholesale Volume Discount Structure</h2>
          <p className="ws-section-desc">
            Scale your savings. Automatic volume tiered rebates apply upon quote generation or invoice settlement.
          </p>

          <div className="ws-tiers-grid">
            <div className="ws-tier-card">
              <div className="ws-tier-badge">Tier 1</div>
              <h3>Master Case (MOQ)</h3>
              <div className="ws-tier-req">5 – 19 Master Cases</div>
              <div className="ws-tier-discount">Base Wholesale Price</div>
              <ul className="ws-tier-perks">
                <li>✓ Standard Wholesale Pricing (~51% Margin)</li>
                <li>✓ Mixed SKU allowed across all 175 bags</li>
                <li>✓ 24-48h Ground or LTL freight dispatch</li>
              </ul>
            </div>

            <div className="ws-tier-card highlighted">
              <div className="ws-tier-badge best">Most Popular</div>
              <h3>Half Pallet Builder</h3>
              <div className="ws-tier-req">20 – 39 Master Cases</div>
              <div className="ws-tier-discount">Additional 5% Off Order</div>
              <ul className="ws-tier-perks">
                <li>✓ Extra 5% Volume Invoice Rebate</li>
                <li>✓ Free shrink wrapping & palletizing</li>
                <li>✓ Liftgate delivery options included</li>
                <li>✓ Priority allocation on viral restocks</li>
              </ul>
            </div>

            <div className="ws-tier-card">
              <div className="ws-tier-badge">Tier 3</div>
              <h3>Full Pallet / Master Distributor</h3>
              <div className="ws-tier-req">40+ Master Cases / 1 Full Pallet</div>
              <div className="ws-tier-discount">Additional 10% Off Order</div>
              <ul className="ws-tier-perks">
                <li>✓ Extra 10% Pallet Volume Discount</li>
                <li>✓ Dedicated Account Rep & WhatsApp dispatch</li>
                <li>✓ Free commercial dock LTL freight in CA</li>
                <li>✓ Pre-orders on limited holiday drops</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reseller Application / Net 30 Form */}
      <section className="ws-section ws-app-section" id="wholesale-app">
        <div className="ws-container ws-app-container">
          <div className="ws-app-intro">
            <div className="ws-badge-section">Open a Trade Account</div>
            <h2 className="ws-section-title">Wholesale & Net 30 Terms Application</h2>
            <p className="ws-section-desc">
              Approved commercial businesses enjoy tax-exempt purchasing, Net 30 invoicing, and scheduled route replenishment.
              Applications are reviewed within 4 business hours.
            </p>

            <div className="ws-contact-box">
              <h4>Need Immediate Pallet Dispatch?</h4>
              <p>Speak directly with our wholesale manager:</p>
              <div className="ws-rep-row">
                <Phone size={16} /> <strong>(619) 555-SDSNACKZ</strong>
              </div>
              <div className="ws-rep-row">
                <Building2 size={16} /> <span>San Diego Warehouse Dock, CA</span>
              </div>
              <div className="ws-rep-row">
                <Store size={16} /> <span>orders@sdsnackz.com (Wholesale Desk)</span>
              </div>
            </div>
          </div>

          <div className="ws-form-card">
            {appSubmitted ? (
              <div className="ws-app-success" data-testid="status-wholesale-app-success">
                <CheckCircle2 size={38} color="#22c55e" />
                <h3>Wholesale Application Received!</h3>
                <p>
                  Thank you for registering your store. Our compliance team is verifying your Resale Certificate.
                  We will send your wholesale pricing sheet and Net 30 approval link within 4 hours.
                </p>
                <button
                  type="button"
                  className="ws-btn-secondary"
                  onClick={() => setAppSubmitted(false)}
                >
                  Submit Another Location
                </button>
              </div>
            ) : (
              <form onSubmit={handleAppSubmit} className="ws-form" data-testid="form-wholesale-application">
                <div className="ws-form-group">
                  <label htmlFor="ws-biz-name">Business / Store Legal Name *</label>
                  <input
                    id="ws-biz-name"
                    required
                    placeholder="e.g. Pacific Coast Market & Gas"
                    data-testid="input-ws-biz-name"
                  />
                </div>

                <div className="ws-form-row">
                  <div className="ws-form-group">
                    <label htmlFor="ws-tax-id">Tax ID / Resale Permit Number *</label>
                    <input
                      id="ws-tax-id"
                      required
                      placeholder="e.g. CA-RES-10492850"
                      data-testid="input-ws-tax-id"
                    />
                  </div>
                  <div className="ws-form-group">
                    <label htmlFor="ws-biz-type">Business Type *</label>
                    <select id="ws-biz-type" required data-testid="select-ws-biz-type">
                      <option value="cstore">Convenience Store / Gas Station</option>
                      <option value="smoke">Smoke Shop / Bodega</option>
                      <option value="grocery">Independent Grocery / Supermarket</option>
                      <option value="vending">Vending Machine / Route Operator</option>
                      <option value="liquor">Liquor & Beverage Store</option>
                      <option value="gym">Gym / Athletic Center</option>
                      <option value="other">Other Commercial Reseller</option>
                    </select>
                  </div>
                </div>

                <div className="ws-form-row">
                  <div className="ws-form-group">
                    <label htmlFor="ws-contact-name">Contact Person *</label>
                    <input
                      id="ws-contact-name"
                      required
                      placeholder="Full Name"
                      data-testid="input-ws-contact-name"
                    />
                  </div>
                  <div className="ws-form-group">
                    <label htmlFor="ws-phone">Direct Phone Number *</label>
                    <input
                      id="ws-phone"
                      type="tel"
                      required
                      placeholder="(619) 000-0000"
                      data-testid="input-ws-phone"
                    />
                  </div>
                </div>

                <div className="ws-form-group">
                  <label htmlFor="ws-email">Business Purchasing Email *</label>
                  <input
                    id="ws-email"
                    type="email"
                    required
                    placeholder="purchasing@yourstore.com"
                    data-testid="input-ws-email"
                  />
                </div>

                <div className="ws-form-row">
                  <div className="ws-form-group">
                    <label htmlFor="ws-volume">Est. Monthly Snack Volume</label>
                    <select id="ws-volume" data-testid="select-ws-volume">
                      <option value="starter">$350 – $1,500 / month (5-15 Cases)</option>
                      <option value="medium">$1,500 – $5,000 / month (Half Pallet)</option>
                      <option value="heavy">$5,000 – $15,000 / month (1-3 Pallets)</option>
                      <option value="enterprise">$15,000+ / month (Multi-Location / Route)</option>
                    </select>
                  </div>
                  <div className="ws-form-group">
                    <label htmlFor="ws-delivery">Delivery Dock Setup</label>
                    <select id="ws-delivery" data-testid="select-ws-delivery">
                      <option value="commercial-dock">Commercial Freight Dock</option>
                      <option value="forklift">Forklift Onsite</option>
                      <option value="liftgate">Liftgate Truck Required</option>
                      <option value="pickup">Local San Diego Warehouse Pickup</option>
                    </select>
                  </div>
                </div>

                <div className="ws-form-group">
                  <label htmlFor="ws-notes">Specific SKUs or Brands of Interest</label>
                  <textarea
                    id="ws-notes"
                    rows={2}
                    placeholder="e.g. Amos Peelerz by the pallet, Sour Strips gravity feeds, Mexican Cheetos imports..."
                    data-testid="textarea-ws-notes"
                  />
                </div>

                <button
                  type="submit"
                  className="ws-btn-primary ws-form-submit"
                  data-testid="button-submit-wholesale-app"
                >
                  Submit Wholesale Application <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Wholesale Purchase Order Drawer / RFQ Modal */}
      {orderDrawerOpen ? (
        <>
          <div className="ws-drawer-backdrop" onClick={() => setOrderDrawerOpen(false)} />
          <aside className="ws-drawer" role="dialog" aria-modal="true" aria-label="Wholesale Purchase Order">
            <div className="ws-drawer-head">
              <div>
                <h2>Commercial Purchase Order</h2>
                <span className="ws-drawer-sub">
                  {totalCases} Master Cases · {totalUnits} Total Retail Bags
                </span>
              </div>
              <button
                type="button"
                className="ws-drawer-close"
                onClick={() => setOrderDrawerOpen(false)}
                aria-label="Close PO"
                data-testid="button-close-wholesale-po"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ws-drawer-body">
              {orderSubmitted ? (
                <div className="ws-order-success" data-testid="status-po-submitted">
                  <CheckCircle2 size={46} color="#22c55e" />
                  <h3>Purchase Order Quote Generated!</h3>
                  <p>
                    PO Ref: <strong>#SDS-PO-{Math.floor(100000 + Math.random() * 900000)}</strong>
                  </p>
                  <p>
                    An itemized wholesale invoice and Bill of Lading (BOL) estimate have been generated.
                    Our dispatcher will confirm delivery appointment with your dock.
                  </p>
                  <button
                    type="button"
                    className="ws-btn-primary"
                    onClick={() => {
                      setOrderSubmitted(false);
                      setOrderDrawerOpen(false);
                      setOrderLines({});
                    }}
                  >
                    Start New PO
                  </button>
                </div>
              ) : totalCases === 0 ? (
                <div className="ws-empty-po">
                  <Package size={44} color="#6b7c79" />
                  <p>Your Purchase Order sheet is currently empty.</p>
                  <span>Select cases from the catalog to build your wholesale order.</span>
                </div>
              ) : (
                <>
                  <div className="ws-po-list">
                    {Object.entries(orderLines).map(([key, cases]) => {
                      if (cases <= 0) return null;
                      const [itemId, packOptionId] = key.split('__');
                      const item = itemMap.get(itemId);
                      if (!item) return null;
                      const pack = item.packOptions.find((p) => p.id === packOptionId) || item.packOptions[0];
                      const lineTotal = cases * pack.casePrice;

                      return (
                        <div className="ws-po-item" key={key} data-testid={`po-item-${key}`}>
                          <img src={item.image} alt={item.name} />
                          <div className="ws-po-item-info">
                            <div className="ws-po-item-title">{item.name}</div>
                            <div className="ws-po-item-meta">
                              <strong>{pack.name}</strong> ({cases * pack.units} bags) · ${pack.casePrice.toFixed(2)}/cs
                            </div>
                            <div className="ws-po-item-subtotal">
                              <strong>${lineTotal.toFixed(2)}</strong>
                              <span className="ws-po-msrp-tag">
                                Retail Val: ${(cases * pack.units * item.suggestedMSRP).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="ws-po-stepper">
                            <button
                              type="button"
                              onClick={() => updateLineQty(itemId, packOptionId, -1)}
                              aria-label="Reduce case"
                            >
                              <Minus size={12} />
                            </button>
                            <span>{cases}</span>
                            <button
                              type="button"
                              onClick={() => updateLineQty(itemId, packOptionId, 1)}
                              aria-label="Add case"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping Method Selector */}
                  <div className="ws-shipping-selector">
                    <span className="ws-shipping-title">Freight & Dispatch Method</span>
                    <div className="ws-ship-options">
                      <label className={`ws-ship-radio ${shippingType === 'ltl' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="ws-shipping"
                          checked={shippingType === 'ltl'}
                          onChange={() => setShippingType('ltl')}
                        />
                        <div>
                          <strong>LTL Freight (Commercial Dock / Liftgate)</strong>
                          <span>Palletized, shrink-wrapped with Bill of Lading (BOL)</span>
                        </div>
                      </label>
                      <label className={`ws-ship-radio ${shippingType === 'local' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="ws-shipping"
                          checked={shippingType === 'local'}
                          onChange={() => setShippingType('local')}
                        />
                        <div>
                          <strong>Local SoCal Route Van Delivery</strong>
                          <span>Direct door replenishment across San Diego & OC</span>
                        </div>
                      </label>
                      <label className={`ws-ship-radio ${shippingType === 'pickup' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="ws-shipping"
                          checked={shippingType === 'pickup'}
                          onChange={() => setShippingType('pickup')}
                        />
                        <div>
                          <strong>Will-Call Warehouse Pickup (Free)</strong>
                          <span>San Diego Distribution Center Dock</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* PO Form Submission */}
                  <form onSubmit={handleOrderSubmit} className="ws-po-checkout-form">
                    <div className="ws-form-row">
                      <input
                        required
                        placeholder="Store / Company Name *"
                        className="ws-po-input"
                        data-testid="input-po-store-name"
                      />
                      <input
                        required
                        placeholder="Resale Tax ID # *"
                        className="ws-po-input"
                        data-testid="input-po-tax-id"
                      />
                    </div>
                    <div className="ws-form-row">
                      <input
                        required
                        type="email"
                        placeholder="Billing / Invoicing Email *"
                        className="ws-po-input"
                        data-testid="input-po-email"
                      />
                      <input
                        required
                        type="tel"
                        placeholder="Receiving Dock Phone *"
                        className="ws-po-input"
                        data-testid="input-po-phone"
                      />
                    </div>

                    <div className="ws-po-total-box">
                      <div className="ws-po-row">
                        <span>Total Cases:</span>
                        <strong>{totalCases} Master Cases</strong>
                      </div>
                      <div className="ws-po-row">
                        <span>Total Retail Units:</span>
                        <strong>{totalUnits} Bags</strong>
                      </div>
                      <div className="ws-po-row">
                        <span>Estimated Retail Value:</span>
                        <span>${estRetailValue.toFixed(2)}</span>
                      </div>
                      <div className="ws-po-row highlight">
                        <span>Est. Store Gross Profit:</span>
                        <strong style={{ color: '#15803d' }}>+${estGrossProfit.toFixed(2)}</strong>
                      </div>
                      <div className="ws-po-row grand">
                        <span>Wholesale Subtotal:</span>
                        <strong>${subtotal.toFixed(2)}</strong>
                      </div>
                    </div>

                    {!minOrderMet ? (
                      <div className="ws-po-moq-warning">
                        ⚠️ Minimum Order Quantity is $350. Please add ${(350 - subtotal).toFixed(2)} more to place order.
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={!minOrderMet}
                      className="ws-btn-primary ws-po-submit-btn"
                      data-testid="button-submit-po"
                    >
                      Generate Purchase Order & Invoice <ArrowRight size={16} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </aside>
        </>
      ) : null}

      {/* Wholesale Footer */}
      <footer className="ws-footer">
        <div className="ws-container ws-footer-inner">
          <div>
            <div className="ws-brand-title">SD SNACKZ WHOLESALE</div>
            <p>Southern California's master snack distributor for convenience stores, grocers, and route operators.</p>
          </div>
          <div>
            <h4>Commercial Desk</h4>
            <p>support@sdsnackz.com</p>
            <p>San Diego Distribution Center</p>
          </div>
          <div>
            <h4>Switch Mode</h4>
            <button
              type="button"
              className="ws-back-retail-btn"
              onClick={onBackToRetail}
            >
              <ArrowLeft size={13} /> Back to Consumer Retail Store
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
