// ── STORAGE HELPERS ──
const get = key => JSON.parse(localStorage.getItem(key) || 'null');
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ── AUTH ──
function getUser() { return get('fm_user'); }
function logout() { localStorage.removeItem('fm_user'); window.location.href = 'index_html.html'; }
function requireAuth() {
  if (!getUser()) { window.location.href = 'login_html.html'; return null; }
  return getUser();
}

// ── PRODUCTS ──
function getProducts() { return get('fm_products') || []; }
function saveProducts(p) { set('fm_products', p); }
function addProduct(product) {
  const products = getProducts();
  product.id = Date.now().toString();
  products.push(product);
  saveProducts(products);
}
function seedProducts() {
  if (getProducts().length > 0) return;
  saveProducts([
    { id: '1', name: 'Fresh Tomatoes',   price: 40,  unit: 'kg',    seller: 'Ravi Farm',     type: 'both',      emoji: '🍅' },
    { id: '2', name: 'Organic Wheat',    price: 25,  unit: 'kg',    seller: 'Green Fields',  type: 'wholesale', emoji: '🌾' },
    { id: '3', name: 'Alphonso Mangoes', price: 120, unit: 'dozen', seller: 'Konkan Farms',  type: 'retail',    emoji: '🥭' },
    { id: '4', name: 'Basmati Rice',     price: 80,  unit: 'kg',    seller: 'Punjab Harvest',type: 'both',      emoji: '🍚' },
    { id: '5', name: 'Fresh Spinach',    price: 30,  unit: 'bunch', seller: 'Ravi Farm',     type: 'retail',    emoji: '🥬' },
    { id: '6', name: 'Potatoes',         price: 20,  unit: 'kg',    seller: 'Hill Farms',    type: 'both',      emoji: '🥔' },
  ]);
}

// ── CART ──
function getCart() { return get('fm_cart') || []; }
function saveCart(c) { set('fm_cart', c); }
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.productId === productId);
  if (existing) { existing.qty += qty; } else { cart.push({ productId, qty }); }
  saveCart(cart);
  showToast('Added to cart 🛒', 'success');
}
function removeFromCart(productId) { saveCart(getCart().filter(i => i.productId !== productId)); }
function clearCart() { saveCart([]); }
function cartTotal() {
  const products = getProducts();
  return getCart().reduce((sum, item) => {
    const p = products.find(x => x.id === item.productId);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

// ── ORDERS ──
function getOrders() { return get('fm_orders') || []; }
function placeOrder() {
  const cart = getCart();
  if (!cart.length) { showToast('Cart is empty!', 'error'); return false; }
  const user = getUser();
  const products = getProducts();
  const items = cart.map(i => {
    const p = products.find(x => x.id === i.productId);
    return { name: p ? p.name : 'Unknown', qty: i.qty, price: p ? p.price : 0 };
  });
  const order = {
    id: 'ORD-' + Date.now(),
    user: user.username,
    role: user.role,
    items,
    total: cartTotal(),
    status: 'Pending',
    date: new Date().toLocaleDateString()
  };
  const orders = getOrders();
  orders.unshift(order);
  set('fm_orders', orders);
  clearCart();
  showToast('Order placed successfully! 🎉', 'success');
  return true;
}

// ── NAVBAR ──
function renderNavbar(activePage) {
  const user = getUser();
  if (!user) return;
  const links = [
    { href: 'dashboard_html.html', label: '🏠 Dashboard', key: 'dashboard' },
    { href: 'products_html.html',  label: '🌿 Products',  key: 'products'  },
    { href: 'cart_html.html',      label: '🛒 Cart',      key: 'cart'      },
    { href: 'orders_html.html',    label: '📦 Orders',    key: 'orders'    },
  ];
  const navEl = document.getElementById('navbar');
  if (!navEl) return;
  navEl.innerHTML = `
    <div class="logo">🌾 <span>Farmer</span>Mart</div>
    <nav class="nav-links">
      ${links.map(l => `<a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">${l.label}</a>`).join('')}
    </nav>
    <div class="nav-user">
      <span>${user.username}</span>
      <span class="badge">${user.role}</span>
      <button class="btn-logout" onclick="logout()">Logout</button>
    </div>`;
}

// ── TOAST ──
function showToast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 2800);
}

// ── INIT ──
seedProducts();
