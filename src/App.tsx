import { useEffect, useState } from 'react';
import { products, type Product } from './products';
import { track, trackingOn } from './tracker';

type Line = { product: Product; qty: number };
type Analytics = { funnel: { event: string; count: number }[]; recent: { name: string; at: string; detail: string }[] };

const labels: Record<string, string> = {
  screen_view: 'Page views',
  product_view: 'Product views',
  add_to_cart: 'Added to cart',
  begin_checkout: 'Checkout started',
  purchase: 'Purchases',
};

export function App() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<Line[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordered, setOrdered] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const count = cart.reduce((n, l) => n + l.qty, 0);
  const total = cart.reduce((n, l) => n + l.qty * l.product.price, 0);

  function view(p: Product) {
    setSelected(p);
    track('product_view', { product: p.name, price: p.price });
  }

  function add(p: Product) {
    setCart(c => {
      const found = c.find(l => l.product.id === p.id);
      return found ? c.map(l => (l === found ? { ...l, qty: l.qty + 1 } : l)) : [...c, { product: p, qty: 1 }];
    });
    track('add_to_cart', { product: p.name, price: p.price });
    setSelected(null);
    setCartOpen(true);
  }

  function checkout() {
    track('begin_checkout', { items: count, total });
    const id = `KC-${Math.floor(1000 + Math.random() * 9000)}`;
    // Demo only: no payment is taken.
    track('purchase', { order: id, items: count, total });
    setOrdered(id);
    setCart([]);
  }

  return (
    <>
      <header className="top">
        <a className="logo" href="#">Kiln<span>.</span></a>
        <span className="demo-tag">Demo store · no real orders</span>
        <div className="top-actions">
          <button className="ghost" onClick={() => setPanelOpen(true)}>
            <i className="dot" aria-hidden="true" /> Live analytics
          </button>
          <button className="cart-btn" onClick={() => { setOrdered(null); setCartOpen(true); }} aria-label={`Cart, ${count} items`}>
            Cart <b>{count}</b>
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Single-origin, roasted weekly</p>
          <h1>Coffee you can taste.<br /><em>Analytics you can trust.</em></h1>
          <p className="lead">
            A demo store wired to a self-hosted OpenPanel. Browse, add to cart and check out, then open
            <strong> Live analytics</strong> to watch your own visit move through the funnel. No cookies, no third parties.
          </p>
        </section>

        <section className="grid" aria-label="Coffees">
          {products.map(p => (
            <article key={p.id} className="card">
              <button className="card-hit" onClick={() => view(p)} aria-label={`View ${p.name}`}>
                <div className="bag" style={{ background: `linear-gradient(150deg, ${p.tone[0]}, ${p.tone[1]})` }}>
                  <span>{p.origin}</span>
                  <strong>{p.name}</strong>
                </div>
              </button>
              <div className="card-body">
                <div>
                  <h2>{p.name}</h2>
                  <p>{p.notes}</p>
                </div>
                <span className="price">${p.price}</span>
              </div>
              <button className="add" onClick={() => add(p)}>Add to cart</button>
            </article>
          ))}
        </section>
      </main>

      <footer className="foot">
        <p>Built by <a href="https://github.com/iAnasAhmed" target="_blank" rel="noopener noreferrer">Anas Ahmed</a> · Analytics by a self-hosted OpenPanel fork.</p>
        <p>{trackingOn ? 'Tracking is on: cookieless and anonymous.' : 'Tracking is off in your browser (Do Not Track / GPC is respected).'}</p>
      </footer>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={e => e.stopPropagation()}>
            <div className="bag big" style={{ background: `linear-gradient(150deg, ${selected.tone[0]}, ${selected.tone[1]})` }}>
              <span>{selected.origin}</span>
              <strong>{selected.name}</strong>
            </div>
            <div className="modal-copy">
              <h2>{selected.name}</h2>
              <p className="muted">{selected.origin} · 250 g whole bean</p>
              <p>{selected.notes}</p>
              <span className="price big-price">${selected.price}</span>
              <div className="row">
                <button className="add" onClick={() => add(selected)}>Add to cart</button>
                <button className="ghost" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <aside className="drawer" aria-label="Cart" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>{ordered ? 'Order placed' : 'Your cart'}</h2>
              <button className="ghost" onClick={() => setCartOpen(false)}>Close</button>
            </div>
            {ordered ? (
              <div className="done">
                <p>Thanks! Demo order <b>{ordered}</b> was tracked as a purchase.</p>
                <button className="add" onClick={() => { setCartOpen(false); setPanelOpen(true); }}>See it in Live analytics</button>
              </div>
            ) : cart.length === 0 ? (
              <p className="muted">Your cart is empty.</p>
            ) : (
              <>
                <ul className="lines">
                  {cart.map(l => (
                    <li key={l.product.id}><span>{l.product.name} × {l.qty}</span><b>${l.qty * l.product.price}</b></li>
                  ))}
                </ul>
                <div className="total"><span>Total</span><b>${total}</b></div>
                <button className="add" onClick={checkout}>Place demo order</button>
                <p className="muted small">No payment is taken.</p>
              </>
            )}
          </aside>
        </div>
      )}

      {panelOpen && <AnalyticsPanel onClose={() => setPanelOpen(false)} />}
    </>
  );
}

function AnalyticsPanel({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/analytics')
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(d => { if (alive) { setData(d); setError(false); } })
        .catch(() => { if (alive) setError(true); });
    load();
    const id = window.setInterval(load, 4000);
    return () => { alive = false; window.clearInterval(id); };
  }, []);

  const top = Math.max(1, ...(data?.funnel.map(f => f.count) ?? [1]));

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="drawer panel" aria-label="Live analytics" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <h2><i className="dot" aria-hidden="true" /> Live analytics</h2>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
        <p className="muted small">Last 24 hours · read from self-hosted OpenPanel · refreshes every 4 s</p>
        {error && <p className="warn">Can’t reach OpenPanel right now.</p>}
        {!data && !error && <p className="muted">Loading…</p>}
        {data && (
          <>
            <h3>Funnel</h3>
            <ol className="funnel">
              {data.funnel.map((f, i) => {
                const prev = i > 0 ? data.funnel[i - 1].count : 0;
                return (
                  <li key={f.event}>
                    <div className="funnel-row">
                      <span>{labels[f.event] ?? f.event}</span>
                      <b>{f.count}</b>
                    </div>
                    <div className="bar"><i style={{ width: `${(f.count / top) * 100}%` }} /></div>
                    {i > 0 && prev > 0 && <small>{Math.round((f.count / prev) * 100)}% from previous step</small>}
                  </li>
                );
              })}
            </ol>
            <h3>Latest events</h3>
            {data.recent.length === 0 ? (
              <p className="muted">No events yet. Browse the store to create some.</p>
            ) : (
              <ul className="feed">
                {data.recent.map((e, i) => (
                  <li key={i}>
                    <code>{e.name}</code>
                    <span>{e.detail}</span>
                    <time>{new Date(e.at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
