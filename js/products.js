/* ===================================================================
   products.js  — Products listing page: filters, sort, pagination
   =================================================================== */

const PAGE_SIZE = 9;
let currentPage = 1;
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  initFilters();
  initSort();
  initViewToggle();
  initMobileFilterToggle();
  parseURLParams();
  renderProducts();
});

/* ---- Parse URL params (category, search, sale) ---- */
function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  const cat    = params.get('cat');
  const search = params.get('search');
  const sale   = params.get('sale');

  if (cat) {
    const radio = document.querySelector(`input[name="cat"][value="${cat}"]`);
    if (radio) radio.checked = true;
    updateBreadcrumb(cat);
  }
  if (search) {
    const input = document.getElementById('nav-search-input');
    if (input) input.value = search;
    document.getElementById('page-title').textContent = `Results for "${search}"`;
  }
  if (sale === 'true') {
    const saleBox = document.getElementById('sale-only');
    if (saleBox) saleBox.checked = true;
  }
  const sort = params.get('sort');
  if (sort) {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = sort;
  }
}

function updateBreadcrumb(cat) {
  const catNames = {
    cpu:'Processors', gpu:'Graphics Cards', ram:'Memory',
    ssd:'Storage', motherboard:'Motherboards', cooler:'Cooling',
    psu:'Power Supplies', case:'PC Cases', repair:'Repair Tools & Parts',
    accessories:'Accessories & Hubs'
  };
  const bc  = document.getElementById('breadcrumb-cat');
  const ttl = document.getElementById('page-title');
  if (bc && catNames[cat]) bc.textContent = catNames[cat];
  if (ttl && catNames[cat]) ttl.textContent = catNames[cat];
}

/* ---- Get Current Filters ---- */
function getFilters() {
  const cat       = document.querySelector('input[name="cat"]:checked')?.value || '';
  const maxPrice  = parseInt(document.getElementById('price-range')?.value || 200000);
  const minRating = parseFloat(document.querySelector('input[name="rating"]:checked')?.value || 0);
  const brands    = [...document.querySelectorAll('#filter-brand input:checked')].map(i => i.value);
  const inStock   = document.getElementById('in-stock-only')?.checked;
  const saleOnly  = document.getElementById('sale-only')?.checked;
  const search    = document.getElementById('nav-search-input')?.value.trim() || '';
  return { cat, maxPrice, minRating, brands, inStock, saleOnly, search };
}

