import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Star, MessageCircle } from "lucide-react";

// ====== CONFIG ======
const WHATSAPP_NUMBER = "+9647707409507";

// ====== HOOKS ======
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

// ====== STYLES ======
const styles = {
  body: { fontFamily: "system-ui, sans-serif", margin: 0, background: "#f9fafb", color: "#1e293b", minHeight: "100vh" },
  container: { maxWidth: 1120, margin: "0 auto", padding: 16 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" },
  logo: { fontWeight: 900, fontSize: 36, background: "linear-gradient(90deg,#6d28d9,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid #e5e7eb", outline: "none", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  btnPrimary: { padding: "10px 16px", borderRadius: 12, border: "none", background: "linear-gradient(90deg,#6d28d9,#8b5cf6)", color: "#fff", cursor: "pointer", fontWeight: 600 },
  card: { background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" },
  cardImg: { width: "100%", height: 180, objectFit: "cover", background: "#f1f5f9" },
  pill: { padding: "8px 14px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" },
  pillActive: { background: "#6d28d9", color: "#fff", borderColor: "#6d28d9" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 45 },
  drawer: { position: "fixed", top: 0, right: 0, height: "100%", width: "88%", maxWidth: 420, background: "#fff", borderLeft: "1px solid #e5e7eb", boxShadow: "-8px 0 24px rgba(0,0,0,0.08)", zIndex: 50, transform: "translateX(100%)", transition: "transform 0.25s ease", display: "flex", flexDirection: "column" },
  drawerOpen: { transform: "translateX(0)" },
  toast: { position: "fixed", left: "50%", bottom: 76, transform: "translateX(-50%)", background: "linear-gradient(90deg,#6d28d9,#8b5cf6)", color: "#fff", padding: "10px 14px", borderRadius: 12, zIndex: 60, fontWeight: 600 },
};

// ====== COMPONENTS ======
function Header({ onOpenCart, search, setSearch }) {
  return (
    <div style={styles.header}>
      <div style={styles.logo}>GN</div>
      <div style={{ flex: 1, margin: "0 12px" }}>
        <div style={{ position: "relative" }}>
          <Search size={20} style={{ position: "absolute", left: 10, top: 10, color: "#64748b" }} />
          <input style={{ ...styles.input, paddingLeft: 36 }} placeholder="ابحث عن منتج…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <button style={{ ...styles.btnPrimary, padding: "10px" }} onClick={onOpenCart}>
        <ShoppingCart size={20} />
      </button>
    </div>
  );
}

function ProductCard({ p, onAdd }) {
  return (
    <motion.div layout initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} style={styles.card}>
      <div style={{ position: "relative" }}>
        <img src={p.Image} alt={p.Name} style={styles.cardImg} />
        {p.Discount && (
          <span style={{ position: "absolute", left: 8, top: 8, background: "#6d28d9", color: "#fff", padding: "2px 8px", borderRadius: 999, fontSize: 12 }}>{p.Discount}</span>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{p.Name}</h3>
        <p style={{ color: "#64748b", fontSize: 13, height: 36, overflow: "hidden" }}>{p.Description}</p>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} fill={i < Math.round(p.Rating || 0) ? "#f59e0b" : "none"} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <strong>${Number(p.Price || 0).toFixed(2)}</strong>
          <button style={styles.btnPrimary} onClick={() => onAdd(p)}>
            أضف للسلة
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CartDrawer({ open, cart, setCart }) {
  const total = cart.reduce((s, x) => s + Number(x.Price || 0) * x.qty, 0);
  const inc = id => setCart(prev => prev.map(x => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  const dec = id => setCart(prev => prev.map(x => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)));
  const del = id => setCart(prev => prev.filter(x => x.id !== id));
  const checkout = () => {
    if (!cart.length) return;
    const lines = ["🛒 GN Shop – Order", "", ...cart.map(x => `• ${x.Name} x${x.qty} — $${Number(x.Price || 0) * x.qty}`), "", `Total: $${total}`];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${text}`, "_blank");
  };

  return (
    <>
      {open && <div style={styles.overlay} onClick={() => setCart([])} />}
      <motion.div animate={open ? { x: 0 } : { x: "100%" }} style={{ ...styles.drawer, x: 0 }}>
        <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
          <strong>سلة المشتريات</strong>
          <button onClick={() => setCart([])}>إغلاق</button>
        </div>
        <div style={{ padding: 12, overflow: "auto", flex: 1 }}>
          {cart.length === 0 ? <p style={{ color: "#64748b" }}>سلتك فارغة.</p> : cart.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid #e5e7eb", borderRadius: 14, padding: 8, marginBottom: 10 }}>
              <img src={item.Image} alt={item.Name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, background: "#f1f5f9" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.Name}</strong>
                  <span>${Number(item.Price || 0) * item.qty}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <button onClick={() => dec(item.id)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => inc(item.id)}>+</button>
                  <button style={{ marginInlineStart: "auto", color: "#ef4444" }} onClick={() => del(item.id)}>إزالة</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#64748b" }}>الإجمالي</span>
            <strong>${total}</strong>
          </div>
          <button style={styles.btnPrimary} disabled={cart.length === 0} onClick={checkout}>إتمام الشراء عبر واتساب</button>
        </div>
      </motion.div>
    </>
  );
}

function WhatsAppBar() {
  const text = encodeURIComponent("مرحباً، أحتاج مساعدة حول المنتجات.");
  const href = `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${text}`;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(90deg,#22c55e,#16a34a)", padding: 10, zIndex: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, color: "#fff", fontWeight: 600, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
      <MessageCircle size={18} />
      <a href={href} target="_blank" rel="noreferrer" style={{ color: "#fff", textDecoration: "none" }}>تواصل واتساب: {WHATSAPP_NUMBER}</a>
    </div>
  );
}

// ====== APP ======
function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [cart, setCart] = useLocalStorage("cart", []);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  const addToCart = item => { setCart(prev => { const ex = prev.find(x => x.id === item.id); return ex ? prev.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x) : [...prev, { ...item, qty: 1 }]; }); setToast("✅ تمت الإضافة للسلة"); };

  useEffect(() => {
    setTimeout(() => {
      setProducts([
        { id: 1, Name: "منتج 1", Price: 10, Image: "https://picsum.photos/300/200?1", Description: "وصف المنتج 1", Rating: 4 },
        { id: 2, Name: "منتج 2", Price: 20, Image: "https://picsum.photos/300/200?2", Description: "وصف المنتج 2", Rating: 5 },
        { id: 3, Name: "منتج 3", Price: 15, Image: "https://picsum.photos/300/200?3", Description: "وصف المنتج 3", Rating: 3 }
      ]);
    }, 500);
  }, []);

  const categories = useMemo(() => ["الكل", "عام", "جديد"], []);
  const visible = useMemo(() => products.filter(p => category === "الكل" || p.Category === category).filter(p => !search || (p.Name + p.Description).toLowerCase().includes(search.toLowerCase())), [products, category, search]);

  return (
    <div style={styles.body}>
      <Header onOpenCart={() => setCartOpen(true)} search={search} setSearch={setSearch} />
      <div style={styles.container}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "8px 0" }}>
          {categories.map(c => <button key={c} style={c === category ? { ...styles.pill, ...styles.pillActive } : styles.pill} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16, marginTop: 12 }}>
          <AnimatePresence initial={false}>
            {visible.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>{toast && <motion.div key="toast" style={styles.toast} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onAnimationComplete={() => setTimeout(() => setToast(""), 1500)}>{toast}</motion.div>}</AnimatePresence>
      <CartDrawer open={cartOpen} cart={cart} setCart={setCart} />
      <WhatsAppBar />
    </div>
  );
}

// ====== RENDER ======
const root = createRoot(document.getElementById("root"));
root.render(<App />);
