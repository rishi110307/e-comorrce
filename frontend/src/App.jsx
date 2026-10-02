import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Search, Plus, Minus, Trash2, X, Menu, ArrowRight, PackageCheck } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(Number(amount || 0));

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ customerName: "", email: "", address: "" });
  const [placing, setPlacing] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "All") params.set("category", category);
    fetch(`${API_BASE}/products?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("The product service is not available.");
        return res.json();
      })
      .then(setProducts)
      .catch((err) => {
        if (err.name !== "AbortError") setError("Could not load products. Check that the backend and database are running.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search, category]);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  function addToCart(product) {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) return current.map((item) => item.id === product.id
        ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item);
      return [...current, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to your bag`);
    setTimeout(() => setNotice(""), 2200);
  }

  function updateQuantity(id, amount) {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0));
  }

  async function placeOrder(event) {
    event.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order could not be placed.");
      setNotice(`Order #${data.order.id} placed successfully!`);
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setCustomer({ customerName: "", email: "", address: "" });
      setTimeout(() => setNotice(""), 5000);
    } catch (err) {
      setError(err.message || "Order could not be placed.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="announcement">A little something for your everyday <span>✦</span> Free shipping on orders over ₹2,000</div>
      <header className="site-header">
        <a className="brand" href="#"><span className="brand-mark">s.</span> shopease</a>
        <nav className="desktop-nav"><a href="#shop">Shop all</a><a href="#story">Our story</a><a href="#footer">Contact</a></nav>
        <div className="header-actions">
          <button className="icon-button search-toggle" aria-label="Focus search" onClick={() => document.getElementById("product-search")?.focus()}><Search size={20}/></button>
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Open bag, ${cartCount} items`}><ShoppingBag size={19}/><span>Bag</span><b>{cartCount}</b></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line"/> THE EVERYDAY EDIT</span>
            <h1>Good things.<br/><em>Every day.</em></h1>
            <p>Thoughtful finds for your everyday life. Discover useful essentials, timeless favourites, and little things that make a difference.</p>
            <a className="primary-button" href="#shop">Explore the collection <ArrowRight size={17}/></a>
            <div className="hero-footnote"><span className="tiny-star">✳</span> Curated for your everyday</div>
          </div>
          <div className="hero-art">
            <div className="art-circle circle-one"/><div className="art-circle circle-two"/>
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1100&auto=format&fit=crop&q=85" alt="Neutral-toned everyday fashion and accessories" />
            <div className="image-label"><span>01 / 03</span><b>Everyday essentials</b></div>
            <div className="floating-note"><span>✳</span><div><b>Made for living</b><small>Simple. Useful. Lovely.</small></div></div>
          </div>
        </section>

        <section className="benefits">
          <div><span>✳</span><p><b>Thoughtfully picked</b><small>Everyday favourites</small></p></div>
          <div><span>↗</span><p><b>Easy shopping</b><small>Simple from start to finish</small></p></div>
          <div><span>♡</span><p><b>Made to delight</b><small>Little things, big joy</small></p></div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div><span className="eyebrow">THE COLLECTION</span><h2>Find your <em>favourite.</em></h2><p>Everyday essentials, picked with you in mind.</p></div>
            <label className="search-box"><Search size={18}/><input id="product-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." /></label>
          </div>
          <div className="shop-toolbar">
            <div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <span className="result-count">{products.length} items</span>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {loading ? <div className="loading-state">Finding your favourites…</div> :
            products.length === 0 ? <div className="empty-state">No products found. Try another search.</div> :
            <div className="product-grid">{products.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className={`product-image image-tone-${index % 4}`}>
                  <img src={product.image_url} alt={product.name} loading="lazy" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"; }} />
                  {index < 2 && <span className="product-tag">{index === 0 ? "EVERYDAY PICK" : "POPULAR"}</span>}
                  <button className="quick-add" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to bag`}><Plus size={19}/></button>
                </div>
                <div className="product-meta"><span>{product.category}</span><span className="product-price">{money(product.price)}</span></div>
                <h3>{product.name}</h3><p className="product-description">{product.description}</p>
                <button className="add-link" onClick={() => addToCart(product)}>Add to bag <ArrowRight size={15}/></button>
              </article>
            ))}</div>
          }
        </section>

        <section className="story-section" id="story">
          <div className="story-image"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80" alt="Warm, inviting retail space"/></div>
          <div className="story-copy"><span className="eyebrow">A SMALLER, BETTER EDIT</span><h2>Less searching.<br/><em>More living.</em></h2><p>We believe the best things don't need to be complicated. Shop a considered collection of practical, good-looking essentials for the moments that make up your day.</p><a href="#shop" className="text-link">Meet your new favourites <ArrowRight size={16}/></a></div>
        </section>
      </main>

      <footer id="footer"><a className="brand footer-brand" href="#"><span className="brand-mark">s.</span> shopease</a><p>Everyday finds, thoughtfully picked.</p><span>© {new Date().getFullYear()} ShopEase · Demo storefront</span></footer>

      {notice && <div className="toast" role="status"><PackageCheck size={18}/>{notice}</div>}

      {cartOpen && <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}>
        <aside className="cart-drawer">
          <div className="drawer-heading"><div><span className="eyebrow">YOUR SELECTION</span><h2>Your bag <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X/></button></div>
          {cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={35}/><h3>Your bag is taking a break.</h3><p>Find something lovely to bring home.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Continue shopping <ArrowRight size={16}/></button></div> :
            <>
              <div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image_url} alt={item.name}/><div className="cart-item-info"><b>{item.name}</b><span>{money(item.price)}</span><div className="quantity-control"><button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div><button className="remove-button" onClick={() => setCart((c) => c.filter((p) => p.id !== item.id))} aria-label={`Remove ${item.name}`}><Trash2 size={16}/></button></div>)}</div>
              <div className="cart-summary"><div><span>Subtotal</span><b>{money(total)}</b></div><small>Shipping and any applicable taxes are calculated separately.</small><button className="primary-button full-button" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Continue to checkout <ArrowRight size={16}/></button></div>
            </>}
        </aside>
      </div>}

      {checkoutOpen && <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setCheckoutOpen(false); }}><section className="checkout-modal">
        <div className="drawer-heading"><div><span className="eyebrow">ALMOST YOURS</span><h2>Checkout</h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X/></button></div>
        <p className="checkout-note">Demo checkout — no payment is collected.</p>
        <form onSubmit={placeOrder} className="checkout-form">
          <label>Full name<input required maxLength="100" value={customer.customerName} onChange={(e) => setCustomer({...customer, customerName:e.target.value})} placeholder="Your name"/></label>
          <label>Email address<input required type="email" maxLength="254" value={customer.email} onChange={(e) => setCustomer({...customer, email:e.target.value})} placeholder="you@example.com"/></label>
          <label>Delivery address<textarea required maxLength="500" rows="3" value={customer.address} onChange={(e) => setCustomer({...customer, address:e.target.value})} placeholder="House number, street, city, PIN code"/></label>
          <div className="checkout-total"><span>Order total</span><b>{money(total)}</b></div>
          {error && <div className="error-banner">{error}</div>}
          <button className="primary-button full-button" type="submit" disabled={placing}>{placing ? "Placing order…" : "Place demo order"} <ArrowRight size={16}/></button>
        </form>
      </section></div>}
    </div>
  );
}
