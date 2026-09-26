/* ===================================================================
   cart-page.js  — Cart page rendering, coupon, summary
   =================================================================== */

const COUPONS = {
  'SAVE10':   { type: 'percent', value: 10, label: '10% OFF' },
  'NEXUS20':  { type: 'percent', value: 20, label: '20% OFF' },
  'FLAT500':  { type: 'flat',    value: 500, label: '₹500 OFF' },
  'WELCOME':  { type: 'percent', value: 15, label: '15% OFF' },
};
let appliedCoupon = null;

document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  renderCartPage();
  renderRelated();
});

function renderCartPage() {
  const cart     = Cart.getCart();
  const cartMain = document.getElementById('cart-page');
  const emptyDiv = document.getElementById('empty-cart');
  const related  = document.getElementById('related');

  if (cart.length === 0) {
    cartMain && (cartMain.style.display = 'none');
    document.getElementById('cart-items-section') && (document.getElementById('cart-items-section').style.display = 'none');
    emptyDiv && (emptyDiv.style.display = 'flex');
  } else {
    emptyDiv && (emptyDiv.style.display = 'none');
    cartMain && (cartMain.style.display = 'grid');
    renderCartItems(cart);
    renderOrderSummary(cart);
  }
  Cart.updateCartBadge();
}

function renderCartItems(cart) {
  const list = document.getElementById('cart-items-list');
  if (!list) return;

  list.innerHTML = cart.map(item => {
    const p = getProductById(item.id);
    if (!p) return '';
    const subtotal = p.price * item.qty;
    return `
      <div class="cart-item" id="cart-item-${p.id}">
        <div class="cart-item-img">
          <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy" /></a>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-brand">${p.brand}</div>
          <a href="product.html?id=${p.id}"><div class="cart-item-name">${p.name}</div></a>
          <div>
            <span class="cart-item-price">${formatCurrency(p.price)}</span>
            ${p.mrp > p.price ? `<span class="cart-item-mrp">${formatCurrency(p.mrp)}</span>` : ''}
          </div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${p.id}, ${item.qty - 1})">−</button>
            <input class="qty-val" type="number" min="1" max="10" value="${item.qty}"
              onchange="changeQty(${p.id}, parseInt(this.value))" aria-label="Quantity" />
            <button class="qty-btn" onclick="changeQty(${p.id}, ${item.qty + 1})">+</button>
          </div>
          <div style="font-size:0.85rem;color:var(--clr-text-2);">Subtotal: <strong style="color:var(--clr-white)">${formatCurrency(subtotal)}</strong></div>
          <button class="cart-remove-btn" onclick="removeItem(${p.id})">🗑 Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderOrderSummary(cart) {
  const rows = document.getElementById('summary-rows');
  if (!rows) return;

  const subtotal  = Cart.getCartTotal();
  const shipping  = subtotal >= 2999 ? 0 : 149;
  const discount  = appliedCoupon ? calcDiscount(subtotal, appliedCoupon) : 0;
  const tax       = Math.round((subtotal - discount) * 0.18);
  const total     = subtotal - discount + shipping + tax;

  let html = `
    <div class="summary-row"><span>Subtotal (${Cart.getCartCount()} items)</span><span class="val">${formatCurrency(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span class="val">${shipping === 0 ? '<span style="color:var(--clr-success)">FREE</span>' : formatCurrency(shipping)}</span></div>
    <div class="summary-row"><span>GST (18%)</span><span class="val">${formatCurrency(tax)}</span></div>
  `;
  if (discount > 0) {
    html += `<div class="summary-row saving"><span>Coupon (${appliedCoupon.label})</span><span>−${formatCurrency(discount)}</span></div>`;
  }
  rows.innerHTML = html;
  const totalEl = document.getElementById('order-total');
  if (totalEl) totalEl.textContent = formatCurrency(total);

  // Store for checkout
  sessionStorage.setItem('tn_order_total', total);
  sessionStorage.setItem('tn_order_subtotal', subtotal);
  sessionStorage.setItem('tn_order_shipping', shipping);
  sessionStorage.setItem('tn_order_tax', tax);
  sessionStorage.setItem('tn_order_discount', discount);
}

function calcDiscount(subtotal, coupon) {
  return coupon.type === 'percent'
    ? Math.round(subtotal * coupon.value / 100)
    : Math.min(coupon.value, subtotal);
}

function changeQty(productId, newQty) {
  Cart.updateQty(productId, newQty);
  renderCartPage();
}

function removeItem(productId) {
  Cart.removeFromCart(productId);
  showToast('Item removed from cart', 'info');
  renderCartPage();
}

function handleClearCart() {
  if (!confirm('Clear all items from cart?')) return;
  Cart.clearCart();
  renderCartPage();
}

function applyCoupon() {
  const code = document.getElementById('coupon-input')?.value.trim().toUpperCase();
  if (!code) return;
  const coupon = COUPONS[code];
  if (!coupon) {
    showToast('Invalid coupon code', 'error');
    return;
  }
  appliedCoupon = { ...coupon, code };
  showToast(`Coupon applied! ${coupon.label}`, 'success');
  renderCartPage();
}

function renderRelated() {
  const grid = document.getElementById('related-grid');
  if (!grid) return;
  const products = PRODUCTS.filter(p => p.featured).slice(0, 4);
  grid.innerHTML = products.map(buildProductCard).join('');
}
