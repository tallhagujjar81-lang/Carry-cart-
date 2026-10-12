import {
  StoreDatabase,
  Category,
  Product,
  CityDeliveryConfig,
  HeroBanner,
  ProductReview,
  Coupon,
  FaqItem,
} from './types.ts';

export function createStudioProductSvg(
  title: string,
  subtitle: string,
  sku: string,
  bgHex: string,
  accentHex: string,
  silhouette:
    | 'watch'
    | 'phone'
    | 'audio'
    | 'bag'
    | 'fashion'
    | 'shoe'
    | 'kitchen'
    | 'laptop'
    | 'beauty'
    | 'fitness'
    | 'tool'
    | 'book'
    | 'decor'
    | 'auto'
    | 'grocery'
    | 'gift',
  viewLabel = 'STUDIO FRONT VIEW'
): string {
  let illustration = '';

  switch (silhouette) {
    case 'watch':
      illustration = `
        <rect x="365" y="90" width="70" height="420" rx="10" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
        <circle cx="400" cy="300" r="115" fill="#09090b" stroke="#d4d4d8" stroke-width="6"/>
        <circle cx="400" cy="300" r="98" fill="#18181b" stroke="${accentHex}" stroke-width="2" stroke-dasharray="4 8"/>
        <line x1="400" y1="300" x2="400" y2="225" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <line x1="400" y1="300" x2="455" y2="300" stroke="#e4e4e7" stroke-width="4" stroke-linecap="round"/>
        <line x1="400" y1="320" x2="365" y2="235" stroke="${accentHex}" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="400" cy="300" r="7" fill="${accentHex}"/>
      `;
      break;
    case 'phone':
      illustration = `
        <rect x="295" y="95" width="210" height="410" rx="28" fill="#09090b" stroke="#52525b" stroke-width="5"/>
        <rect x="307" y="109" width="186" height="382" rx="20" fill="#18181b"/>
        <circle cx="400" cy="240" r="65" fill="${accentHex}" fill-opacity="0.18"/>
        <rect x="372" y="122" width="56" height="14" rx="7" fill="#09090b"/>
        <rect x="335" y="395" width="130" height="8" rx="4" fill="#3f3f46"/>
        <rect x="355" y="415" width="90" height="6" rx="3" fill="${accentHex}"/>
      `;
      break;
    case 'audio':
      illustration = `
        <path d="M 275 310 A 125 125 0 0 1 525 310" fill="none" stroke="#18181b" stroke-width="22" stroke-linecap="round"/>
        <path d="M 285 310 A 115 115 0 0 1 515 310" fill="none" stroke="#52525b" stroke-width="4"/>
        <rect x="245" y="275" width="58" height="125" rx="28" fill="#09090b" stroke="${accentHex}" stroke-width="3"/>
        <rect x="497" y="275" width="58" height="125" rx="28" fill="#09090b" stroke="${accentHex}" stroke-width="3"/>
      `;
      break;
    case 'bag':
      illustration = `
        <path d="M 335 205 C 335 125, 465 125, 465 205" fill="none" stroke="#18181b" stroke-width="14" stroke-linecap="round"/>
        <rect x="260" y="195" width="280" height="245" rx="18" fill="#18181b" stroke="#3f3f46" stroke-width="3"/>
        <line x1="260" y1="265" x2="540" y2="265" stroke="#27272a" stroke-width="3"/>
        <rect x="382" y="250" width="36" height="32" rx="6" fill="${accentHex}"/>
      `;
      break;
    case 'fashion':
      illustration = `
        <path d="M 325 140 L 365 125 L 400 155 L 435 125 L 475 140 L 535 215 L 485 250 L 465 215 L 465 445 L 335 445 L 335 215 L 315 250 L 265 215 Z" fill="#18181b" stroke="#3f3f46" stroke-width="3"/>
        <line x1="400" y1="155" x2="400" y2="445" stroke="${accentHex}" stroke-width="3"/>
      `;
      break;
    case 'shoe':
      illustration = `
        <path d="M 230 365 L 265 225 L 345 235 L 395 305 L 545 325 C 565 330, 575 365, 565 390 L 225 390 Z" fill="#18181b" stroke="#3f3f46" stroke-width="3"/>
        <rect x="220" y="382" width="350" height="26" rx="10" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="2"/>
        <line x1="295" y1="295" x2="435" y2="355" stroke="${accentHex}" stroke-width="6" stroke-linecap="round"/>
      `;
      break;
    case 'laptop':
      illustration = `
        <rect x="245" y="145" width="310" height="205" rx="14" fill="#09090b" stroke="#52525b" stroke-width="4"/>
        <rect x="260" y="160" width="280" height="175" rx="6" fill="#18181b"/>
        <path d="M 205 350 L 595 350 L 570 375 L 230 375 Z" fill="#3f3f46"/>
        <circle cx="400" cy="245" r="42" fill="${accentHex}" fill-opacity="0.25" stroke="${accentHex}" stroke-width="2"/>
      `;
      break;
    case 'kitchen':
      illustration = `
        <rect x="295" y="135" width="210" height="295" rx="18" fill="#18181b" stroke="#3f3f46" stroke-width="4"/>
        <rect x="325" y="165" width="150" height="75" rx="8" fill="#09090b" stroke="${accentHex}" stroke-width="2"/>
        <circle cx="400" cy="202" r="18" fill="none" stroke="#ffffff" stroke-width="3"/>
        <rect x="345" y="295" width="110" height="95" rx="10" fill="#27272a"/>
      `;
      break;
    default:
      illustration = `
        <rect x="275" y="135" width="250" height="280" rx="22" fill="#18181b" stroke="#3f3f46" stroke-width="3"/>
        <circle cx="400" cy="260" r="58" fill="${accentHex}" fill-opacity="0.2" stroke="${accentHex}" stroke-width="3"/>
        <rect x="335" y="355" width="130" height="10" rx="5" fill="#52525b"/>
      `;
      break;
  }

  const cleanTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cleanSub = subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <radialGradient id="studioGlow" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${bgHex}" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="800" height="600" fill="url(#studioGlow)"/>
    <ellipse cx="400" cy="455" rx="195" ry="22" fill="#000000" fill-opacity="0.1"/>
    ${illustration}
    <text x="48" y="56" font-family="Outfit, sans-serif" font-size="13" font-weight="700" fill="#71717a" letter-spacing="2">CARRY CART STUDIO · ${sku}</text>
    <text x="752" y="56" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600" fill="${accentHex}" letter-spacing="1">${viewLabel}</text>
    <text x="48" y="532" font-family="Outfit, sans-serif" font-size="22" font-weight="700" fill="#09090b">${cleanTitle}</text>
    <text x="48" y="558" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="500" fill="#52525b">${cleanSub}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-mens-fashion',
    slug: 'mens-fashion',
    name: "Men's Fashion",
    nameUr: 'مردانہ فیشن',
    description: 'Tailored shalwar kameez, premium cotton kurtas, oxford shirts, denim, and outerwear.',
    subcategories: ['Unstitched Fabric', 'Kurta & Shalwar Kameez', 'Casual Shirts & Polos', 'Denim & Chinos', 'Jackets & Outerwear'],
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'cat-womens-fashion',
    slug: 'womens-fashion',
    name: "Women's Fashion",
    nameUr: 'خواتین کا فیشن',
    description: 'Luxury lawn collections, embroidered prêt, formal wear, abayas, and contemporary western wear.',
    subcategories: ['3-Piece Unstitched Lawn', 'Luxury Embroidered Prêt', 'Chiffon & Formal Wear', 'Modest Wear & Abayas', 'Western Co-ords'],
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'cat-kids-clothing',
    slug: 'kids-clothing',
    name: "Kids' Clothing",
    nameUr: 'بچوں کے ملبوسات',
    description: 'Breathable organic cotton everyday wear, festive eastern outfits, and school essentials.',
    subcategories: ['Boys Festive Kurta', 'Girls Party Wear', 'Infant Rompers', 'Winter Fleece Sets'],
    featured: false,
    sortOrder: 3,
  },
  {
    id: 'cat-shoes-footwear',
    slug: 'shoes-footwear',
    name: 'Shoes and Footwear',
    nameUr: 'جوتے اور فٹ ویئر',
    description: 'Handcrafted Peshawari chappals, Italian-style leather loafers, running sneakers, and heels.',
    subcategories: ['Leather Loafers & Oxfords', 'Handcrafted Peshawari Chappals', 'Performance Sneakers', 'Women Heels & Flats'],
    featured: true,
    sortOrder: 4,
  },
  {
    id: 'cat-bags-accessories',
    slug: 'bags-accessories',
    name: 'Bags and Accessories',
    nameUr: 'بیگز اور لوازمات',
    description: 'Full-grain leather laptop briefcases, structured totes, RFID wallets, and travel luggage.',
    subcategories: ['Leather Laptop Bags', 'Women Structured Totes', 'RFID Wallets & Cardholders', 'Hardshell Travel Luggage'],
    featured: true,
    sortOrder: 5,
  },
  {
    id: 'cat-electronics',
    slug: 'electronics',
    name: 'Electronics',
    nameUr: 'الیکٹرانکس',
    description: 'Active noise-cancelling audio, 4K QLED smart TVs, solar inverters, and smart home gear.',
    subcategories: ['Headphones & Earbuds', 'Smart TVs & Soundbars', 'UPS & Solar Inverters', 'Smart Security Cameras'],
    featured: true,
    sortOrder: 6,
  },
  {
    id: 'cat-mobiles',
    slug: 'mobile-phones-accessories',
    name: 'Mobile Phones and Accessories',
    nameUr: 'موبائل فونز اور اسیسریز',
    description: 'PTA-approved flagship smartphones, GaN fast chargers, MagSafe power banks, and cases.',
    subcategories: ['PTA Approved Smartphones', 'GaN Fast Chargers', 'Power Banks', 'Protective Cases & Glass'],
    featured: true,
    sortOrder: 7,
  },
  {
    id: 'cat-computers-gaming',
    slug: 'computers-gaming',
    name: 'Computers and Gaming',
    nameUr: 'کمپیوٹرز اور گیمنگ',
    description: 'Workstation laptops, mechanical keyboards, high-refresh monitors, and PlayStation 5 gear.',
    subcategories: ['Ultrabooks & Workstations', 'Gaming Monitors', 'Mechanical Keyboards & Mice', 'Consoles & Controllers'],
    featured: true,
    sortOrder: 8,
  },
  {
    id: 'cat-home-kitchen',
    slug: 'home-kitchen',
    name: 'Home and Kitchen',
    nameUr: 'گھر اور کچن',
    description: 'Barista espresso machines, oil-free air fryers, non-stick granite cookware, and blenders.',
    subcategories: ['Coffee & Espresso Machines', 'Digital Air Fryers', 'Granite Cookware Sets', 'High-Speed Blenders'],
    featured: true,
    sortOrder: 9,
  },
  {
    id: 'cat-furniture-decor',
    slug: 'furniture-home-decor',
    name: 'Furniture and Home Decor',
    nameUr: 'فرنیچر اور ہوم ڈیکور',
    description: 'Solid Sheesham wood tables, architectural brass floor lamps, ergonomic office chairs, and rugs.',
    subcategories: ['Architectural Lighting', 'Ergonomic Office Chairs', 'Hand-Knotted Carpets', 'Minimalist Wall Art'],
    featured: false,
    sortOrder: 10,
  },
  {
    id: 'cat-beauty-care',
    slug: 'beauty-personal-care',
    name: 'Beauty and Personal Care',
    nameUr: 'بیوٹی اور پرسنل کیئر',
    description: 'Dermatologist-tested serums, artisanal oud fragrances, grooming trimmers, and sunblock.',
    subcategories: ['Artisanal Oud & Perfumes', 'Clinical Skincare Serums', 'Men Grooming & Trimmers', 'Hair Care Appliances'],
    featured: true,
    sortOrder: 11,
  },
  {
    id: 'cat-health-wellness',
    slug: 'health-wellness',
    name: 'Health and Wellness Products',
    nameUr: 'صحت اور تندرستی',
    description: 'Digital blood pressure monitors, pure Gilgit Shilajit, multivitamins, and massage guns.',
    subcategories: ['Diagnostic Monitors', 'Organic Shilajit & Honey', 'Vitamins & Supplements', 'Percussion Massagers'],
    featured: false,
    sortOrder: 12,
  },
  {
    id: 'cat-grocery-essentials',
    slug: 'grocery-daily-essentials',
    name: 'Grocery and Daily Essentials',
    nameUr: 'گروسری اور روزمرہ اشیاء',
    description: 'Aged Himalayan basmati rice, cold-pressed olive oil, specialty Arabica coffee, and dry fruits.',
    subcategories: ['Specialty Coffee & Tea', 'Dry Fruits & Nuts', 'Premium Basmati & Oils', 'Household Cleaning'],
    featured: false,
    sortOrder: 13,
  },
  {
    id: 'cat-watches-jewellery',
    slug: 'watches-jewellery',
    name: 'Watches and Jewellery',
    nameUr: 'گھڑیاں اور جیولری',
    description: 'Sapphire-crystal chronographs, AMOLED smartwatches, sterling silver rings, and cufflinks.',
    subcategories: ['Mechanical & Chronograph Watches', 'AMOLED Smartwatches', '925 Sterling Silver Jewellery', 'Executive Cufflinks'],
    featured: true,
    sortOrder: 14,
  },
  {
    id: 'cat-sports-fitness',
    slug: 'sports-fitness',
    name: 'Sports and Fitness',
    nameUr: 'سپورٹس اور فٹنس',
    description: 'Sialkot export-grade English willow cricket bats, adjustable dumbbells, and yoga mats.',
    subcategories: ['English Willow Cricket Gear', 'Adjustable Dumbbells', 'Treadmills & Cardio', 'Non-Slip Yoga Mats'],
    featured: false,
    sortOrder: 15,
  },
  {
    id: 'cat-automotive',
    slug: 'automotive-accessories',
    name: 'Automotive Accessories',
    nameUr: 'آٹوموٹو اسیسریز',
    description: 'Dual-channel 4K dashcams, portable digital tire inflators, microfiber kits, and LED headlights.',
    subcategories: ['4K Dashcams & GPS', 'Portable Tire Inflators', 'Ceramic Car Care Kits', 'Custom Floor Mats'],
    featured: false,
    sortOrder: 16,
  },
  {
    id: 'cat-tools-hardware',
    slug: 'tools-hardware',
    name: 'Tools and Hardware',
    nameUr: 'ٹولز اور ہارڈویئر',
    description: 'Brushless cordless impact drills, laser distance meters, precision screwdriver kits, and safes.',
    subcategories: ['Cordless Power Drills', 'Precision Repair Toolkits', 'Laser Distance Meters', 'Digital Home Safes'],
    featured: false,
    sortOrder: 17,
  },
  {
    id: 'cat-books-stationery',
    slug: 'books-stationery',
    name: 'Books and Stationery',
    nameUr: 'کتابیں اور اسٹیشنری',
    description: 'Fountain pens, leather-bound executive journals, business bestsellers, and art supplies.',
    subcategories: ['Business & Tech Books', 'Executive Leather Journals', 'Fountain Pens & Inks', 'Architectural Sketch Kits'],
    featured: false,
    sortOrder: 18,
  },
  {
    id: 'cat-toys-baby',
    slug: 'toys-baby-products',
    name: 'Toys and Baby Products',
    nameUr: 'کھلونے اور بے بی پراڈکٹس',
    description: 'STEM robotics kits, lightweight travel strollers, BPA-free feeding sets, and wooden puzzles.',
    subcategories: ['STEM & Educational Kits', 'Travel Strollers & Car Seats', 'BPA-Free Baby Care', 'Die-Cast Collectibles'],
    featured: false,
    sortOrder: 19,
  },
  {
    id: 'cat-pet-supplies',
    slug: 'pet-supplies',
    name: 'Pet Supplies',
    nameUr: 'پالتو جانوروں کا سامان',
    description: 'Grain-free cat and dog nutrition, automatic smart feeders, Stainless litter boxes, and beds.',
    subcategories: ['Premium Cat Food & Litter', 'Dog Nutrition & Treats', 'Automatic Smart Feeders', 'Orthopedic Pet Beds'],
    featured: false,
    sortOrder: 20,
  },
  {
    id: 'cat-gifts-lifestyle',
    slug: 'gifts-lifestyle',
    name: 'Gifts and Lifestyle Products',
    nameUr: 'تحائف اور لائف اسٹائل',
    description: 'Curated corporate gift boxes, brass incense burners, insulated flasks, and travel organizers.',
    subcategories: ['Executive Gift Boxes', 'Insulated Thermal Flasks', 'Home Fragrance Diffusers', 'Tech Travel Organizers'],
    featured: false,
    sortOrder: 21,
  },
  {
    id: 'cat-seasonal',
    slug: 'seasonal-products',
    name: 'Seasonal Products',
    nameUr: 'موسمی مصنوعات',
    description: 'Rechargeable mist fans, solar camping lanterns, ceramic room heaters, and Eid gift hampers.',
    subcategories: ['Summer Cooling & Rechargeable Fans', 'Winter Ceramic Heaters', 'Monsoon & Outdoor Gear', 'Eid Festive Hampers'],
    featured: false,
    sortOrder: 22,
  },
];

