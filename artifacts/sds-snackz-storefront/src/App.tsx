import { type FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  Send,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  tag?: string;
};

type CartLine = Product & { quantity: number };

const categories = [
  { name: 'Sour Strips', image: '/assets/asset-02.avif' },
  { name: 'Sabritas Mexican Chips', image: '/assets/asset-03.png' },
  { name: 'Snak Club', image: '/assets/asset-04.png' },
  { name: 'Alien Fresh Jerky', image: '/assets/asset-05.webp' },
  { name: 'Micheladas El Gordo Candy', image: '/assets/asset-06.png' },
  { name: 'American Gourmet Snacks', image: '/assets/asset-07.avif' },
  { name: 'Amos Peelerz', image: '/assets/asset-08.webp' },
  { name: 'Chocolate', image: '/assets/asset-09.png' },
  { name: 'Michelada Cups & Rim Dip', image: '/assets/asset-10.png' },
  { name: 'Takis', image: '/assets/asset-11.png' },
  { name: 'Old Trapper Beef Jerky', image: '/assets/asset-12.jpg' },
  { name: 'Haribo', image: '/assets/asset-13.jpg' },
];

const products: Product[] = [
  { id: 'mango-slices', name: 'Micheladas El Gordo - Mango Slices', price: '$6.99', image: '/assets/asset-14.png', tag: 'Best seller' },
  { id: 'peelerz-mango', name: 'Peelerz - Peelable Mango Gummy (12 bags)', price: '$28.99', image: '/assets/asset-20.webp' },
  { id: 'nutella-biscuits', name: 'Nutella Biscuits 20ct/9.7 oz 1 bag', price: '$7.49', image: '/assets/asset-21.jpg' },
  { id: 'watermelon-sandias', name: 'Micheladas El Gordo Watermelon Sandias Sagronas 6 oz', price: '$5.99', image: '/assets/asset-22.png', tag: 'Fan favorite' },
  { id: 'omg-strawberry', name: 'Micheladas El Gordo OMG Strawberry 6 OZ', price: '$5.99', image: '/assets/asset-23.jpg' },
  { id: 'jarritos-gummies', name: 'Jarritos Sour Gummies', price: '$5.49', image: '/assets/asset-24.webp' },
  { id: 'cubanito-mix', name: 'Cubanito Mix - Original | 12pcs', price: '$12.99', image: '/assets/asset-25.png' },
  { id: 'pistachios', name: 'American Gourmet – R&S Pistachios', price: '$14.99', image: '/assets/asset-15.jpg' },
  { id: 'teriyaki-jerky', name: 'Alien Fresh Jerky Honey Teriyaki 3.25 OZ', price: '$9.99', image: '/assets/asset-16.jpg' },
  { id: 'takis-crisps', name: 'Takis Crisps Fuego Potato Crisps 5.5oz', price: '$4.99', image: '/assets/asset-17.webp' },
  { id: 'energizer-mix', name: 'Snak Club Energizer Mix', price: '$8.99', image: '/assets/asset-18.jpg' },
  { id: 'cheetos-flamin', name: 'Sabritas - Cheetos Xtra Flamin Hot', price: '$5.49', image: '/assets/asset-19.webp' },
];

const navItems = ['Home', 'Snacks', 'Candy', 'Chocolate', 'Chips', 'Protein Bars', 'Beef Jerky'];

function Header({
  cartCount,
  onCart,
  onSearch,
}: {
  cartCount: number;
  onCart: () => void;
  onSearch: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="announcement">Wholesale available · Big flavor, better prices</div>
      <header className="header">
        <div className="nav-wrap">
          <div className="nav-row">
            <button className="icon-btn mobile-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" data-testid="button-toggle-navigation">
              {menuOpen ? <X size={19} /> : <Menu size={20} />}
            </button>
            <a className="brand" href="#top" aria-label="SD Snack Distributor home" data-testid="link-home-logo">
              <img src="/assets/asset-00.jpg" alt="SD Snack Distributor" />
            </a>
            <nav className="desktop-nav" aria-label="Primary navigation">
              {navItems.map((item, index) => (
                <a className={`nav-link ${index === 0 ? 'active' : ''}`} href={index === 0 ? '#top' : '#products'} key={item} data-testid={`link-nav-${item.toLowerCase().replaceAll(' ', '-')}`}>
                  {item}{index > 0 && index < 7 ? <ChevronDown size={11} strokeWidth={1.8} /> : null}
                </a>
              ))}
              <a className="nav-link" href="#contact" data-testid="link-nav-catalog">Catalog</a>
              <a className="nav-link" href="#contact" data-testid="link-nav-contact">Contact</a>
            </nav>
            <div className="nav-actions">
              <button className="icon-btn" type="button" onClick={onSearch} aria-label="Search" data-testid="button-open-search"><Search size={18} /></button>
              <button className="icon-btn" type="button" aria-label="Account" data-testid="button-account"><UserRound size={18} /></button>
              <button className="icon-btn" type="button" onClick={onCart} aria-label="Open cart" data-testid="button-open-cart" style={{ position: 'relative' }}>
                <ShoppingBag size={18} />
                {cartCount > 0 ? <span className="cart-count" data-testid="text-cart-count">{cartCount}</span> : null}
              </button>
            </div>
          </div>
          {menuOpen ? (
            <nav className="mobile-menu" aria-label="Mobile navigation">
              {navItems.map((item, index) => (
                <a className="nav-link" href={index === 0 ? '#top' : '#products'} key={item} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-nav-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</a>
              ))}
              <a className="nav-link" href="#contact" onClick={() => setMenuOpen(false)} data-testid="link-mobile-contact">Contact</a>
            </nav>
          ) : null}
        </div>
      </header>
    </>
  );
}

