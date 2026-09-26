/* ===================================================================
   data.js  — Product catalogue & site data for TechNexus
   =================================================================== */

const PRODUCTS = [
  {
    id: 1,
    name: "Intel Core i9-13900K Processor",
    brand: "Intel",
    category: "cpu",
    price: 42999,
    mrp: 54999,
    image: "assets/images/product_cpu.jpg",
    rating: 4.8,
    reviews: 312,
    badge: "hot",
    stock: 15,
    description: "Unleash extreme performance with 24 cores (8P+16E), up to 5.8 GHz boost. The ultimate desktop processor for gaming, streaming and creation.",
    specs: { Cores: "24 (8P+16E)", Threads: "32", "Base Clock": "3.0 GHz", "Boost Clock": "5.8 GHz", TDP: "125W", Socket: "LGA 1700", Cache: "36 MB L3" },
    featured: true,
    sale: false
  },
  {
    id: 2,
    name: "NVIDIA GeForce RTX 4090 24GB GDDR6X",
    brand: "ASUS ROG",
    category: "gpu",
    price: 154999,
    mrp: 189999,
    image: "assets/images/product_gpu.jpg",
    rating: 4.9,
    reviews: 187,
    badge: "hot",
    stock: 5,
    description: "The world's most powerful desktop GPU. Ada Lovelace architecture with 16,384 CUDA cores and 24GB GDDR6X memory.",
    specs: { VRAM: "24 GB GDDR6X", "CUDA Cores": "16384", "Boost Clock": "2.52 GHz", "Memory Bus": "384-bit", TDP: "450W", Outputs: "HDMI 2.1, 3× DP 1.4a" },
    featured: true,
    sale: false
  },
  {
    id: 3,
    name: "Corsair Dominator Platinum DDR5 32GB Kit",
    brand: "Corsair",
    category: "ram",
    price: 12499,
    mrp: 17999,
    image: "assets/images/product_ram.jpg",
    rating: 4.7,
    reviews: 456,
    badge: "sale",
    stock: 32,
    description: "DDR5-6000 MHz CL30 32GB (2×16GB) with stunning 12 individually-controlled RGB LEDs per module.",
    specs: { Capacity: "32 GB (2×16 GB)", Speed: "DDR5-6000 MHz", Latency: "CL30", Voltage: "1.35 V", RGB: "Yes", Form: "DIMM" },
    featured: true,
    sale: true
  },
  {
    id: 4,
    name: "Samsung 990 Pro NVMe SSD 2TB",
    brand: "Samsung",
    category: "ssd",
    price: 9999,
    mrp: 14999,
    image: "assets/images/product_ssd.jpg",
    rating: 4.9,
    reviews: 892,
    badge: "sale",
    stock: 48,
    description: "PCIe 4.0 NVMe M.2 SSD with sequential reads up to 7,450 MB/s. Ideal for gaming and heavy workloads.",
    specs: { Capacity: "2 TB", Interface: "PCIe 4.0 NVMe M.2", "Seq. Read": "7,450 MB/s", "Seq. Write": "6,900 MB/s", NAND: "V-NAND TLC", Form: "M.2 2280" },
    featured: true,
    sale: true
  },
  {
    id: 5,
    name: "ASUS ROG Maximus Z790 Hero Motherboard",
    brand: "ASUS ROG",
    category: "motherboard",
    price: 49999,
    mrp: 59999,
    image: "assets/images/product_motherboard.jpg",
    rating: 4.8,
    reviews: 203,
    badge: "new",
    stock: 9,
    description: "Premium ATX motherboard for LGA 1700. 20+1 power stages, DDR5 support, Wi-Fi 6E, and full RGB ecosystem.",
    specs: { Socket: "LGA 1700", Chipset: "Z790", Memory: "DDR5 (4 slots)", "Max RAM": "192 GB", Storage: "5× M.2 + 6× SATA", Connectivity: "Wi-Fi 6E, Bluetooth 5.3" },
    featured: true,
    sale: false
  },
  {
    id: 6,
    name: "Noctua NH-D15 CPU Air Cooler",
    brand: "Noctua",
    category: "cooler",
    price: 8499,
    mrp: 9999,
    image: "assets/images/product_cooler.jpg",
    rating: 4.9,
    reviews: 1024,
    badge: null,
    stock: 22,
    description: "The legendary dual-tower air cooler. Exceptionally quiet NF-A15 fans, compatible with Intel LGA 1700 and AMD AM5.",
    specs: { Type: "Air Cooler", Height: "165 mm", "Fan Size": "2× 140 mm", "Noise Level": "24.6 dBA", "TDP Rating": "250W+", Compatibility: "LGA 1700, AM5, AM4" },
    featured: false,
    sale: false
  },
  {
    id: 7,
    name: "Corsair HX1000 1000W 80+ Platinum",
    brand: "Corsair",
    category: "psu",
    price: 14499,
    mrp: 17999,
    image: "assets/images/product_psu.jpg",
    rating: 4.8,
    reviews: 567,
    badge: null,
    stock: 14,
    description: "Fully modular, 80+ Platinum certified PSU. Zero RPM fan mode for near-silent operation. 10-year warranty.",
    specs: { Wattage: "1000 W", Efficiency: "80+ Platinum", Modular: "Fully Modular", Fan: "135 mm", Protections: "OVP, UVP, OCP, SCP, OTP", Warranty: "10 Years" },
    featured: false,
    sale: false
  },
  {
    id: 8,
    name: "Lian Li O11 Dynamic EVO XL Case",
    brand: "Lian Li",
    category: "case",
    price: 12999,
    mrp: 15999,
    image: "assets/images/product_case.jpg",
    rating: 4.7,
    reviews: 389,
    badge: "new",
    stock: 8,
    description: "Full-tower tempered glass chassis with dual chamber design. Supports E-ATX, up to 420mm radiators and 8 fans.",
    specs: { Form: "Full Tower", Motherboard: "E-ATX / ATX / mATX", "GPU Length": "Up to 446 mm", "Radiator": "Up to 420 mm", Fans: "Up to 10 fans", "Side Panel": "Tempered Glass" },
    featured: true,
    sale: false
  },
  {
    id: 9,
    name: "AMD Ryzen 9 7950X Processor",
    brand: "AMD",
    category: "cpu",
    price: 55999,
    mrp: 69999,
    image: "assets/images/product_cpu.jpg",
    rating: 4.9,
    reviews: 278,
    badge: "hot",
    stock: 7,
    description: "16-core, 32-thread beast on Zen 4 architecture. PCIe 5.0 support, DDR5 memory and up to 5.7 GHz boost.",
    specs: { Cores: "16", Threads: "32", "Base Clock": "4.5 GHz", "Boost Clock": "5.7 GHz", TDP: "170W", Socket: "AM5", Cache: "64 MB L3" },
    featured: false,
    sale: false
  },
  {
    id: 10,
    name: "Kingston Fury Beast DDR4 16GB Kit",
    brand: "Kingston",
    category: "ram",
    price: 3499,
    mrp: 4999,
    image: "assets/images/product_ram.jpg",
    rating: 4.6,
    reviews: 1245,
    badge: "sale",
    stock: 85,
    description: "3600 MHz DDR4 memory for budget builds. Low profile, high performance kit for Intel and AMD platforms.",
    specs: { Capacity: "16 GB (2×8 GB)", Speed: "DDR4-3600 MHz", Latency: "CL17", Voltage: "1.35 V", RGB: "No", Form: "DIMM" },
    featured: false,
    sale: true
  },
  {
    id: 11,
    name: "WD Blue SN570 NVMe SSD 1TB",
    brand: "Western Digital",
    category: "ssd",
    price: 4499,
    mrp: 6499,
    image: "assets/images/product_ssd.jpg",
    rating: 4.5,
    reviews: 2341,
    badge: "sale",
    stock: 120,
    description: "PCIe Gen3 NVMe SSD with up to 3500 MB/s read speed. Perfect budget upgrade for everyday computing.",
    specs: { Capacity: "1 TB", Interface: "PCIe 3.0 NVMe M.2", "Seq. Read": "3,500 MB/s", "Seq. Write": "3,000 MB/s", NAND: "3D TLC", Form: "M.2 2280" },
    featured: false,
    sale: true
  },
  {
    id: 12,
    name: "Professional PC Repair Kit 32-in-1",
    brand: "iFixit",
    category: "repair",
    price: 1999,
    mrp: 2999,
    image: "assets/images/product_repair.jpg",
    rating: 4.7,
    reviews: 456,
    badge: "new",
    stock: 50,
    description: "Complete repair toolkit with 32 precision bits, anti-static wrist strap, thermal paste, and opening tools.",
    specs: { Bits: "32 precision", Material: "Chrome Vanadium Steel", ESD: "Anti-static strap included", Case: "Roll-up canvas case", Warranty: "Lifetime" },
    featured: false,
    sale: false
  }
];

