/* ===================================================================
   checkout.js  — Checkout page: order summary, form validation, Paytm
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  renderCheckoutSummary();
  redirectIfEmpty();
});

/* ---- Redirect if cart is empty ---- */
function redirectIfEmpty() {
  if (Cart.getCart().length === 0) {
    window.location.href = 'cart.html';
  }
}

/* ---- Render Order Summary in Sidebar ---- */
function renderCheckoutSummary() {
  const cart = Cart.getCart();

  // Mini cart items
  const itemsList = document.getElementById('checkout-cart-items');
  if (itemsList) {
    itemsList.innerHTML = cart.map(item => {
      const p = getProductById(item.id);
      if (!p) return '';
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--clr-border);">
          <img src="${p.image}" alt="${p.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;background:var(--clr-bg-3);" loading="lazy" />
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.8rem;font-weight:600;color:var(--clr-white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
            <div style="font-size:0.75rem;color:var(--clr-text-2);">Qty: ${item.qty}</div>
          </div>
          <span style="font-size:0.85rem;font-weight:700;color:var(--clr-white);white-space:nowrap;">${formatCurrency(p.price * item.qty)}</span>
        </div>
      `;
    }).join('');
  }

  // Summary rows
  const cartSubtotal = Cart.getCartTotal();
  const storedSubtotal = sessionStorage.getItem('dm_order_subtotal') || sessionStorage.getItem('tn_order_subtotal');
  const subtotal = cartSubtotal;
  
  let discount = parseInt(sessionStorage.getItem('dm_order_discount') || sessionStorage.getItem('tn_order_discount') || 0);
  if (storedSubtotal && parseInt(storedSubtotal) !== cartSubtotal) {
    discount = 0; // invalidate discount if cart changed
  }

  const shipping = subtotal >= 2999 ? 0 : 149;
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + shipping + tax;

  const rows = document.getElementById('checkout-summary-rows');
  if (rows) {
    rows.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span class="val">${formatCurrency(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span class="val">${shipping === 0 ? '<span style="color:var(--clr-success)">FREE</span>' : formatCurrency(shipping)}</span></div>
      <div class="summary-row"><span>GST (18%)</span><span class="val">${formatCurrency(tax)}</span></div>
      ${discount > 0 ? `<div class="summary-row saving"><span>Discount</span><span>−${formatCurrency(discount)}</span></div>` : ''}
    `;
  }
  const totalEl = document.getElementById('checkout-total');
  if (totalEl) totalEl.textContent = formatCurrency(total);
  
  sessionStorage.setItem('dm_order_final', total);
  sessionStorage.setItem('tn_order_final', total);
}

/* ---- Form Validation ---- */
function validateForm() {
  const fields = [
    { id: 'first-name', label: 'First name', required: true },
    { id: 'last-name',  label: 'Last name',  required: true },
    { id: 'email',      label: 'Email',       required: true, type: 'email' },
    { id: 'phone',      label: 'Phone',       required: true, type: 'phone' },
    { id: 'address-line1', label: 'Address', required: true },
    { id: 'city',       label: 'City',        required: true },
    { id: 'state',      label: 'State',       required: true },
    { id: 'pincode',    label: 'PIN Code',    required: true, type: 'pincode' },
  ];

  let valid = true;

  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById('err-' + f.id.replace('address-line1','address1'));
    if (!el) return;
    const val = el.value.trim();
    let msg   = '';

    if (f.required && !val) {
      msg = `${f.label} is required.`;
    } else if (f.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Enter a valid email.';
    } else if (f.type === 'phone' && val && !/^\+?[\d\s-]{10,15}$/.test(val)) {
      msg = 'Enter a valid phone number.';
    } else if (f.type === 'pincode' && val && !/^\d{6}$/.test(val)) {
      msg = 'PIN code must be 6 digits.';
    }

    if (msg) {
      valid = false;
      el.classList.add('error');
      if (err) err.textContent = msg;
    } else {
      el.classList.remove('error');
      if (err) err.textContent = '';
    }
  });

  return valid;
}

/* ---- Place Order ---- */
function placeOrder() {
  if (!validateForm()) {
    showToast('Please fill all required fields', 'error');
    // Scroll to first error
    const firstErr = document.querySelector('.form-control.error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Save order data (payment via secure online payment gateway)
  const orderData = {
    id:      'DM' + Date.now().toString().slice(-8),
    name:    (document.getElementById('first-name')?.value || '') + ' ' + (document.getElementById('last-name')?.value || ''),
    email:   document.getElementById('email')?.value || '',
    phone:   document.getElementById('phone')?.value || '',
    address: [
      document.getElementById('address-line1')?.value,
      document.getElementById('address-line2')?.value,
      document.getElementById('city')?.value,
      document.getElementById('state')?.value,
      document.getElementById('pincode')?.value,
      'India'
    ].filter(Boolean).join(', '),
    payment: 'online',
    total:   sessionStorage.getItem('dm_order_final') || sessionStorage.getItem('tn_order_final') || '0',
    date:    new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }),
    items:   JSON.stringify(Cart.getCart()),
  };
  sessionStorage.setItem('dm_last_order', JSON.stringify(orderData));
  sessionStorage.setItem('tn_last_order', JSON.stringify(orderData));

  // ----- PAYMENT GATEWAY INTEGRATION POINT -----
  // 1. Call your backend: POST /api/payment/createOrder → { orderId, amount, currency }
  // 2. Invoke client-side checkout SDK (Razorpay, Cashfree, PhonePe, Paytm, or Stripe)
  // 3. Handle payment response, verify signature, and redirect to confirmation

  simulatePayment();
}

/* ---- Simulate payment & redirect ---- */
function simulatePayment() {
  const btn = document.getElementById('place-order-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-loader"></span> Processing…';
    btn.style.opacity = '0.8';
  }

  // Simulate async payment
  setTimeout(() => {
    Cart.clearCart();
    window.location.href = 'confirmation.html';
  }, 2000);
}