export const INITIAL_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    kicker: 'PAKISTAN NATIONWIDE EXPRESS DELIVERY · CASH ON DELIVERY AVAILABLE',
    title: 'Precision Engineered Everyday Essentials, Delivered Across Pakistan.',
    titleUr: 'پاکستان بھر میں معیاری مصنوعات کی تیز ترین ہوم ڈیلیوری',
    subtitle: 'Shop verified electronics, artisanal leather goods, luxury timepieces, and seasonal apparel with transparent PKR pricing and 7-day easy returns.',
    ctaText: 'Explore Flagship Catalog',
    targetCategorySlug: 'all',
    imageUrl: '/src/assets/images/case_fintech_platform_1791790598093.jpg',
    active: true,
  },
  {
    id: 'banner-2',
    kicker: 'FLASH ARCHIVE · UP TO 28% OFF SELECTED TIMEPIECES & AUDIO',
    title: 'Executive Obsidian Collection — Built for Modern Professionals.',
    titleUr: 'ایگزیکٹو کلیکشن — جدید پروفیشنلز کے لیے خاص انتخاب',
    subtitle: 'Free insured shipping across Lahore, Karachi, Islamabad, and 20+ cities on orders above PKR 5,000. Use code PAKISTAN10 at checkout.',
    ctaText: 'Shop Watches & Audio',
    targetCategorySlug: 'watches-jewellery',
    imageUrl: '/src/assets/images/case_spatial_commerce_1791790618143.jpg',
    active: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'chronos-obsidian-titanium-chronograph',
    name: 'Chronos Obsidian Titanium Chronograph 42mm',
    nameUr: 'کرونوس آبسیڈین ٹائٹینیم واچ',
    sku: 'CC-WT-101',
    categoryId: 'cat-watches-jewellery',
    subcategory: 'Mechanical & Chronograph Watches',
    brand: 'Aethelgard Horology',
    price: 34500,
    discountedPrice: 27900,
    stock: 18,
    images: [
      createStudioProductSvg('Chronos Obsidian Titanium 42mm', 'Sapphire Crystal · 10 ATM Water Resistant · Japanese Miyota Movement', 'CC-WT-101', '#f4f4f5', '#dc2626', 'watch', 'STUDIO DIAL VIEW'),
      createStudioProductSvg('Chronos Obsidian Titanium 42mm', 'Brushed Grade-5 Titanium Case & Clasp Profile', 'CC-WT-101', '#e4e4e7', '#dc2626', 'watch', 'CROWN & CASE PROFILE'),
      '/src/assets/images/case_fintech_platform_1791790598093.jpg',
    ],
    description: 'Engineered with a bead-blasted 316L stainless steel and titanium bezel, anti-reflective sapphire crystal glass, and a sweeping crimson seconds hand. Designed for daily executive wear in Pakistan with sweat-resistant FKM fluoroelastomer and stainless link straps.',
    specifications: {
      'Case Diameter': '42mm (11.2mm thickness)',
      'Movement': 'Caliber JS25 Quartz Chronograph',
      'Crystal': 'Scratch-Resistant Sapphire with AR Coating',
      'Water Resistance': '100 Meters / 10 ATM',
      'Warranty': '2 Years Official Carry Cart Pakistan Warranty',
    },
    variations: [
      { label: 'Strap Style', values: ['Brushed Black Steel Link', 'Italian Full-Grain Leather', 'Crimson-Stitched FKM Rubber'] },
      { label: 'Dial Size', values: ['40mm Classic', '42mm Executive'] },
    ],
    rating: 4.9,
    reviewCount: 47,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: true,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '24–48 Hours in Major Cities (Karachi, Lahore, Islamabad)',
    warranty: '2 Years Official Brand Warranty',
    returnEligible: true,
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'prod-2',
    slug: 'acoustic-pro-anc-wireless-headphones',
    name: 'Vektor Studio ANC Pro Over-Ear Wireless Headphones',
    nameUr: 'ویکٹر اسٹوڈیو وائرلیس ہیڈفونز',
    sku: 'CC-EL-204',
    categoryId: 'cat-electronics',
    subcategory: 'Headphones & Earbuds',
    brand: 'Vektor Audio',
    price: 24000,
    discountedPrice: 18500,
    stock: 32,
    images: [
      createStudioProductSvg('Vektor Studio ANC Pro', '45dB Hybrid Active Noise Cancellation · 60-Hour Battery · LDAC Hi-Res', 'CC-EL-204', '#f4f4f5', '#dc2626', 'audio', 'STUDIO FRONT VIEW'),
      createStudioProductSvg('Vektor Studio ANC Pro', 'Memory Foam Protein Leather Earcups & USB-C Fast Charge', 'CC-EL-204', '#e4e4e7', '#dc2626', 'audio', 'ACOUSTIC CHAMBER VIEW'),
    ],
    description: 'Flagship over-ear wireless headphones tuned for deep sub-bass accuracy and crystal-clear vocal isolation. Features 45dB hybrid active noise cancellation for flights and busy offices, multipoint Bluetooth 5.4 connectivity, and 60 hours of playback on a single charge.',
    specifications: {
      'Drivers': '40mm Custom Beryllium-Coated Dynamic Drivers',
      'Noise Cancellation': 'Up to 45dB Adaptive Hybrid ANC + Transparency Mode',
      'Battery Life': '60 Hours (ANC Off) / 42 Hours (ANC On)',
      'Fast Charge': '5 Mins Charge = 6 Hours Playback via USB-C',
      'Connectivity': 'Bluetooth 5.4 + 3.5mm Braided Studio Cable Included',
    },
    variations: [
      { label: 'Color', values: ['Matte Obsidian Black', 'Titanium Silver', 'Crimson Edition'] },
    ],
    rating: 4.8,
    reviewCount: 64,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: true,
    isFlashSale: true,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '1–3 Working Days Nationwide',
    warranty: '1 Year Replacement Warranty',
    returnEligible: true,
    createdAt: '2026-09-20T12:00:00Z',
  },
  {
    id: 'prod-3',
    slug: 'artisan-full-grain-leather-executive-briefcase',
    name: 'Lahore Heritage Full-Grain Leather 16" Laptop Briefcase',
    nameUr: 'لاہور ہیریٹیج لیدر لیپ ٹاپ بیگ',
    sku: 'CC-BG-309',
    categoryId: 'cat-bags-accessories',
    subcategory: 'Leather Laptop Bags',
    brand: 'Karakoram Leatherworks',
    price: 19500,
    discountedPrice: 15900,
    stock: 14,
    images: [
      createStudioProductSvg('Lahore Heritage 16" Leather Briefcase', '100% Vegetable-Tanned Cowhide · YKK Excella Zippers · Padded Laptop Vault', 'CC-BG-309', '#f4f4f5', '#dc2626', 'bag', 'FRONT SILHOUETTE'),
      createStudioProductSvg('Lahore Heritage 16" Leather Briefcase', 'Suede-Lined Compartment for 16" MacBook Pro & Documents', 'CC-BG-309', '#e4e4e7', '#dc2626', 'bag', 'INTERIOR ORGANIZER'),
    ],
    description: 'Hand-stitched by master leather craftsmen using export-grade vegetable-tanned full-grain cowhide. Features a dedicated shock-absorbing 16-inch laptop vault, solid brushed gunmetal hardware, luggage pass-through strap, and RFID-shielded card slots.',
    specifications: {
      'Material': '100% Full-Grain Vegetable-Tanned Cowhide Leather',
      'Dimensions': '41cm × 30cm × 10cm (Fits up to 16" Laptops)',
      'Hardware': 'Solid Brushed Gunmetal + YKK Metal Zippers',
      'Strap': 'Detachable Padded Leather Shoulder Strap',
      'Origin': 'Handcrafted in Pakistan (Export Grade)',
    },
    variations: [
      { label: 'Finish', values: ['Jet Black Matte', 'Espresso Saddle Brown', 'Oxblood Burgundy'] },
    ],
    rating: 4.9,
    reviewCount: 39,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '2–3 Working Days Nationwide',
    warranty: 'Lifetime Stitching & Hardware Warranty',
    returnEligible: true,
    createdAt: '2026-09-18T09:30:00Z',
  },
  {
    id: 'prod-4',
    slug: 'barista-pro-20bar-espresso-machine',
    name: 'KaffeMeister 20-Bar Italian Pump Espresso & Cappuccino Maker',
    nameUr: 'کافی ماسٹر 20 بار ایسپریسو مشین',
    sku: 'CC-HK-412',
    categoryId: 'cat-home-kitchen',
    subcategory: 'Coffee & Espresso Machines',
    brand: 'KaffeMeister',
    price: 48000,
    discountedPrice: 39500,
    stock: 9,
    images: [
      createStudioProductSvg('KaffeMeister 20-Bar Espresso Station', 'Italian ULKA Pump · PID Temperature Control · Commercial Steam Wand', 'CC-HK-412', '#f4f4f5', '#dc2626', 'kitchen', 'FRONT STUDIO VIEW'),
      '/src/assets/images/case_spatial_commerce_1791790618143.jpg',
    ],
    description: 'Bring specialty café extraction to your kitchen or office. Equipped with a genuine 20-Bar Italian ULKA pump, PID digital temperature stability, pressure gauge, and a 360-degree stainless steel micro-foam steam wand for lattes and cappuccinos.',
    specifications: {
      'Pump Pressure': '20-Bar Italian ULKA Electromagnetic Pump',
      'Boiler System': '1350W Thermoblock Fast Heating (35 Seconds)',
      'Water Tank': '1.8L Detachable BPA-Free Reservoir',
      'Included Accessories': '51mm Solid Steel Portafilter, Tamper, Milk Pitcher',
      'Voltage': '220–240V ~ 50Hz (Pakistan Standard Plug)',
    },
    variations: [
      { label: 'Body Finish', values: ['Matte Black & Brushed Steel', 'All-Stainless Silver'] },
    ],
    rating: 4.7,
    reviewCount: 28,
    isTrending: false,
    isBestSeller: true,
    isNewArrival: true,
    isFlashSale: true,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '2–4 Working Days (Fragile Insured Courier)',
    warranty: '1 Year Official Carry Cart Service Warranty',
    returnEligible: true,
    createdAt: '2026-09-25T14:20:00Z',
  },
  {
    id: 'prod-5',
    slug: 'voltmax-140w-gan-powerbank-27000mah',
    name: 'VoltMax 140W GaN Fast Charging Power Bank 27,000mAh + Charger Bundle',
    nameUr: 'وولٹ میکس 140 واٹ فاسٹ پاور بینک',
    sku: 'CC-MB-502',
    categoryId: 'cat-mobiles',
    subcategory: 'Power Banks',
    brand: 'VoltMax Pakistan',
    price: 16500,
    discountedPrice: 12990,
    stock: 45,
    images: [
      createStudioProductSvg('VoltMax 140W 27,000mAh Power Bank', 'Smart OLED Wattage Display · Charges MacBook Pro, iPhone 16 & Samsung S25 Ultra', 'CC-MB-502', '#f4f4f5', '#dc2626', 'phone', 'OLED TELEMETRY VIEW'),
    ],
    description: 'Built for uninterrupted productivity during travel and load-shedding across Pakistan. Delivers 140W PD 3.1 bidirectional USB-C output capable of fast-charging laptops, tablets, and smartphones simultaneously with real-time OLED battery health readout.',
    specifications: {
      'Capacity': '27,000mAh / 97.2Wh (Airline Safe Carry-On Approved)',
      'Max Output': '140W Total (Dual USB-C PD 3.1 + 1x USB-A QC 4.0)',
      'Display': 'Smart Color TFT Screen (Shows Watts, Remaining Time, Temp)',
      'Included Cable': '240W Braided 1.5m USB-C to USB-C Cable Included',
    },
    variations: [
      { label: 'Bundle Option', values: ['Power Bank + 240W Cable', 'Power Bank + 65W GaN Wall Plug'] },
    ],
    rating: 4.9,
    reviewCount: 92,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: true,
    isFlashSale: true,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '24–48 Hours Express Delivery',
    warranty: '18 Months Replacement Warranty',
    returnEligible: true,
    createdAt: '2026-09-28T08:00:00Z',
  },
  {
    id: 'prod-6',
    slug: 'sultan-egyptian-giza-cotton-shalwar-kameez',
    name: 'Sultan Imperial Egyptian Giza Cotton Unstitched Suit (4.5 Meters)',
    nameUr: 'سلطان مصری کاٹن ان سٹچڈ سوٹ',
    sku: 'CC-MF-601',
    categoryId: 'cat-mens-fashion',
    subcategory: 'Unstitched Fabric',
    brand: 'Nawab Textile Mills',
    price: 8900,
    discountedPrice: 6950,
    stock: 60,
    images: [
      createStudioProductSvg('Sultan Imperial Giza Cotton (4.5m)', '100% Double-Mercerized Long-Staple Cotton · Luxury Presentation Box', 'CC-MF-601', '#f4f4f5', '#dc2626', 'fashion', 'FABRIC DRAPE & BOX'),
    ],
    description: 'Woven from 100% long-staple Egyptian Giza cotton with a crisp, breathable luster ideal for Pakistan climate and festive occasions. Comes in a rigid magnetic gift box with engraved metal buttons and collar stiffeners.',
    specifications: {
      'Fabric': '100% Double-Mercerized Giza Cotton',
      'CuttingLength': '4.5 Meters (Width 56 Inches — Generous Full Suit)',
      'Accessories': '8 Engraved Anodized Buttons, Woven Brand Label, Gift Box',
      'Season': 'All-Season Breathable Weave',
    },
    variations: [
      { label: 'Color Shade', values: ['Obsidian Jet Black', 'Crisp Ivory White', 'Charcoal Slate', 'Deep Navy'] },
    ],
    rating: 4.8,
    reviewCount: 53,
    isTrending: true,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '2–3 Working Days Nationwide',
    warranty: '100% Color & Shrinkage Guarantee',
    returnEligible: true,
    createdAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'prod-7',
    slug: 'zoya-3pc-embroidered-swiss-lawn-collection',
    name: 'Zoya Noir & Crimson 3-Piece Luxury Embroidered Swiss Lawn Suit',
    nameUr: 'زویا تھری پیس ایمبرائیڈرڈ سوئس لان سوٹ',
    sku: 'CC-WF-708',
    categoryId: 'cat-womens-fashion',
    subcategory: '3-Piece Unstitched Lawn',
    brand: 'Zoya Atelier',
    price: 14500,
    discountedPrice: 11800,
    stock: 25,
    images: [
      createStudioProductSvg('Zoya Noir & Crimson 3-Piece Lawn', 'Schiffli Embroidered Shirt · Pure Silk Dupatta · Dyed Cambric Trouser', 'CC-WF-708', '#f4f4f5', '#dc2626', 'fashion', 'ATELIER EDITION'),
    ],
    description: 'Intricate geometric and floral resham threadwork on jet-black airjet Swiss lawn, paired with a digitally printed pure medium silk dupatta and dyed cambric trouser. Crafted for formal dinners and festive gatherings.',
    specifications: {
      'Shirt': '3.0 Meters Schiffli Embroidered Airjet Lawn + Organza Borders',
      'Dupatta': '2.5 Meters Pure Medium Silk Printed Dupatta',
      'Trouser': '2.5 Meters Dyed Pima Cambric',
    },
    variations: [
      { label: 'Edition', values: ['Unstitched 3-Piece', 'Stitched Ready-to-Wear (Small)', 'Stitched Ready-to-Wear (Medium)', 'Stitched Ready-to-Wear (Large)'] },
    ],
    rating: 4.9,
    reviewCount: 41,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: true,
    isFlashSale: false,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '2–4 Working Days Nationwide',
    warranty: '7-Day Easy Exchange Policy',
    returnEligible: true,
    createdAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'prod-8',
    slug: 'peshawar-royal-handstitched-leather-chappal',
    name: 'Khyber Sovereign Hand-Stitched Calfskin Peshawari Chappal',
    nameUr: 'خیبر ہینڈ سٹچڈ پشاوری چپل',
    sku: 'CC-SF-803',
    categoryId: 'cat-shoes-footwear',
    subcategory: 'Handcrafted Peshawari Chappals',
    brand: 'Khyber Cobblers',
    price: 7500,
    discountedPrice: 5890,
    stock: 38,
    images: [
      createStudioProductSvg('Khyber Sovereign Peshawari Chappal', 'Orthopedic Memory Foam Insole · Genuine Calfskin · Non-Slip Tire Sole', 'CC-SF-803', '#f4f4f5', '#dc2626', 'shoe', 'SIDE PROFILE'),
    ],
    description: 'Traditional Charsadda and Peshawari silhouette re-engineered with a dual-density orthopedic memory foam footbed and soft calfskin lining for zero-blister all-day comfort.',
    specifications: {
      'Upper Material': '100% Genuine Milled Calfskin Leather',
      'Footbed': 'High-Density Orthopedic Memory Foam Cushion',
      'Outsole': 'Abrasion-Resistant Vulcanized Rubber Sole',
    },
    variations: [
      { label: 'Euro / PK Size', values: ['40 (PK 6)', '41 (PK 7)', '42 (PK 8)', '43 (PK 9)', '44 (PK 10)', '45 (PK 11)'] },
      { label: 'Color', values: ['Obsidian Black', 'Mustard Tan', 'Dark Mahogany'] },
    ],
    rating: 4.8,
    reviewCount: 76,
    isTrending: false,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: true,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '2–3 Working Days Nationwide',
    warranty: 'Free Size Exchange Within 7 Days',
    returnEligible: true,
    createdAt: '2026-09-12T15:00:00Z',
  },
  {
    id: 'prod-9',
    slug: 'keychron-pro-wireless-mechanical-keyboard',
    name: 'HexCore K8 Pro Aluminum QMK/VIA Wireless Mechanical Keyboard',
    nameUr: 'ہیکس کور مکینیکل وائرلیس کی بورڈ',
    sku: 'CC-CG-901',
    categoryId: 'cat-computers-gaming',
    subcategory: 'Mechanical Keyboards & Mice',
    brand: 'HexCore Labs',
    price: 26500,
    discountedPrice: 22400,
    stock: 19,
    images: [
      createStudioProductSvg('HexCore K8 Pro Aluminum Mechanical', 'CNC Anodized Frame · Hot-Swappable Tactile Switches · Mac & Windows', 'CC-CG-901', '#f4f4f5', '#dc2626', 'laptop', 'TOP KEYCAP LAYOUT'),
    ],
    description: 'Engineered for software engineers, writers, and esports competitors. Features double-shot PBT keycaps in black, white, and red accents, silicone acoustic dampening pad, and tri-mode wireless (2.4GHz + Bluetooth 5.1 + USB-C).',
    specifications: {
      'Layout': '80% Tenkeyless (87 Keys)',
      'Switches': 'Pre-Lubed Linear Red / Tactile Brown (Hot-Swappable)',
      'Battery': '4000mAh Li-Po Rechargeable Battery',
      'Frame': 'CNC Machined Aluminum Bezel',
    },
    variations: [
      { label: 'Switch Type', values: ['Linear Red Switch', 'Tactile Brown Switch'] },
    ],
    rating: 4.9,
    reviewCount: 34,
    isTrending: true,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '1–3 Working Days Nationwide',
    warranty: '1 Year Official Hardware Warranty',
    returnEligible: true,
    createdAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'prod-10',
    slug: 'noir-oud-imperial-extrait-de-parfum-100ml',
    name: 'Oud Al-Mulk Crimson Extrait de Parfum (100ml)',
    nameUr: 'عود الملک پرفیوم 100 ملی لیٹر',
    sku: 'CC-BP-1004',
    categoryId: 'cat-beauty-care',
    subcategory: 'Artisanal Oud & Perfumes',
    brand: 'Maison Tariq',
    price: 9800,
    discountedPrice: 7490,
    stock: 52,
    images: [
      createStudioProductSvg('Oud Al-Mulk Extrait de Parfum 100ml', '32% Oil Concentration · Cambodian Agarwood, Saffron & Damascus Rose', 'CC-BP-1004', '#f4f4f5', '#dc2626', 'beauty', 'BOTTLE FLACON VIEW'),
    ],
    description: 'A commanding 32% Extrait de Parfum concentration crafted for 14+ hours of projection in South Asian weather. Opens with Kashmiri saffron and bergamot, settling into smoky Cambodian oud, ambergris, and warm sandalwood.',
    specifications: {
      'Volume': '100ml / 3.4 fl. oz.',
      'Concentration': 'Extrait de Parfum (32% Pure Perfume Oil)',
      'Top Notes': 'Kashmiri Saffron, Cardamom, Calabrian Bergamot',
      'Base Notes': 'Aged Cambodian Oud, Ambergris, Madagascar Vanilla',
    },
    variations: [
      { label: 'Size', values: ['100ml Full Presentation Bottle', '100ml + 15ml Travel Atomizer (+PKR 1,500)'] },
    ],
    rating: 4.9,
    reviewCount: 118,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: true,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '2–3 Working Days Nationwide',
    warranty: 'Authenticity Guaranteed',
    returnEligible: true,
    createdAt: '2026-09-10T08:00:00Z',
  },
  {
    id: 'prod-11',
    slug: 'sialkot-grade1-english-willow-cricket-bat',
    name: 'ProStrike Sialkot Grade-1 Reserve English Willow Cricket Bat',
    nameUr: 'سیالکوٹ گریڈ ون انگلش ولو کرکٹ بیٹ',
    sku: 'CC-SP-1102',
    categoryId: 'cat-sports-fitness',
    subcategory: 'English Willow Cricket Gear',
    brand: 'Sialkot ProCrafts',
    price: 42000,
    discountedPrice: 34900,
    stock: 11,
    images: [
      createStudioProductSvg('ProStrike Grade-1 English Willow Bat', '8–10 Straight Grains · Pre-Knocked 10,000 Mallet Strikes · 40mm Edges', 'CC-SP-1102', '#f4f4f5', '#dc2626', 'fitness', 'BLADE & PROFILE VIEW'),
    ],
    description: 'Hand-selected clefts of Grade-1 unbleached English Willow shaped by master bat makers in Sialkot. Features 8–10 straight grains, massive 40mm sweet-spot edges, Singapore Sarawak cane handle, and machine + hand knocking ready for club and tournament leather-ball play.',
    specifications: {
      'Willow Grade': 'Grade-1 Unbleached English Willow (8–10 Straight Grains)',
      'Weight Range': '2 lb 8 oz – 2 lb 10 oz (Light Pickup)',
      'Handle': '12-Piece Sarawak Cane Oval/Round Handle',
      'Preparation': 'Pre-Knocked + Toe Guard Fitted + Padded Bat Cover',
    },
    variations: [
      { label: 'Weight', values: ['2 lb 8 oz (Light)', '2 lb 9 oz (Medium)', '2 lb 10 oz (Heavy)'] },
    ],
    rating: 5.0,
    reviewCount: 22,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '2–3 Working Days Nationwide',
    warranty: 'Handle & Splice Guarantee',
    returnEligible: true,
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'prod-12',
    slug: 'pure-hunza-gold-grade-shilajit-resin-30g',
    name: 'Hunza Altitude Lab-Tested Pure Gold Grade Shilajit Resin (30g)',
    nameUr: 'ہنزہ خالص طلائی سلاجیت 30 گرام',
    sku: 'CC-HW-1205',
    categoryId: 'cat-health-wellness',
    subcategory: 'Organic Shilajit & Honey',
    brand: 'Karakoram Botanicals',
    price: 5500,
    discountedPrice: 4250,
    stock: 85,
    images: [
      createStudioProductSvg('Hunza Pure Gold Shilajit Resin 30g', '78% Fulvic Acid · PCSIR Lab Certified Heavy-Metal Free · Brass Measuring Spoon', 'CC-HW-1205', '#f4f4f5', '#dc2626', 'grocery', 'APOTHECARY JAR VIEW'),
    ],
    description: 'Sun-dried at 16,000+ feet in the Hunza and Skardu valleys using traditional spring-water filtration. Independently PCSIR lab-certified for >78% fulvic acid and trace minerals. Packed in UV-violet Miron glass with a solid brass measuring spoon.',
    specifications: {
      'Net Weight': '30 Grams (60–90 Servings)',
      'Certification': 'PCSIR Lab Tested & Certified Heavy-Metal Safe',
      'Origin': 'Hunza & Skardu High-Altitude Ranges, Gilgit-Baltistan',
    },
    variations: [
      { label: 'Pack Size', values: ['30g Single Jar', '60g Twin Value Pack'] },
    ],
    rating: 4.9,
    reviewCount: 67,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    isRecommended: true,
    isPublished: true,
    deliveryEstimate: '2–3 Working Days Nationwide',
    warranty: 'Lab Certificate Included in Box',
    returnEligible: true,
    createdAt: '2026-09-22T09:00:00Z',
  },
];