const REPAIR_SERVICES = [
  { id: 'r1', name: 'Laptop Screen Replacement', price: 1499, duration: '2-4 hrs' },
  { id: 'r2', name: 'Data Recovery', price: 999, duration: '1-2 days' },
  { id: 'r3', name: 'Virus Removal & OS Reinstall', price: 499, duration: '3-5 hrs' },
  { id: 'r4', name: 'PC/Laptop Diagnostics', price: 299, duration: '1 hr' },
  { id: 'r5', name: 'Custom PC Assembly', price: 1999, duration: '4-6 hrs' },
  { id: 'r6', name: 'RAM & SSD Upgrade', price: 299, duration: '30 min' },
  { id: 'r7', name: 'Thermal Paste & Cleaning', price: 399, duration: '1 hr' },
  { id: 'r8', name: 'Keyboard/Touchpad Repair', price: 799, duration: '1-2 hrs' },
];

/* Helper: format currency */
function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

/* Helper: calculate discount % */
function discountPct(price, mrp) {
  return Math.round(((mrp - price) / mrp) * 100);
}

/* Helper: get products by filters */
function getProducts({ category = null, sale = false, featured = false, search = '' } = {}) {
  return PRODUCTS.filter(p => {
    if (category && p.category !== category) return false;
    if (sale && !p.sale) return false;
    if (featured && !p.featured) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

/* Helper: get product by id */
function getProductById(id) {
  return PRODUCTS.find(p => p.id === parseInt(id));
}
