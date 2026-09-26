/* ===================================================================
   cart.js  — Shopping cart & wishlist logic (localStorage-backed)
   =================================================================== */

const Cart = (() => {
  const CART_KEY    = 'tn_cart';
  const WISH_KEY    = 'tn_wishlist';

  /* ---- Internal Helpers ---- */
  const load   = key => JSON.parse(localStorage.getItem(key) || '[]');
  const save   = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  /* ---- CART ---- */
  function getCart()            { return load(CART_KEY); }

  function addToCart(productId, qty = 1) {
    const cart = getCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 10);
    } else {
      cart.push({ id: productId, qty });
    }
    save(CART_KEY, cart);
    updateCartBadge();
    showToast(`Added to cart!`, 'success');
    return cart;
  }

  function removeFromCart(productId) {
    const cart = getCart().filter(i => i.id !== productId);
    save(CART_KEY, cart);
    updateCartBadge();
    return cart;
  }

  function updateQty(productId, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      if (qty <= 0) return removeFromCart(productId);
      item.qty = Math.min(qty, 10);
    }
    save(CART_KEY, cart);
    updateCartBadge();
    return cart;
  }

  function clearCart() {
    save(CART_KEY, []);
    updateCartBadge();
  }

  function getCartTotal() {
    return getCart().reduce((sum, item) => {
      const prod = getProductById(item.id);
      return sum + (prod ? prod.price * item.qty : 0);
    }, 0);
  }

  function getCartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function updateCartBadge() {
    const count = getCartCount();
    document.querySelectorAll('#cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ---- WISHLIST ---- */
  function getWishlist()         { return load(WISH_KEY); }

  function toggleWishlist(productId) {
    const list = getWishlist();
    const idx  = list.indexOf(productId);
    if (idx > -1) {
      list.splice(idx, 1);
      showToast('Removed from wishlist', 'info');
    } else {
      list.push(productId);
      showToast('Added to wishlist! ♥', 'success');
    }
    save(WISH_KEY, list);
    updateWishBadge();
    return list;
  }

  function isInWishlist(productId) {
    return getWishlist().includes(productId);
  }

  function clearWishlist() {
    save(WISH_KEY, []);
    updateWishBadge();
    showToast('Wishlist cleared', 'info');
    return [];
  }

  function updateWishBadge() {
    const count = getWishlist().length;
    document.querySelectorAll('#wishlist-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ---- INIT ---- */
  function init() {
    updateCartBadge();
    updateWishBadge();
  }

  return { getCart, addToCart, removeFromCart, updateQty, clearCart,
           getCartTotal, getCartCount, updateCartBadge,
           getWishlist, toggleWishlist, clearWishlist, isInWishlist, updateWishBadge, init };
})();

/* ===================================================================
   Toast Notification
   =================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ===================================================================
   Product Card Builder
   =================================================================== */
function buildProductCard(product) {
  const discount = discountPct(product.price, product.mrp);
  const inWish   = Cart.isInWishlist(product.id);
  const badgeHTML = product.badge
    ? `<span class="product-badge badge-${product.badge}">${product.badge.toUpperCase()}</span>`
    : '';
  const stockHTML = product.stock <= 5
    ? `<span class="product-badge badge-stock">Only ${product.stock} left!</span>` : '';

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-img-wrap">
        <a href="product.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
        </a>
        <div class="product-badges">
          ${badgeHTML}
          ${stockHTML}
        </div>
        <button
          class="product-wishlist-btn ${inWish ? 'active' : ''}"
          onclick="handleWishlist(${product.id}, this)"
          aria-label="Toggle wishlist"
          id="wish-${product.id}"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${inWish ? '#ef4444' : 'none'}" stroke="${inWish ? '#ef4444' : 'currentColor'}" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <a href="product.html?id=${product.id}">
          <div class="product-name">${product.name}</div>
        </a>
        <div class="product-rating">
          ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5-Math.round(product.rating))}
          <span>(${product.reviews})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatCurrency(product.price)}</span>
          ${product.mrp > product.price ? `<span class="product-mrp">${formatCurrency(product.mrp)}</span>` : ''}
          ${discount > 0 ? `<span class="product-discount">${discount}% OFF</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn-add-cart" onclick="handleAddToCart(${product.id})" id="atc-${product.id}">
            Add to Cart
          </button>
          <a href="product.html?id=${product.id}" class="btn-view">View</a>
        </div>
      </div>
    </div>
  `;
}

/* ===================================================================
   Global Event Handlers
   =================================================================== */
function handleAddToCart(productId) {
  Cart.addToCart(productId);
  const btn = document.getElementById(`atc-${productId}`);
  if (btn) {
    btn.textContent = '✓ Added';
    btn.style.background = 'var(--clr-success)';
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.style.background = '';
    }, 1500);
  }
}

function handleWishlist(productId, btn) {
  Cart.toggleWishlist(productId);
  const inWish = Cart.isInWishlist(productId);
  btn.classList.toggle('active', inWish);
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="${inWish ? '#ef4444' : 'none'}" stroke="${inWish ? '#ef4444' : 'currentColor'}" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  `;
}
