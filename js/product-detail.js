/* ===================================================================
   product-detail.js  — Product detail page rendering & interactions
   =================================================================== */

let currentQty = 1;
let product = null;

document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  loadProduct();
});

function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) { window.location.href = 'products.html'; return; }
  product = getProductById(parseInt(id));
  if (!product) { window.location.href = 'products.html'; return; }

  renderProductDetail();
  renderRelatedProducts();
  updateMeta();
}

function updateMeta() {
  document.getElementById('meta-title').textContent = product.name + ' – DishaMail';
  document.getElementById('meta-desc').content = product.description;
  document.getElementById('bc-name').textContent = product.name;
}

function renderProductDetail() {
  const main = document.getElementById('product-detail-main');
  const inWish = Cart.isInWishlist(product.id);
  const discount = discountPct(product.price, product.mrp);

  const stockColor = product.stock > 10 ? 'stock-in' :
                     product.stock > 0  ? 'stock-low' : 'stock-out';
  const stockText  = product.stock > 10 ? `In Stock (${product.stock} available)` :
                     product.stock > 0  ? `Only ${product.stock} left!` : 'Out of Stock';

  const specsRows = Object.entries(product.specs || {}).map(([k,v]) =>
    `<tr><td>${k}</td><td>${v}</td></tr>`
  ).join('');

  main.innerHTML = `
    <!-- GALLERY -->
    <div class="product-gallery" id="product-gallery">
      <div class="main-image-wrap">
        <img src="${product.image}" alt="${product.name}" id="main-product-img" />
        <button class="gallery-zoom-btn" onclick="openZoom()" title="Zoom">🔍</button>
        <div class="gallery-badge">
          ${product.badge ? `<span class="product-badge badge-${product.badge}">${product.badge.toUpperCase()}</span>` : ''}
        </div>
      </div>
      <div class="thumb-strip" id="thumb-strip">
        <div class="thumb active"><img src="${product.image}" alt="View 1" /></div>
        <div class="thumb"><img src="${product.image}" alt="View 2" style="filter:brightness(0.8) hue-rotate(15deg)" /></div>
        <div class="thumb"><img src="${product.image}" alt="View 3" style="filter:brightness(0.7) hue-rotate(30deg)" /></div>
      </div>
    </div>

    <!-- INFO -->
    <div class="product-detail-info">
      <div class="pd-brand">${product.brand}</div>
      <h1 class="pd-name">${product.name}</h1>

      <div class="pd-rating">
        <span class="pd-stars">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5-Math.round(product.rating))}</span>
        <strong style="color:var(--clr-white);">${product.rating}</strong>
        <span class="pd-review-count">(${product.reviews} reviews)</span>
        <span style="color:var(--clr-text-3);">|</span>
        <span class="pd-stock">
          <span class="stock-dot ${stockColor}"></span>
          <span style="color:var(--clr-text-2);">${stockText}</span>
        </span>
      </div>

      ${product.socialProof ? `
        <div class="pd-social-proof">
          <span>🛒</span> ${product.socialProof}
        </div>
      ` : ''}

      <!-- PRICE -->
      <div class="pd-price-section">
        <div>
          <span class="pd-price">${formatCurrency(product.price)}</span>
          ${product.mrp > product.price ? `<span class="pd-mrp">${formatCurrency(product.mrp)}</span>` : ''}
        </div>
        ${discount > 0 ? `<div class="pd-discount">You save ${formatCurrency(product.mrp - product.price)} (${discount}% OFF)</div>` : ''}
        <div class="pd-tax-note">Inclusive of all taxes. Free shipping above ₹2,999.</div>
      </div>

      <!-- ACTIONS -->
      <div class="pd-actions">
        <div class="pd-qty-row">
          <span class="pd-qty-label">Qty:</span>
          <div class="pd-qty-control">
            <button class="pd-qty-btn" onclick="adjustQty(-1)">−</button>
            <input class="pd-qty-val" type="number" id="pd-qty-input" value="1" min="1" max="10" onchange="setQty(parseInt(this.value))" />
            <button class="pd-qty-btn" onclick="adjustQty(1)">+</button>
          </div>
        </div>
        <div class="pd-btn-row">
          <button class="pd-atc-btn" id="pd-atc-btn" onclick="pdAddToCart()">
            🛒 Add to Cart
          </button>
          <button class="pd-buy-btn" onclick="pdBuyNow()">
            Buy Now
          </button>
          <button class="pd-wish-btn ${inWish ? 'active' : ''}" id="pd-wish-btn" onclick="pdToggleWish()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${inWish ? '#ef4444' : 'none'}" stroke="${inWish ? '#ef4444' : 'currentColor'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- DELIVERY -->
      <div class="pd-delivery">
        <div class="pd-delivery-row">
          <span class="pd-delivery-icon">🚚</span>
          <span><strong>Free Delivery</strong> on orders above ₹2,999. Estimated in 2-4 days.</span>
        </div>
        <div class="pd-delivery-row">
          <span class="pd-delivery-icon">↩️</span>
          <span><strong>7-Day Returns.</strong> Easy hassle-free returns.</span>
        </div>
        <div class="pd-delivery-row">
          <span class="pd-delivery-icon">🛡️</span>
          <span><strong>Genuine Product.</strong> 100% authentic with manufacturer warranty.</span>
        </div>
      </div>

      <!-- TABS: Description / Specs -->
      <div>
        <div class="pd-tabs">
          <button class="pd-tab active" id="tab-desc" onclick="showTab('desc')">Description</button>
          <button class="pd-tab" id="tab-specs" onclick="showTab('specs')">Specifications</button>
        </div>
        <div style="padding:1rem 0;">
          <div id="tab-content-desc" class="pd-description">
            <p>${product.description}</p>
          </div>
          <div id="tab-content-specs" class="pd-specs" style="display:none;">
            <table class="specs-table">
              <tbody>${specsRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Thumbnail clicks
  document.querySelectorAll('.thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const mainImg = document.getElementById('main-product-img');
      const thumbImg = thumb.querySelector('img');
      if (mainImg && thumbImg) {
        mainImg.src = thumbImg.src;
        mainImg.style.filter = thumbImg.style.filter || '';
      }
    });
  });
}

function showTab(tab) {
  document.getElementById('tab-content-desc').style.display  = tab === 'desc'  ? 'block' : 'none';
  document.getElementById('tab-content-specs').style.display = tab === 'specs' ? 'block' : 'none';
  document.getElementById('tab-desc').classList.toggle('active',  tab === 'desc');
  document.getElementById('tab-specs').classList.toggle('active', tab === 'specs');
}

function adjustQty(delta) {
  currentQty = Math.min(10, Math.max(1, currentQty + delta));
  const input = document.getElementById('pd-qty-input');
  if (input) input.value = currentQty;
}
function setQty(val) {
  currentQty = Math.min(10, Math.max(1, isNaN(val) ? 1 : val));
}

function pdAddToCart() {
  Cart.addToCart(product.id, currentQty);
  const btn = document.getElementById('pd-atc-btn');
  if (btn) {
    btn.textContent = '✓ Added to Cart!';
    btn.style.background = 'var(--clr-success)';
    setTimeout(() => {
      btn.innerHTML = '🛒 Add to Cart';
      btn.style.background = '';
    }, 2000);
  }
}

function pdBuyNow() {
  Cart.addToCart(product.id, currentQty);
  window.location.href = 'checkout.html';
}

function pdToggleWish() {
  Cart.toggleWishlist(product.id);
  const inWish = Cart.isInWishlist(product.id);
  const btn = document.getElementById('pd-wish-btn');
  if (btn) {
    btn.classList.toggle('active', inWish);
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="${inWish ? '#ef4444' : 'none'}" stroke="${inWish ? '#ef4444' : 'currentColor'}" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    `;
  }
}

function openZoom() {
  // Simple zoom overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
  overlay.innerHTML = `<img src="${product.image}" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:12px;" />`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}

function renderRelatedProducts() {
  const grid = document.getElementById('related-products');
  if (!grid) return;
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const others  = related.length < 4
    ? [...related, ...PRODUCTS.filter(p => p.id !== product.id && !related.includes(p)).slice(0, 4 - related.length)]
    : related;
  grid.innerHTML = others.map(buildProductCard).join('');
}