export const INITIAL_CITIES: CityDeliveryConfig[] = [
  { city: 'Karachi', province: 'Sindh', deliveryFee: 200, estimatedDays: '1–2 Days', codAvailable: true, active: true },
  { city: 'Lahore', province: 'Punjab', deliveryFee: 200, estimatedDays: '1–2 Days', codAvailable: true, active: true },
  { city: 'Islamabad', province: 'Islamabad Capital Territory', deliveryFee: 200, estimatedDays: '1–2 Days', codAvailable: true, active: true },
  { city: 'Rawalpindi', province: 'Punjab', deliveryFee: 200, estimatedDays: '1–2 Days', codAvailable: true, active: true },
  { city: 'Faisalabad', province: 'Punjab', deliveryFee: 250, estimatedDays: '2–3 Days', codAvailable: true, active: true },
  { city: 'Multan', province: 'Punjab', deliveryFee: 250, estimatedDays: '2–3 Days', codAvailable: true, active: true },
  { city: 'Peshawar', province: 'Khyber Pakhtunkhwa', deliveryFee: 250, estimatedDays: '2–3 Days', codAvailable: true, active: true },
  { city: 'Sialkot', province: 'Punjab', deliveryFee: 250, estimatedDays: '2–3 Days', codAvailable: true, active: true },
  { city: 'Gujranwala', province: 'Punjab', deliveryFee: 250, estimatedDays: '2–3 Days', codAvailable: true, active: true },
  { city: 'Hyderabad', province: 'Sindh', deliveryFee: 250, estimatedDays: '2–3 Days', codAvailable: true, active: true },
  { city: 'Quetta', province: 'Balochistan', deliveryFee: 350, estimatedDays: '3–5 Days', codAvailable: true, active: true },
  { city: 'Bahawalpur', province: 'Punjab', deliveryFee: 280, estimatedDays: '2–4 Days', codAvailable: true, active: true },
  { city: 'Sargodha', province: 'Punjab', deliveryFee: 280, estimatedDays: '2–4 Days', codAvailable: true, active: true },
  { city: 'Abbottabad', province: 'Khyber Pakhtunkhwa', deliveryFee: 280, estimatedDays: '2–4 Days', codAvailable: true, active: true },
  { city: 'Sukkur', province: 'Sindh', deliveryFee: 300, estimatedDays: '3–4 Days', codAvailable: true, active: true },
  { city: 'Mardan', province: 'Khyber Pakhtunkhwa', deliveryFee: 280, estimatedDays: '2–4 Days', codAvailable: true, active: true },
  { city: 'Muzaffarabad', province: 'Azad Kashmir', deliveryFee: 350, estimatedDays: '3–5 Days', codAvailable: true, active: true },
  { city: 'Mirpur', province: 'Azad Kashmir', deliveryFee: 300, estimatedDays: '2–4 Days', codAvailable: true, active: true },
  { city: 'Gilgit', province: 'Gilgit-Baltistan', deliveryFee: 400, estimatedDays: '4–6 Days', codAvailable: true, active: true },
  { city: 'Gwadar', province: 'Balochistan', deliveryFee: 400, estimatedDays: '4–6 Days', codAvailable: true, active: true },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'PAKISTAN10',
    description: '10% Off Nationwide Promotion (Minimum Order PKR 3,000)',
    discountType: 'percentage',
    discountValue: 10,
    minOrderPKR: 3000,
    maxDiscountPKR: 5000,
    active: true,
    usageCount: 14,
  },
  {
    id: 'coup-2',
    code: 'WELCOME500',
    description: 'Flat PKR 500 Off for First-Time Customers (Min Order PKR 2,500)',
    discountType: 'fixed',
    discountValue: 500,
    minOrderPKR: 2500,
    active: true,
    usageCount: 29,
  },
  {
    id: 'coup-3',
    code: 'EID15',
    description: '15% Festive Season Discount on Orders Above PKR 10,000',
    discountType: 'percentage',
    discountValue: 15,
    minOrderPKR: 10000,
    maxDiscountPKR: 7500,
    active: true,
    usageCount: 8,
  },
];

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Delivery & Shipping',
    question: 'How long does Cash on Delivery (COD) take across Pakistan?',
    answer: 'Orders confirmed before 4:00 PM PKT are dispatched the same day. Major metro hubs (Karachi, Lahore, Islamabad, Rawalpindi) receive delivery within 24–48 hours. All other cities take 2–5 working days.',
  },
  {
    id: 'faq-2',
    category: 'Payments & Pricing',
    question: 'Are all prices final in Pakistani Rupees (PKR)?',
    answer: 'Yes. Every price displayed on CARRY CART is in Pakistani Rupees (PKR) inclusive of applicable taxes. Orders above PKR 5,000 automatically qualify for Free Insured Courier Delivery.',
  },
  {
    id: 'faq-3',
    category: 'Returns & Exchanges',
    question: 'What is your 7-Day Return and Size Exchange policy?',
    answer: 'If an item does not fit or fails to meet your expectations, reach out to our WhatsApp desk (+966 50 170 1709) or submit a Support Ticket within 7 days of delivery for a free size exchange or full refund via Bank IBAN, Easypaisa, or JazzCash.',
  },
  {
    id: 'faq-4',
    category: 'Order Tracking',
    question: 'How do I check my order status and timestamp history?',
    answer: 'Visit the Track Order page and enter your unique Order Number (e.g., CC-849201) or your registered Pakistani mobile number (e.g., 03001234567) to view the real-time status history timeline with timestamps for Pending, Processing, Shipped, and Delivered states.',
  },
];

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'Chronos Obsidian Titanium Chronograph 42mm',
    customerName: 'Hamza Tariq',
    city: 'Lahore',
    rating: 5,
    comment: 'Received in DHA Lahore within 28 hours via COD. The sapphire crystal and brushed titanium finish look even sharper in person than in photos.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-10-01T14:22:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    productName: 'Vektor Studio ANC Pro Over-Ear Wireless Headphones',
    customerName: 'Ayesha Siddiqui',
    city: 'Karachi',
    rating: 5,
    comment: 'Used these on a Karachi to Islamabad flight—blocked out cabin engine noise completely. Battery is still at 60% after a full week of work calls.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-10-03T18:10:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-3',
    productName: 'Lahore Heritage Full-Grain Leather 16" Laptop Briefcase',
    customerName: 'Usman Farooq',
    city: 'Islamabad',
    rating: 5,
    comment: 'Authentic full-grain leather smell and heavy-duty YKK metal zippers. Fits my 16-inch MacBook Pro and charger effortlessly.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-10-06T09:45:00Z',
  },
  {
    id: 'rev-4',
    productId: 'prod-5',
    productName: 'VoltMax 140W GaN Fast Charging Power Bank 27,000mAh + Charger Bundle',
    customerName: 'Bilal Ahmed Khan',
    city: 'Peshawar',
    rating: 5,
    comment: 'Absolute lifesaver during load-shedding. It charges my Dell XPS laptop at 100W and my Samsung phone at the same time.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-10-08T11:30:00Z',
  },
];

