import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, Whatsapp } from "lucide-react";

// ====== إعداداتك ======
const SHEET_URL = "https://opensheet.elk.sh/YOUR_SHEET_ID/1"; // ضع رابط Google Sheet هنا
const WHATSAPP_NUMBER = "+9647700000000"; // رقمك بالواتساب

// ====== المكونات ======
const Header = ({ onCartClick, search, setSearch }) => (
  <header className="header">
    <h1 className="logo">🛍️ GN Shop</h1>
    <input
      type="text"
      className="search"
      placeholder="🔍 ابحث عن منتج..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <button className="cart-btn" onClick={onCartClick}>
      <ShoppingCart size={20} /> سلة
    </button>
  </header>
);

const ProductCard = ({ p, onAdd }) => (
  <motion.div
    layout
    whileHover={{ scale: 1.05 }}
    className="product-card"
  >
    <img src={p.Image || "https://via.placeholder.com/200"} alt={p.Name} />
    <h3>{p.Name}</h3>
    <p className="desc">{p.Description}</p>
    <p className="price">${p.Price}</p>
    <button onClick={() => onAdd(p)}>أضف للسلة</button>
  </motion.div>
);

const CartDrawer = ({ open, cart, setCart, onCheckout }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="cart-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
      >
        <h2>🛒 سلة المشتريات</h2>
        {cart.length === 0 && <p>السلة فارغة</p>}
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <span>{item.Name}</span>
            <div className="cart-controls">
              <button onClick={() =>
                setCart(c => c.map(x => x.id === item.id && x.qty > 1 ? { ...x, qty: x.qty - 1 } : x))
              }><Minus size={16} /></button>
              <span>{item.qty}</span>
              <button onClick={() =>
                setCart(c => c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x))
              }><Plus size={16} /></button>
              <button onClick={() =>
                setCart(c => c.filter(x => x.id !== item.id))
              }><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {cart.length > 0 && (
          <button className="checkout-btn" onClick={onCheckout}>
            <Whatsapp size={20} /> إتمام الطلب عبر واتساب
          </button>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch(SHEET_URL)
      .then(res => res.json())
      .then(data => {
        setProducts(data.map((row, i) => ({
          id: i + 1,
          Name: row.Name,
          Price: Number(row.Price),
          Image: row.Image,
          Description: row.Description || ""
        })));
      })
      .catch(() => console.error("فشل جلب البيانات من Google Sheets"));
  }, []);

  const visible = useMemo(() =>
    products.filter(p =>
      (p.Name + p.Description).toLowerCase().includes(search.toLowerCase())
    ), [products, search]);

  const addToCart = (item) => {
    setCart(c => {
      const ex = c.find(x => x.id === item.id);
      return ex
        ? c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x)
        : [...c, { ...item, qty: 1 }];
    });
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const lines = cart.map(x => `${x.Name} x${x.qty} = $${x.Price * x.qty}`);
    const total = cart.reduce((s, x) => s + x.Price * x.qty, 0);
    const text = encodeURIComponent(`🛒 طلب جديد:\n\n${lines.join("\n")}\n\nالإجمالي: $${total}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${text}`, "_blank");
  };

  return (
    <div className="app">
      <Header onCartClick={() => setCartOpen(true)} search={search} setSearch={setSearch} />
      <div className="grid">
        {visible.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
      </div>
      <CartDrawer open={cartOpen} cart={cart} setCart={setCart} onCheckout={checkout} />
    </div>
  );
}
