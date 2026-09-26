/* ===================================================================
   main.js  — Global site logic: header, mobile menu, search
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  initHeader();
  initMobileMenu();
  initSearch();
});

/* ---- Sticky Header ---- */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const overlay   = document.getElementById('mobile-overlay');
  if (!hamburger || !navLinks) return;

  const open  = () => {
    navLinks.classList.add('open');
    overlay && overlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    navLinks.classList.remove('open');
    overlay && overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    navLinks.classList.contains('open') ? close() : open();
  });
  overlay && overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ---- Search ---- */
function initSearch() {
  const input = document.getElementById('nav-search-input');
  const btn   = document.getElementById('nav-search-btn');
  if (!input) return;

  const doSearch = () => {
    const q = input.value.trim();
    if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
  };

  btn && btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}
