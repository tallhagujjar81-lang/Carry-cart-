export interface ProductVariationOption {
  label: string; // e.g., "Size", "Color", "Storage / Model"
  values: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameUr?: string;
  sku: string;
  categoryId: string;
  subcategory: string;
  brand: string;
  price: number; // Regular price in PKR
  discountedPrice: number | null; // Sale price in PKR (if discounted)
  stock: number;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  variations: ProductVariationOption[];
  rating: number;
  reviewCount: number;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  isRecommended: boolean;
  isPublished: boolean;
  deliveryEstimate: string;
  warranty: string;
  returnEligible: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameUr: string;
  description: string;
  subcategories: string[];
  featured: boolean;
  sortOrder: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName?: string;
  customerName: string;
  city: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
}

export interface HeroBanner {
  id: string;
  kicker: string;
  title: string;
  titleUr?: string;
  subtitle: string;
  ctaText: string;
  targetCategorySlug: string;
  imageUrl: string;
  active: boolean;
}

export interface CityDeliveryConfig {
  city: string;
  province:
    | 'Punjab'
    | 'Sindh'
    | 'Khyber Pakhtunkhwa'
    | 'Balochistan'
    | 'Islamabad Capital Territory'
    | 'Azad Kashmir'
    | 'Gilgit-Baltistan';
  deliveryFee: number; // in PKR
  estimatedDays: string;
  codAvailable: boolean;
  active: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface StorePolicies {
  aboutUs: string;
  deliveryPolicy: string;
  cancellationPolicy: string;
  returnRefundPolicy: string;
  privacyPolicy: string;
  termsAndConditions: string;
}

export interface PaymentMethodConfig {
  codEnabled: boolean;
  easypaisaEnabled: boolean;
  easypaisaAccountTitle: string;
  easypaisaNumber: string;
  jazzcashEnabled: boolean;
  jazzcashAccountTitle: string;
  jazzcashNumber: string;
  bankTransferEnabled: boolean;
  bankDetails: string;
  raastEnabled: boolean;
  raastId: string;
  cardGatewayEnabled: boolean;
  cardGatewayProvider: 'Safepay' | 'PayFast' | 'AlfaPayment' | 'NotConfigured';
  cardGatewayConfigured: boolean;
  cardGatewayMerchantId: string;
}

export interface MarketingSettings {
  metaPixelId: string;
  googleAnalyticsId: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  whatsappAutomationConfigured: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappLink: string;
  supportEmail: string;
  headquarters: string;
  freeShippingThreshold: number; // PKR
  defaultShippingFee: number; // PKR
  taxRatePercent: number;
  onlinePaymentEnabled: boolean;
  bankDetails: string;
  easypaisaNumber: string;
  jazzcashNumber: string;
  paymentConfig: PaymentMethodConfig;
  marketing: MarketingSettings;
  featuredBrands: string[];
  faqs: FaqItem[];
  policies: StorePolicies;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // % or PKR
  minOrderPKR: number;
  maxDiscountPKR?: number;
  active: boolean;
  usageCount: number;
  expiresAt?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number; // Effective unit price in PKR
  originalPrice: number; // Original unit price in PKR
  quantity: number;
  image: string;
  selectedVariations: Record<string, string>;
  maxStock: number;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Payment Pending'
  | 'Payment Confirmed'
  | 'Pending Verification'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned / Refunded';

export type PaymentStatus =
  | 'COD Pending'
  | 'Pending Verification'
  | 'Paid'
  | 'Failed'
  | 'Refunded';

export type PaymentMethod =
  | 'COD'
  | 'Easypaisa'
  | 'JazzCash'
  | 'BankTransfer'
  | 'Raast'
  | 'CardGateway';

export interface OrderStatusHistoryEntry {
  status: string;
  timestamp: string;
  note: string;
  actor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  province: string;
  postalCode?: string;
  address: string;
  landmark?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  couponCode?: string;
  couponDiscountTotal?: number;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  updatedAt: string;
  idempotencyKey?: string;
}

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  address: string;
  wishlist: string[];
  marketingConsent: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  orderNumber?: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface StoreDatabase {
  categories: Category[];
  products: Product[];
  reviews: ProductReview[];
  banners: HeroBanner[];
  cities: CityDeliveryConfig[];
  coupons: Coupon[];
  tickets: SupportTicket[];
  customers: (CustomerAccount & { passwordHash: string; salt: string })[];
  auditLogs: AuditLogEntry[];
  settings: StoreSettings;
  orders: Order[];
  newsletterSubscribers: { email: string; consent: boolean; subscribedAt: string }[];
}
