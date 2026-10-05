/* ===================================================================
   home.js  — Home page logic: featured products, timer, testimonials
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  initTimer();
  initTestimonials();
});

/* ---- Products: Pinned 1st, then Price Low to High (Total 8) ---- */
function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const pinned = PRODUCTS.filter(p => p.pinned);
  const others = PRODUCTS.filter(p => !p.pinned).sort((a, b) => a.price - b.price);
  const products = [...pinned, ...others].slice(0, 8);
  grid.innerHTML = products.map(buildProductCard).join('');
}

/* ---- Countdown Timer ---- */
function initTimer() {
  const hEl = document.getElementById('timer-h');
  const mEl = document.getElementById('timer-m');
  const sEl = document.getElementById('timer-s');
  if (!hEl) return;

  // Set end time 8 hours from now, stored in sessionStorage
  const key = 'tn_deal_end';
  let end = parseInt(sessionStorage.getItem(key));
  if (!end || end < Date.now()) {
    end = Date.now() + 8 * 60 * 60 * 1000;
    sessionStorage.setItem(key, end);
  }

  function tick() {
    const diff = Math.max(0, end - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    hEl.textContent = String(h).padStart(2,'0');
    mEl.textContent = String(m).padStart(2,'0');
    sEl.textContent = String(s).padStart(2,'0');
    if (diff > 0) requestAnimationFrame(() => setTimeout(tick, 1000));
  }
  tick();
}

/* ---- Testimonials Slider ---- */
function initTestimonials() {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.dot');
  if (!cards.length) return;

  let current = 0;

  function show(index) {
    cards.forEach((c, i) => c.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    current = index;
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

  // Auto-advance every 5s
  setInterval(() => show((current + 1) % cards.length), 5000);
}