export const INITIAL_DATABASE: StoreDatabase = {
  categories: INITIAL_CATEGORIES,
  products: INITIAL_PRODUCTS,
  reviews: INITIAL_REVIEWS,
  banners: INITIAL_BANNERS,
  cities: INITIAL_CITIES,
  coupons: INITIAL_COUPONS,
  tickets: [
    {
      id: 'tkt-101',
      ticketNumber: 'TKT-9012',
      customerName: 'Saad Ur Rehman',
      phone: '03219876543',
      email: 'saad.rehman@example.pk',
      orderNumber: 'CC-849202',
      subject: 'Delivery timing request for DHA Karachi',
      message: 'Please ask the courier rider to deliver after 2:00 PM at Creek Vista Phase 8.',
      status: 'Resolved',
      adminResponse: 'Noted! We have updated the dispatch instructions with Leopards Courier for afternoon delivery.',
      createdAt: '2026-10-11T10:00:00Z',
      updatedAt: '2026-10-11T11:15:00Z',
    },
  ],
  customers: [],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: '2026-10-11T17:05:00Z',
      actor: 'admin@carrycart.pk',
      action: 'ORDER_STATUS_UPDATED',
      details: 'Order CC-849202 marked as Shipped with courier tracking.',
    },
  ],
  settings: {
    storeName: 'CARRY CART',
    tagline: 'Pakistan’s Premier Multi-Category Marketplace',
    whatsappNumber: '+966 50 170 1709',
    whatsappLink: 'https://wa.me/966501701709',
    supportEmail: 'support@carrycart.pk',
    headquarters: 'Online Fulfillment Network Operating Nationwide Across Pakistan',
    freeShippingThreshold: 5000,
    defaultShippingFee: 250,
    taxRatePercent: 0,
    onlinePaymentEnabled: true,
    bankDetails: 'Meezan Bank Limited — Account Title: CARRY CART — IBAN: Configure in Admin Settings',
    easypaisaNumber: 'Configure in Admin Settings',
    jazzcashNumber: 'Configure in Admin Settings',
    paymentConfig: {
      codEnabled: true,
      easypaisaEnabled: true,
      easypaisaAccountTitle: 'CARRY CART OFFICIAL',
      easypaisaNumber: '0300-1234567',
      jazzcashEnabled: true,
      jazzcashAccountTitle: 'CARRY CART OFFICIAL',
      jazzcashNumber: '0301-7654321',
      bankTransferEnabled: true,
      bankDetails: 'Meezan Bank Limited — Account Title: CARRY CART PAKISTAN — IBAN: PK36MEZN0001234567890102',
      raastEnabled: true,
      raastId: 'CARRYCART@MEEZAN',
      cardGatewayEnabled: false,
      cardGatewayProvider: 'Safepay',
      cardGatewayConfigured: false,
      cardGatewayMerchantId: '',
    },
    marketing: {
      metaPixelId: '',
      googleAnalyticsId: '',
      facebookUrl: 'https://facebook.com',
      instagramUrl: 'https://instagram.com',
      tiktokUrl: 'https://tiktok.com',
      whatsappAutomationConfigured: false,
    },
    featuredBrands: [
      'Aethelgard Horology',
      'Vektor Audio',
      'Karakoram Leatherworks',
      'KaffeMeister',
      'VoltMax Pakistan',
      'Nawab Textile Mills',
      'Zoya Atelier',
      'Sialkot ProCrafts',
    ],
    faqs: INITIAL_FAQS,
    policies: {
      aboutUs: 'CARRY CART is a modern multi-category online shopping marketplace built for customers throughout Pakistan. We partner directly with precision manufacturers, export-grade textile mills, and verified electronics distributors to deliver authentic products in Pakistani Rupees (PKR) with nationwide Cash on Delivery and responsive WhatsApp support (+966 50 170 1709).',
      deliveryPolicy: 'Orders placed before 4:00 PM PKT are dispatched the same day via insured courier partners. Delivery takes 24–48 hours in Karachi, Lahore, Islamabad, and Rawalpindi, and 2–5 working days for all other cities across Pakistan. Free delivery applies automatically on all orders above PKR 5,000.',
      cancellationPolicy: 'Customers may cancel any order free of charge before it is handed over to the courier by contacting our WhatsApp desk (+966 50 170 1709) or submitting an order cancellation request in the Support portal.',
      returnRefundPolicy: 'We offer a 7-Day Return & Exchange guarantee on unused items in original packaging with intact tags. Refunds are processed within 48 hours of return inspection via Bank Transfer, Raast, Easypaisa, or JazzCash.',
      privacyPolicy: 'CARRY CART strictly protects customer personal information (name, Pakistani mobile number, email, and delivery address). Data is used exclusively for courier fulfillment, order verification, and consent-based updates, and is never sold to third-party marketers.',
      termsAndConditions: 'By placing an order on CARRY CART, you confirm that your provided delivery address and Pakistani contact number are accurate for courier verification. All prices are listed in Pakistani Rupees (PKR). Promotional coupon codes are subject to minimum order thresholds configured by the store administrator.',
    },
  },
  orders: [
    {
      id: 'ord-demo-1001',
      orderNumber: 'CC-849201',
      customerName: 'Zainab Mansoor',
      phone: '03001234567',
      email: 'zainab.mansoor@example.pk',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: '54792',
      address: 'House 42-B, Street 8, Phase 5 DHA, Lahore',
      landmark: 'Near Jalal Sons Phase 5',
      paymentMethod: 'COD',
      paymentStatus: 'Paid',
      items: [
        {
          productId: 'prod-1',
          name: 'Chronos Obsidian Titanium Chronograph 42mm',
          sku: 'CC-WT-101',
          price: 27900,
          originalPrice: 34500,
          quantity: 1,
          image: INITIAL_PRODUCTS[0].images[0],
          selectedVariations: { 'Strap Style': 'Brushed Black Steel Link', 'Dial Size': '42mm Executive' },
          maxStock: 18,
        },
      ],
      subtotal: 27900,
      discountTotal: 6600,
      deliveryFee: 0,
      total: 27900,
      status: 'Delivered',
      courierName: 'TCS Express Pakistan',
      trackingNumber: 'TCS-774829104',
      trackingUrl: 'https://www.tcsexpress.com/track/TCS-774829104',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: '2026-10-08T10:15:00Z',
          note: 'Order placed by customer via Pakistan Express Checkout (COD).',
          actor: 'Customer',
        },
        {
          status: 'Processing',
          timestamp: '2026-10-08T13:30:00Z',
          note: 'Phone verification completed; item inspected & packed at Lahore fulfillment hub.',
          actor: 'Fulfillment Desk',
        },
        {
          status: 'Shipped',
          timestamp: '2026-10-09T09:10:00Z',
          note: 'Dispatched via TCS Express Pakistan (Consignment #TCS-774829104).',
          actor: 'Courier Dispatch',
        },
        {
          status: 'Delivered',
          timestamp: '2026-10-10T16:40:00Z',
          note: 'Parcel delivered to recipient in DHA Phase 5, Lahore; COD payment collected.',
          actor: 'Courier Rider',
        },
      ],
      createdAt: '2026-10-08T10:15:00Z',
      updatedAt: '2026-10-10T16:40:00Z',
    },
    {
      id: 'ord-demo-1002',
      orderNumber: 'CC-849202',
      customerName: 'Saad Ur Rehman',
      phone: '03219876543',
      email: 'saad.rehman@example.pk',
      city: 'Karachi',
      province: 'Sindh',
      postalCode: '75500',
      address: 'Apartment 902, Creek Vista, Phase 8 DHA, Karachi',
      paymentMethod: 'COD',
      paymentStatus: 'COD Pending',
      items: [
        {
          productId: 'prod-5',
          name: 'VoltMax 140W GaN Fast Charging Power Bank 27,000mAh + Charger Bundle',
          sku: 'CC-MB-502',
          price: 12990,
          originalPrice: 16500,
          quantity: 1,
          image: INITIAL_PRODUCTS[4].images[0],
          selectedVariations: { 'Bundle Option': 'Power Bank + 240W Cable' },
          maxStock: 45,
        },
      ],
      subtotal: 12990,
      discountTotal: 3510,
      deliveryFee: 0,
      total: 12990,
      status: 'Shipped',
      courierName: 'Leopards Courier',
      trackingNumber: 'LCS-99201844',
      trackingUrl: 'https://www.leopardscourier.com',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: '2026-10-11T09:12:00Z',
          note: 'Order received and queued for COD verification.',
          actor: 'Customer',
        },
        {
          status: 'Processing',
          timestamp: '2026-10-11T12:20:00Z',
          note: 'Quality check passed; sealed in tamper-evident packaging.',
          actor: 'Fulfillment Desk',
        },
        {
          status: 'Shipped',
          timestamp: '2026-10-11T17:05:00Z',
          note: 'Handed over to Leopards Courier (Tracking #LCS-99201844) bound for Karachi.',
          actor: 'Courier Dispatch',
        },
      ],
      createdAt: '2026-10-11T09:12:00Z',
      updatedAt: '2026-10-11T17:05:00Z',
    },
  ],
  newsletterSubscribers: [],
};