function CartDrawer({ open, lines, onClose, onChangeQuantity, onRemove }: {
  open: boolean;
  lines: CartLine[];
  onClose: () => void;
  onChangeQuantity: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
}) {
  const subtotal = lines.reduce((total, line) => total + Number(line.price.replace('$', '')) * line.quantity, 0);
  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-label="Shopping cart" aria-hidden={!open}>
        <div className="drawer-head">
          <h2>Your cart <span style={{ color: '#7a8581', fontSize: 14, fontFamily: 'var(--app-font-sans)' }}>({lines.reduce((n, line) => n + line.quantity, 0)})</span></h2>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close cart" data-testid="button-close-cart"><X size={19} /></button>
        </div>
        <div className="drawer-items">
          {lines.length === 0 ? <div className="empty-cart" data-testid="text-empty-cart">Your cart is waiting for something delicious.</div> : lines.map((line) => (
            <div className="cart-item" key={line.id} data-testid={`cart-item-${line.id}`}>
              <img src={line.image} alt="" />
              <div className="cart-item-info">
                <strong>{line.name}</strong>
                <span>{line.price}</span>
                <div className="qty-row">
                  <button className="qty-btn" type="button" onClick={() => onChangeQuantity(line.id, -1)} aria-label={`Decrease ${line.name}`} data-testid={`button-decrease-${line.id}`}><Minus size={12} /></button>
                  <span data-testid={`text-quantity-${line.id}`}>{line.quantity}</span>
                  <button className="qty-btn" type="button" onClick={() => onChangeQuantity(line.id, 1)} aria-label={`Increase ${line.name}`} data-testid={`button-increase-${line.id}`}><Plus size={12} /></button>
                  <button className="remove-btn" type="button" onClick={() => onRemove(line.id)} data-testid={`button-remove-${line.id}`}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {lines.length > 0 ? (
          <div className="drawer-foot">
            <div className="subtotal"><span>Subtotal</span><span data-testid="text-cart-subtotal">${subtotal.toFixed(2)}</span></div>
            <button className="button" type="button" data-testid="button-checkout">Checkout</button>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      {product.tag ? <span className="pill">{product.tag}</span> : null}
      <div className="product-image"><img src={product.image} alt={product.name} /></div>
      <div className="product-body">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-meta">
          <span className="price" data-testid={`text-price-${product.id}`}>{product.price}</span>
          <button className="add-btn" type="button" onClick={() => onAdd(product)} data-testid={`button-add-${product.id}`}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}

function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4), [query]);
  return (
    <>
      <div className={`search-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <section className={`search-panel ${open ? 'open' : ''}`} aria-label="Search store">
        <div className="search-head">
          <Search size={22} color="#173c43" />
          <input className="search-input" autoFocus={open} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search snacks, candy, chips..." aria-label="Search products" data-testid="input-search-products" />
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close search" data-testid="button-close-search"><X size={20} /></button>
        </div>
        {query ? <div style={{ display: 'grid', gap: 5, marginTop: 16 }}>{matches.length ? matches.map((product) => <a href="#products" onClick={onClose} key={product.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee5d7', fontSize: 14 }} data-testid={`link-search-result-${product.id}`}>{product.name} <span style={{ color: '#788580', float: 'right' }}>{product.price}</span></a>) : <span className="search-hint">No snacks found. Try another craving.</span>}</div> : <p className="search-hint">Try “Takis”, “gummy” or “jerky”.</p>}
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
        <p className="section-note">Questions about wholesale, a favorite snack, or an order? Send us a note.</p>
        {submitted ? <div className="contact-success" data-testid="status-contact-success"><Check size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />Thanks for reaching out. We’ll be in touch soon.</div> : (
          <form className="contact-form" onSubmit={handleSubmit} data-testid="form-contact">
            <div className="form-row">
              <input className="field" name="name" placeholder="Name" required aria-label="Name" data-testid="input-contact-name" />
              <input className="field" name="email" type="email" placeholder="Email *" required aria-label="Email" data-testid="input-contact-email" />
            </div>
            <input className="field" name="phone" type="tel" placeholder="Phone number" aria-label="Phone number" data-testid="input-contact-phone" />
            <textarea className="field" name="comment" placeholder="Comment" required aria-label="Comment" data-testid="input-contact-comment" />
            <button className="button" type="submit" data-testid="button-submit-contact"><Send size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />Send</button>
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
      {open ? <div className="chat-window" data-testid="panel-live-chat">
        <div className="chat-top"><span>SDsnackz chat</span><button type="button" onClick={() => setOpen(false)} aria-label="Close chat" style={{ color: '#fff', border: 0, background: 'transparent' }} data-testid="button-close-chat"><X size={16} /></button></div>
        <div className="chat-message">{sent ? 'Message sent. A snack expert will be with you shortly.' : 'Welcome to SDsnackz. How can I help?'}</div>
        {!sent ? <form className="chat-input-wrap" onSubmit={(event) => { event.preventDefault(); if (message.trim()) setSent(true); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask anything..." aria-label="Chat message" data-testid="input-chat-message" /><button type="submit" data-testid="button-send-chat">Send</button></form> : null}
      </div> : null}
      <button className="chat-button" type="button" onClick={() => setOpen((value) => !value)} data-testid="button-live-chat"><MessageCircle size={15} />Live chat</button>
    </>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      return existing ? current.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };
  const changeQuantity = (id: string, amount: number) => setCart((current) => current.map((line) => line.id === id ? { ...line, quantity: line.quantity + amount } : line).filter((line) => line.quantity > 0));
  const removeFromCart = (id: string) => setCart((current) => current.filter((line) => line.id !== id));

  return (
    <div className="site-shell" id="top">
      <Header cartCount={cartCount} onCart={() => setCartOpen(true)} onSearch={() => setSearchOpen(true)} />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <main>
        <section className="hero">
          <img src="/assets/asset-01.png" alt="A colorful spread of snacks and candy" />
          <div className="hero-overlay"><a className="button" href="#products" data-testid="link-hero-shop-all">Shop all <ArrowRight size={15} style={{ verticalAlign: 'middle', marginLeft: 7 }} /></a></div>
        </section>

        <section className="section" id="categories">
          <div className="section-heading">
            <div><p className="eyebrow">Find your flavor</p><h1 className="section-title">Our best sellers, your favorite purchase.</h1></div>
            <a className="text-link" href="#products" data-testid="link-browse-all">Browse all snacks <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} /></a>
          </div>
          <div className="category-grid">
            {categories.map((category) => <a className="category-card" href="#products" key={category.name} data-testid={`card-category-${category.name.toLowerCase().replaceAll(' ', '-')}`}><div className="category-image"><img src={category.image} alt={category.name} /></div><div className="category-name">{category.name}</div><span className="category-cta">See Products <ArrowRight size={11} style={{ verticalAlign: 'middle', marginLeft: 2 }} /></span></a>)}
          </div>
        </section>

        <section className="product-section" id="products">
          <div className="section-heading">
            <div><p className="eyebrow">Stock up on good stuff</p><h2 className="section-title">Best sellers</h2><p className="section-note">The snacks that disappear first.</p></div>
            <a className="text-link" href="#categories" data-testid="link-view-categories">Shop by category <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} /></a>
          </div>
          <div className="product-grid">{products.map((product) => <ProductCard product={product} onAdd={addToCart} key={product.id} />)}</div>
        </section>

        <section className="split-banner">
          <article className="story-card image"><h2>Snack runs, upgraded.</h2><p>From crunchy classics to the wildest candy on the shelf, make your next haul a good one.</p><a className="button" href="#products" data-testid="link-story-shop">Shop all snacks</a></article>
          <article className="story-card color"><p className="eyebrow">For the serious snacker</p><h2>Wholesale is available.</h2><p>Bring the good stuff to your store, office, or next big event.</p><a className="button" href="#contact" data-testid="link-wholesale-contact">Let's talk <ArrowRight size={15} style={{ verticalAlign: 'middle', marginLeft: 6 }} /></a></article>
        </section>
        <ContactSection />
      </main>
      <footer className="footer">
        <div className="footer-grid">
          <div><img className="footer-logo" src="/assets/asset-00.jpg" alt="SD Snack Distributor" /><p>Shop for the BEST snacks, candy, beef jerky, protein bars, mexican chips/candy, and a whole lot more!</p></div>
          <div><h3>Shop</h3><a href="#products" data-testid="link-footer-best-sellers">Best sellers</a><a href="#categories" data-testid="link-footer-categories">Categories</a><a href="#products" data-testid="link-footer-catalog">Catalog</a></div>
          <div><h3>Help</h3><a href="#contact" data-testid="link-footer-contact">Contact</a><a href="#contact" data-testid="link-footer-wholesale">Wholesale</a><a href="#top" data-testid="link-footer-home">Home</a></div>
          <div><h3>Get in touch</h3><p>support@SDsnackz.com</p><p>Fresh finds, straight to your door.</p></div>
        </div>
        <div className="footer-bottom"><span>© 2026 SDsnackz</span><span>SD Snack Distributor · Made for snack people</span></div>
      </footer>
      <CartDrawer open={cartOpen} lines={cart} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onRemove={removeFromCart} />
      <ChatWidget />
    </div>
  );
}

export default App;