/* ---- Apply filters ---- */
function applyFilters() {
  const { cat, maxPrice, minRating, brands, inStock, saleOnly, search } = getFilters();
  filteredProducts = PRODUCTS.filter(p => {
    if (cat && p.category !== cat) return false;
    if (p.price > maxPrice) return false;
    if (minRating && p.rating < minRating) return false;
    if (brands.length && !brands.includes(p.brand)) return false;
    if (inStock && p.stock <= 0) return false;
    if (saleOnly && !p.sale) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

/* ---- Sort ---- */
function sortProducts() {
  const sort = document.getElementById('sort-select')?.value || 'featured';
  switch (sort) {
    case 'price-asc':  filteredProducts.sort((a,b) => a.price - b.price); break;
    case 'price-desc': filteredProducts.sort((a,b) => b.price - a.price); break;
    case 'rating':     filteredProducts.sort((a,b) => b.rating - a.rating); break;
    case 'discount':   filteredProducts.sort((a,b) => discountPct(b.price,b.mrp) - discountPct(a.price,a.mrp)); break;
    case 'name':       filteredProducts.sort((a,b) => a.name.localeCompare(b.name)); break;
    default:           filteredProducts.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

/* ---- Render ---- */
function renderProducts() {
  applyFilters();
  sortProducts();
  updateActiveFilters();

  const grid   = document.getElementById('products-grid');
  const empty  = document.getElementById('empty-state');
  const count  = document.getElementById('results-count');

  if (!grid) return;

  const total = filteredProducts.length;
  if (count) count.innerHTML = `<span>${total}</span> product${total !== 1 ? 's' : ''} found`;

  if (total === 0) {
    grid.innerHTML = '';
    empty && (empty.style.display = 'flex');
    renderPagination(0);
    return;
  }
  empty && (empty.style.display = 'none');

  // Pagination slice
  const start  = (currentPage - 1) * PAGE_SIZE;
  const page   = filteredProducts.slice(start, start + PAGE_SIZE);
  grid.innerHTML = page.map(buildProductCard).join('');

  renderPagination(total);
}

/* ---- Pagination ---- */
function renderPagination(total) {
  const pag   = document.getElementById('pagination');
  if (!pag) return;
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) { pag.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===pages ? 'disabled' : ''}>›</button>`;
  pag.innerHTML = html;
}

function goPage(n) {
  const total = filteredProducts.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  if (n < 1 || n > pages) return;
  currentPage = n;
  renderProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---- Active Filter Chips ---- */
function updateActiveFilters() {
  const { cat, maxPrice, minRating, brands, inStock, saleOnly, search } = getFilters();
  const container = document.getElementById('active-filters');
  if (!container) return;
  let chips = '';
  if (cat) chips += filterChip(cat.toUpperCase(), () => clearCatFilter());
  if (maxPrice < 200000) chips += filterChip(`Under ${formatCurrency(maxPrice)}`, () => { document.getElementById('price-range').value=200000; triggerRender(); });
  brands.forEach(b => chips += filterChip(b, () => { document.querySelector(`#filter-brand input[value="${b}"]`).checked=false; triggerRender(); }));
  if (minRating) chips += filterChip(`★${minRating}+`, () => { document.querySelector('input[name="rating"][value=""]').checked=true; triggerRender(); });
  if (inStock) chips += filterChip('In Stock', () => { document.getElementById('in-stock-only').checked=false; triggerRender(); });
  if (saleOnly) chips += filterChip('On Sale', () => { document.getElementById('sale-only').checked=false; triggerRender(); });
  if (search) chips += filterChip(`"${search}"`, () => { document.getElementById('nav-search-input').value=''; triggerRender(); });
  container.innerHTML = chips;
}

function filterChip(label, onRemove) {
  const id = 'chip-' + Math.random().toString(36).slice(2);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.querySelector('button').addEventListener('click', onRemove);
  }, 0);
  return `<span class="filter-chip" id="${id}">${label} <button>×</button></span>`;
}

function clearCatFilter() {
  document.querySelector('input[name="cat"][value=""]').checked = true;
  triggerRender();
}

function clearAllFilters() {
  document.querySelector('input[name="cat"][value=""]').checked = true;
  document.querySelector('input[name="rating"][value=""]').checked = true;
  document.getElementById('price-range') && (document.getElementById('price-range').value = 200000);
  document.querySelectorAll('#filter-brand input').forEach(i => i.checked = false);
  const is = document.getElementById('in-stock-only'); if (is) is.checked = false;
  const so = document.getElementById('sale-only');     if (so) so.checked = false;
  const si = document.getElementById('nav-search-input'); if (si) si.value = '';
  triggerRender();
}

/* ---- Init Listeners ---- */
function initFilters() {
  document.querySelectorAll('input[name="cat"], input[name="rating"], #filter-brand input, #in-stock-only, #sale-only')
    .forEach(el => el.addEventListener('change', () => { currentPage = 1; triggerRender(); }));

  const range = document.getElementById('price-range');
  if (range) {
    range.addEventListener('input', () => {
      const v = parseInt(range.value);
      const lbl = document.getElementById('price-label');
      if (lbl) lbl.textContent = v >= 200000 ? '₹2,00,000+' : formatCurrency(v);
      // Update slider gradient
      range.style.background = `linear-gradient(to right, var(--clr-primary) ${v/2000}%, var(--clr-border) ${v/2000}%)`;
    });
    range.addEventListener('change', () => { currentPage = 1; triggerRender(); });
  }

  document.getElementById('clear-filters')?.addEventListener('click', clearAllFilters);
}

function initSort() {
  document.getElementById('sort-select')?.addEventListener('change', () => { currentPage=1; renderProducts(); });
}

function initViewToggle() {
  const grid = document.getElementById('grid-view-btn');
  const list = document.getElementById('list-view-btn');
  const pg   = document.getElementById('products-grid');
  if (!grid || !list) return;
  grid.addEventListener('click', () => { pg?.classList.remove('list-view'); grid.classList.add('active'); list.classList.remove('active'); });
  list.addEventListener('click', () => { pg?.classList.add('list-view'); list.classList.add('active'); grid.classList.remove('active'); });
}

function initMobileFilterToggle() {
  const btn  = document.getElementById('mobile-filter-btn');
  const side = document.getElementById('filters-sidebar');
  const ov   = document.getElementById('mobile-overlay');
  if (!btn || !side) return;
  btn.addEventListener('click', () => {
    side.classList.toggle('open');
    ov?.classList.toggle('open');
  });
  ov?.addEventListener('click', () => { side.classList.remove('open'); ov.classList.remove('open'); });
}

function triggerRender() { currentPage = 1; renderProducts(); }
