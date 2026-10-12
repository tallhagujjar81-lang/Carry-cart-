import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { INITIAL_DATABASE } from './src/seedData.ts';
import {
  StoreDatabase,
  Product,
  Category,
  Order,
  HeroBanner,
  ProductReview,
  CityDeliveryConfig,
  Coupon,
  SupportTicket,
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'carry_cart_db.json');
const ADMIN_CREDENTIALS_FILE = path.join(DATA_DIR, 'admin_auth.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface AdminAuthConfig {
  email: string;
  passwordHash: string;
  salt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function loadAdminAuth(): AdminAuthConfig {
  if (fs.existsSync(ADMIN_CREDENTIALS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ADMIN_CREDENTIALS_FILE, 'utf-8'));
    } catch {
      // fallthrough
    }
  }
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@carrycart.pk';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'CarryCartAdmin#2026';
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(defaultPassword, salt);
  const config: AdminAuthConfig = { email: defaultEmail, passwordHash, salt };
  fs.writeFileSync(ADMIN_CREDENTIALS_FILE, JSON.stringify(config, null, 2), 'utf-8');
  return config;
}

function saveDatabase(db: StoreDatabase): void {
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

function loadDatabase(): StoreDatabase {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreDatabase>;
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
        // Ensure backward-compatible migration for newly added fields
        const merged: StoreDatabase = {
          ...INITIAL_DATABASE,
          ...parsed,
          coupons: Array.isArray(parsed.coupons) ? parsed.coupons : INITIAL_DATABASE.coupons,
          tickets: Array.isArray(parsed.tickets) ? parsed.tickets : INITIAL_DATABASE.tickets,
          customers: Array.isArray(parsed.customers) ? parsed.customers : [],
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : INITIAL_DATABASE.auditLogs,
          settings: {
            ...INITIAL_DATABASE.settings,
            ...(parsed.settings || {}),
            paymentConfig: {
              ...INITIAL_DATABASE.settings.paymentConfig,
              ...(parsed.settings?.paymentConfig || {}),
            },
            marketing: {
              ...INITIAL_DATABASE.settings.marketing,
              ...(parsed.settings?.marketing || {}),
            },
            faqs: Array.isArray(parsed.settings?.faqs)
              ? parsed.settings!.faqs
              : INITIAL_DATABASE.settings.faqs,
            policies: {
              ...INITIAL_DATABASE.settings.policies,
              ...(parsed.settings?.policies || {}),
            },
          },
          orders: (parsed.orders || INITIAL_DATABASE.orders).map((ord) => {
            if (!Array.isArray(ord.statusHistory) || ord.statusHistory.length === 0) {
              const seedMatch = INITIAL_DATABASE.orders.find(
                (so) => so.orderNumber === ord.orderNumber
              );
              return {
                ...ord,
                paymentStatus: ord.paymentStatus || (ord.status === 'Delivered' ? 'Paid' : 'COD Pending'),
                statusHistory: seedMatch
                  ? seedMatch.statusHistory
                  : [
                      {
                        status: 'Pending',
                        timestamp: ord.createdAt,
                        note: 'Order submitted via Pakistan Express Checkout.',
                        actor: 'Customer',
                      },
                      ...(ord.status !== 'Order Placed' && ord.status !== 'Pending Verification'
                        ? [
                            {
                              status: ord.status,
                              timestamp: ord.updatedAt || ord.createdAt,
                              note: `Order transitioned to ${ord.status}.`,
                              actor: 'Fulfillment Desk',
                            },
                          ]
                        : []),
                    ],
              };
            }
            return ord;
          }),
        };
        saveDatabase(merged);
        return merged;
      }
    } catch (e) {
      console.error('Failed to parse DB file, re-seeding:', e);
    }
  }
  const cloned = JSON.parse(JSON.stringify(INITIAL_DATABASE)) as StoreDatabase;
  saveDatabase(cloned);
  return cloned;
}

let db: StoreDatabase = loadDatabase();
let adminAuth: AdminAuthConfig = loadAdminAuth();

const activeAdminSessions = new Map<string, { email: string; expiresAt: number }>();
const activeCustomerSessions = new Map<string, { customerId: string; expiresAt: number }>();

function recordAudit(actor: string, action: string, details: string) {
  db.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    details,
  });
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
}

function createAdminSession(email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeAdminSessions.set(token, {
    email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  return token;
}

function verifyAdminToken(req: Request): { email: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const session = activeAdminSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(token);
    return null;
  }
  return { email: session.email };
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!verifyAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized administrator access. Please sign in.' });
  }
  next();
}

function isValidPakistaniPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(?:\+92|0092|92|0)?3[0-9]{9}$/.test(cleaned);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // ==========================================
  // PUBLIC STOREFRONT ENDPOINTS
  // ==========================================

  app.get('/api/store', (_req: Request, res: Response) => {
    const publishedProducts = db.products.filter((p) => p.isPublished);
    const approvedReviews = db.reviews.filter((r) => r.status === 'approved');
    const activeBanners = db.banners.filter((b) => b.active);
    const activeCoupons = db.coupons.filter((c) => c.active);

    res.json({
      categories: db.categories.sort((a, b) => a.sortOrder - b.sortOrder),
      products: publishedProducts,
      reviews: approvedReviews,
      banners: activeBanners,
      cities: db.cities,
      coupons: activeCoupons,
      settings: db.settings,
    });
  });

  // Validate Discount Coupon Code
  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Please enter a coupon code.' });
    }
    const cleanCode = String(code).trim().toUpperCase();
    const coupon = db.coupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.active
    );
    if (!coupon) {
      return res.status(404).json({ error: `Coupon code "${cleanCode}" is invalid or expired.` });
    }
    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minOrderPKR) {
      return res.status(400).json({
        error: `Coupon ${coupon.code} requires a minimum order of PKR ${coupon.minOrderPKR.toLocaleString()}.`,
      });
    }
    let discountAmount =
      coupon.discountType === 'percentage'
        ? Math.round((orderSubtotal * coupon.discountValue) / 100)
        : coupon.discountValue;

    if (coupon.maxDiscountPKR && discountAmount > coupon.maxDiscountPKR) {
      discountAmount = coupon.maxDiscountPKR;
    }

    res.json({
      coupon,
      discountAmount,
    });
  });

  // Track order by Order Number or Customer Phone
  app.get('/api/orders/track', (req: Request, res: Response) => {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({
        error: 'Please provide an Order Number (e.g., CC-849201) or Pakistani phone number.',
      });
    }
    const normalizedQuery = query.toLowerCase().replace(/[\s\-]/g, '');
    const matches = db.orders.filter((order) => {
      const normOrderNo = order.orderNumber.toLowerCase().replace(/[\s\-]/g, '');
      const normPhone = order.phone.toLowerCase().replace(/[\s\-]/g, '');
      return (
        normOrderNo === normalizedQuery ||
        (normalizedQuery.length >= 9 && normPhone.endsWith(normalizedQuery.slice(-9)))
      );
    });
    res.json({ orders: matches });
  });

  // Create Order with server-side validation, coupon check, stock deduction, and timestamped statusHistory
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const {
        customerId,
        customerName,
        phone,
        email,
        city,
        postalCode,
        address,
        landmark,
        notes,
        paymentMethod,
        paymentReference,
        couponCode,
        items,
        idempotencyKey,
      } = req.body;

      if (!customerName || String(customerName).trim().length < 2) {
        return res.status(400).json({ error: 'Please enter your full name.' });
      }
      if (!phone || !isValidPakistaniPhone(String(phone))) {
        return res.status(400).json({
          error: 'Please enter a valid Pakistani mobile number (e.g., 0300-1234567 or +92 300 1234567).',
        });
      }
      if (!city) {
        return res.status(400).json({ error: 'Please select a delivery city in Pakistan.' });
      }

      const cityConfig = db.cities.find(
        (c) => c.city.toLowerCase() === String(city).toLowerCase() && c.active
      );
      if (!cityConfig) {
        return res.status(400).json({ error: `Delivery to ${city} is currently unavailable.` });
      }
      if (paymentMethod === 'COD' && !cityConfig.codAvailable) {
        return res.status(400).json({
          error: `Cash on Delivery is not available for ${city}. Please choose an online payment method.`,
        });
      }
      if (!address || String(address).trim().length < 8) {
        return res.status(400).json({ error: 'Please provide a complete street/house delivery address.' });
      }
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Your shopping cart is empty.' });
      }

      // Duplicate order prevention via idempotencyKey
      if (idempotencyKey) {
        const existingOrder = db.orders.find((o) => o.idempotencyKey === idempotencyKey);
        if (existingOrder) {
          return res.status(200).json({ order: existingOrder, duplicatePrevented: true });
        }
      }

      let subtotal = 0;
      let originalTotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = db.products.find((p) => p.id === item.productId && p.isPublished);
        if (!product) {
          return res.status(400).json({
            error: `Product "${item.name || item.productId}" is no longer available.`,
          });
        }
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        if (product.stock < qty) {
          return res.status(400).json({
            error: `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) available.`,
          });
        }
        const effectivePrice =
          product.discountedPrice !== null &&
          product.discountedPrice > 0 &&
          product.discountedPrice < product.price
            ? product.discountedPrice
            : product.price;

        subtotal += effectivePrice * qty;
        originalTotal += product.price * qty;

        validatedItems.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: effectivePrice,
          originalPrice: product.price,
          quantity: qty,
          image: product.images[0] || '',
          selectedVariations: item.selectedVariations || {},
          maxStock: product.stock,
        });
      }

      // Apply coupon if valid
      let couponDiscountTotal = 0;
      let appliedCouponCode: string | undefined;
      if (couponCode) {
        const cleanCode = String(couponCode).trim().toUpperCase();
        const coupon = db.coupons.find(
          (c) => c.code.toUpperCase() === cleanCode && c.active
        );
        if (coupon && subtotal >= coupon.minOrderPKR) {
          couponDiscountTotal =
            coupon.discountType === 'percentage'
              ? Math.round((subtotal * coupon.discountValue) / 100)
              : coupon.discountValue;
          if (coupon.maxDiscountPKR && couponDiscountTotal > coupon.maxDiscountPKR) {
            couponDiscountTotal = coupon.maxDiscountPKR;
          }
          coupon.usageCount += 1;
          appliedCouponCode = coupon.code;
        }
      }

      // Deduct stock atomically
      for (const vItem of validatedItems) {
        const prod = db.products.find((p) => p.id === vItem.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - vItem.quantity);
        }
      }

      const discountTotal = Math.max(0, originalTotal - subtotal) + couponDiscountTotal;
      const discountedSubtotal = Math.max(0, subtotal - couponDiscountTotal);
      const deliveryFee =
        discountedSubtotal >= db.settings.freeShippingThreshold ? 0 : cityConfig.deliveryFee;
      const total = discountedSubtotal + deliveryFee;

      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `CC-${randomDigits}`;
      const nowIso = new Date().toISOString();

      const validPaymentMethod = [
        'COD',
        'Easypaisa',
        'JazzCash',
        'BankTransfer',
        'Raast',
      ].includes(paymentMethod)
        ? paymentMethod
        : 'COD';

      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        orderNumber,
        customerId: customerId ? String(customerId) : undefined,
        customerName: String(customerName).trim().slice(0, 120),
        phone: String(phone).trim().slice(0, 30),
        email: email ? String(email).trim().slice(0, 120) : '',
        city: cityConfig.city,
        province: cityConfig.province,
        postalCode: postalCode ? String(postalCode).trim().slice(0, 20) : '',
        address: String(address).trim().slice(0, 400),
        landmark: landmark ? String(landmark).trim().slice(0, 200) : '',
        notes: notes ? String(notes).trim().slice(0, 400) : '',
        paymentMethod: validPaymentMethod,
        paymentStatus:
          validPaymentMethod === 'COD' ? 'COD Pending' : 'Pending Verification',
        paymentReference: paymentReference ? String(paymentReference).trim().slice(0, 120) : '',
        couponCode: appliedCouponCode,
        couponDiscountTotal,
        items: validatedItems,
        subtotal,
        discountTotal,
        deliveryFee,
        total,
        status: 'Order Placed',
        statusHistory: [
          {
            status: 'Pending',
            timestamp: nowIso,
            note: `Order placed by ${String(customerName).trim()} via ${validPaymentMethod}. Awaiting dispatch processing.`,
            actor: 'Customer',
          },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
        idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined,
      };

      db.orders.unshift(newOrder);
      saveDatabase(db);

      res.status(201).json({ order: newOrder });
    } catch (err) {
      console.error('Order creation error:', err);
      res.status(500).json({ error: 'Unable to process order right now. Please try again.' });
    }
  });

  // ==========================================
  // CUSTOMER ACCOUNTS & AUTHENTICATION
  // ==========================================

  app.post('/api/customer/register', (req: Request, res: Response) => {
    const { name, email, phone, password, city, postalCode, address, marketingConsent } = req.body;
    if (!name || !email || !phone || !password || String(password).length < 6) {
      return res.status(400).json({
        error: 'Name, email, Pakistani mobile number, and a password (min 6 characters) are required.',
      });
    }
    if (!isValidPakistaniPhone(String(phone))) {
      return res.status(400).json({
        error: 'Please enter a valid Pakistani mobile number (e.g., 0300-1234567).',
      });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    if (db.customers.some((c) => c.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(String(password), salt);
    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: String(name).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
      city: String(city || 'Lahore').trim(),
      postalCode: String(postalCode || '').trim(),
      address: String(address || '').trim(),
      wishlist: [],
      marketingConsent: Boolean(marketingConsent),
      createdAt: new Date().toISOString(),
      passwordHash,
      salt,
    };

    db.customers.push(newCustomer);
    saveDatabase(db);

    const token = crypto.randomBytes(32).toString('hex');
    activeCustomerSessions.set(token, {
      customerId: newCustomer.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _ph, salt: _s, ...publicProfile } = newCustomer;
    res.status(201).json({ token, customer: publicProfile });
  });

  app.post('/api/customer/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const customer = db.customers.find((c) => c.email.toLowerCase() === cleanEmail);
    if (!customer) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const candidateHash = hashPassword(String(password), customer.salt);
    if (candidateHash !== customer.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    activeCustomerSessions.set(token, {
      customerId: customer.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _ph, salt: _s, ...publicProfile } = customer;
    const customerOrders = db.orders.filter(
      (o) =>
        o.customerId === customer.id ||
        o.email?.toLowerCase() === customer.email.toLowerCase() ||
        o.phone.replace(/\D/g, '').slice(-9) === customer.phone.replace(/\D/g, '').slice(-9)
    );

    res.json({ token, customer: publicProfile, orders: customerOrders });
  });

  app.post('/api/customer/reset-password', (req: Request, res: Response) => {
    const { email, phone, newPassword } = req.body;
    if (!email || !phone || !newPassword || String(newPassword).length < 6) {
      return res.status(400).json({
        error: 'Provide your registered email, Pakistani phone number, and a new password (min 6 characters).',
      });
    }
    const customer = db.customers.find(
      (c) =>
        c.email.toLowerCase() === String(email).trim().toLowerCase() &&
        c.phone.replace(/\D/g, '').slice(-9) === String(phone).replace(/\D/g, '').slice(-9)
    );
    if (!customer) {
      return res.status(404).json({
        error: 'No matching account found with that email and Pakistani phone number combination.',
      });
    }
    const newSalt = crypto.randomBytes(16).toString('hex');
    customer.salt = newSalt;
    customer.passwordHash = hashPassword(String(newPassword), newSalt);
    saveDatabase(db);
    res.json({ success: true });
  });

  app.put('/api/customer/profile', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not signed in.' });
    }
    const session = activeCustomerSessions.get(authHeader.slice(7).trim());
    if (!session) return res.status(401).json({ error: 'Session expired.' });

    const customer = db.customers.find((c) => c.id === session.customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });

    const { name, phone, city, postalCode, address, marketingConsent } = req.body;
    if (name) customer.name = String(name).trim();
    if (phone) customer.phone = String(phone).trim();
    if (city) customer.city = String(city).trim();
    if (postalCode !== undefined) customer.postalCode = String(postalCode).trim();
    if (address !== undefined) customer.address = String(address).trim();
    if (marketingConsent !== undefined) customer.marketingConsent = Boolean(marketingConsent);

    saveDatabase(db);
    const { passwordHash: _ph, salt: _s, ...publicProfile } = customer;
    res.json({ customer: publicProfile });
  });

  // ==========================================
  // CUSTOMER SUPPORT ENQUIRIES / TICKETS
  // ==========================================

  app.post('/api/tickets', (req: Request, res: Response) => {
    const { customerName, phone, email, orderNumber, subject, message } = req.body;
    if (!customerName || !phone || !message) {
      return res.status(400).json({
        error: 'Please provide your name, contact phone number, and support message.',
      });
    }
    const nowIso = new Date().toISOString();
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: String(customerName).trim().slice(0, 100),
      phone: String(phone).trim().slice(0, 30),
      email: email ? String(email).trim().slice(0, 100) : '',
      orderNumber: orderNumber ? String(orderNumber).trim().toUpperCase().slice(0, 30) : '',
      subject: String(subject || 'General Enquiry').trim().slice(0, 150),
      message: String(message).trim().slice(0, 1000),
      status: 'Open',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    db.tickets.unshift(newTicket);
    saveDatabase(db);
    res.status(201).json({ ticket: newTicket });
  });

  app.get('/api/tickets/lookup', (req: Request, res: Response) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) return res.json({ tickets: [] });
    const matches = db.tickets.filter(
      (t) =>
        t.ticketNumber.toLowerCase() === q ||
        (t.orderNumber && t.orderNumber.toLowerCase() === q) ||
        t.phone.replace(/\D/g, '').endsWith(q.replace(/\D/g, '').slice(-9))
    );
    res.json({ tickets: matches });
  });

  // Submit Customer Product Review
  app.post('/api/reviews', (req: Request, res: Response) => {
    const { productId, customerName, city, rating, comment } = req.body;
    if (!productId || !customerName || !comment) {
      return res.status(400).json({
        error: 'Please complete your name, city, rating, and review comment.',
      });
    }
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const review: ProductReview = {
      id: `rev-${Date.now()}`,
      productId,
      productName: product.name,
      customerName: String(customerName).trim().slice(0, 80),
      city: String(city || 'Lahore').trim().slice(0, 60),
      rating: numRating,
      comment: String(comment).trim().slice(0, 600),
      verifiedPurchase: true,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    db.reviews.unshift(review);

    const prodReviews = db.reviews.filter(
      (r) => r.productId === productId && r.status === 'approved'
    );
    product.reviewCount = prodReviews.length;
    product.rating = Number(
      (
        prodReviews.reduce((acc, r) => acc + r.rating, 0) /
        Math.max(1, prodReviews.length)
      ).toFixed(1)
    );

    saveDatabase(db);
    res.status(201).json({
      review,
      productRating: product.rating,
      reviewCount: product.reviewCount,
    });
  });

  // Newsletter Signup with explicit consent
  app.post('/api/newsletter', (req: Request, res: Response) => {
    const { email, consent } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const normalized = String(email).trim().toLowerCase();
    if (!db.newsletterSubscribers.some((s) => s.email === normalized)) {
      db.newsletterSubscribers.push({
        email: normalized,
        consent: consent !== undefined ? Boolean(consent) : true,
        subscribedAt: new Date().toISOString(),
      });
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  // ==========================================
  // ADMIN AUTHENTICATION & PROTECTED ROUTES
  // ==========================================

  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const candidateHash = hashPassword(String(password), adminAuth.salt);

    if (
      cleanEmail !== adminAuth.email.toLowerCase() ||
      candidateHash !== adminAuth.passwordHash
    ) {
      return res.status(401).json({ error: 'Invalid administrator email or password.' });
    }

    const token = createAdminSession(adminAuth.email);
    recordAudit(adminAuth.email, 'ADMIN_LOGIN', 'Administrator signed in successfully.');
    saveDatabase(db);
    res.json({ token, email: adminAuth.email });
  });

  app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      activeAdminSessions.delete(authHeader.slice(7).trim());
    }
    res.json({ success: true });
  });

  app.get('/api/admin/dashboard', requireAdmin, (_req: Request, res: Response) => {
    const sanitizedCustomers = db.customers.map(({ passwordHash: _p, salt: _s, ...rest }) => rest);
    res.json({
      ...db,
      customers: sanitizedCustomers,
    });
  });

  // Admin: Products CRUD + Duplicate
  app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
    const body = req.body;
    if (!body.name || !body.categoryId || body.price === undefined) {
      return res
        .status(400)
        .json({ error: 'Product name, category, and PKR price are required.' });
    }
    const slug = String(body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      name: String(body.name).trim(),
      nameUr: body.nameUr ? String(body.nameUr).trim() : '',
      sku: body.sku
        ? String(body.sku).trim().toUpperCase()
        : `CC-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: String(body.categoryId),
      subcategory: body.subcategory ? String(body.subcategory).trim() : 'General',
      brand: body.brand ? String(body.brand).trim() : 'CARRY CART Official',
      price: Math.max(0, Number(body.price) || 0),
      discountedPrice:
        body.discountedPrice !== null &&
        body.discountedPrice !== '' &&
        Number(body.discountedPrice) > 0
          ? Number(body.discountedPrice)
          : null,
      stock: Math.max(0, Math.floor(Number(body.stock) || 0)),
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : [INITIAL_DATABASE.products[0].images[0]],
      description: String(body.description || '').trim(),
      specifications: body.specifications || { Quality: 'Export Grade Verified' },
      variations: Array.isArray(body.variations) ? body.variations : [],
      rating: 5.0,
      reviewCount: 1,
      isTrending: Boolean(body.isTrending),
      isBestSeller: Boolean(body.isBestSeller),
      isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : true,
      isFlashSale: Boolean(body.isFlashSale),
      isRecommended: body.isRecommended !== undefined ? Boolean(body.isRecommended) : true,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      deliveryEstimate: body.deliveryEstimate || '2–3 Working Days Nationwide',
      warranty: body.warranty || '7-Day Easy Return & Inspection Guarantee',
      returnEligible: body.returnEligible !== undefined ? Boolean(body.returnEligible) : true,
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    recordAudit(adminAuth.email, 'PRODUCT_CREATED', `Created product ${newProduct.name} (${newProduct.sku})`);
    saveDatabase(db);
    res.status(201).json({ product: newProduct });
  });

  app.post('/api/admin/products/:id/duplicate', requireAdmin, (req: Request, res: Response) => {
    const original = db.products.find((p) => p.id === req.params.id);
    if (!original) return res.status(404).json({ error: 'Product not found.' });

    const copy: Product = {
      ...JSON.parse(JSON.stringify(original)),
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
      sku: `${original.sku}-COPY`,
      createdAt: new Date().toISOString(),
    };
    db.products.unshift(copy);
    recordAudit(adminAuth.email, 'PRODUCT_DUPLICATED', `Duplicated ${original.sku} -> ${copy.sku}`);
    saveDatabase(db);
    res.status(201).json({ product: copy });
  });

  app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found.' });

    const existing = db.products[idx];
    const body = req.body;
    const updated: Product = {
      ...existing,
      ...body,
      id: existing.id,
      price: body.price !== undefined ? Math.max(0, Number(body.price)) : existing.price,
      discountedPrice:
        body.discountedPrice === null || body.discountedPrice === ''
          ? null
          : body.discountedPrice !== undefined
          ? Number(body.discountedPrice)
          : existing.discountedPrice,
      stock:
        body.stock !== undefined ? Math.max(0, Math.floor(Number(body.stock))) : existing.stock,
    };

    db.products[idx] = updated;
    recordAudit(adminAuth.email, 'PRODUCT_UPDATED', `Updated product ${updated.name} (${updated.sku})`);
    saveDatabase(db);
    res.json({ product: updated });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found.' });
    const removed = db.products[idx];
    db.products.splice(idx, 1);
    recordAudit(adminAuth.email, 'PRODUCT_DELETED', `Deleted product ${removed.name} (${removed.sku})`);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin: Categories & Subcategories CRUD
  app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
    const { name, nameUr, description, subcategories, featured } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });
    const slug = String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      slug,
      name: String(name).trim(),
      nameUr: nameUr ? String(nameUr).trim() : String(name).trim(),
      description: String(description || '').trim(),
      subcategories: Array.isArray(subcategories)
        ? subcategories.map((s: string) => String(s).trim()).filter(Boolean)
        : [],
      featured: Boolean(featured),
      sortOrder: db.categories.length + 1,
    };
    db.categories.push(newCat);
    recordAudit(adminAuth.email, 'CATEGORY_CREATED', `Created category ${newCat.name}`);
    saveDatabase(db);
    res.status(201).json({ category: newCat });
  });

  app.put('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found.' });
    const existing = db.categories[idx];
    const updated: Category = {
      ...existing,
      ...req.body,
      id: existing.id,
      subcategories: Array.isArray(req.body.subcategories)
        ? req.body.subcategories.map((s: string) => String(s).trim()).filter(Boolean)
        : existing.subcategories,
    };
    db.categories[idx] = updated;
    saveDatabase(db);
    res.json({ category: updated });
  });

  app.delete('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found.' });
    db.categories.splice(idx, 1);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin: Orders & Status History Management
  app.put('/api/admin/orders/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found.' });

    const existing = db.orders[idx];
    const newStatus = req.body.status || existing.status;
    const nowIso = new Date().toISOString();

    if (
      (newStatus === 'Cancelled' || newStatus === 'Returned / Refunded') &&
      existing.status !== 'Cancelled' &&
      existing.status !== 'Returned / Refunded'
    ) {
      for (const item of existing.items) {
        const prod = db.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      }
    }

    const updatedHistory = Array.isArray(existing.statusHistory)
      ? [...existing.statusHistory]
      : [];

    if (newStatus !== existing.status || req.body.statusNote) {
      updatedHistory.push({
        status: newStatus,
        timestamp: nowIso,
        note:
          req.body.statusNote ||
          `Order status updated to "${newStatus}" by administrator.`,
        actor: 'Administrator',
      });
    }

    const updated: Order = {
      ...existing,
      ...req.body,
      id: existing.id,
      orderNumber: existing.orderNumber,
      status: newStatus,
      statusHistory: updatedHistory,
      updatedAt: nowIso,
    };

    db.orders[idx] = updated;
    recordAudit(
      adminAuth.email,
      'ORDER_UPDATED',
      `Order ${existing.orderNumber} -> Status: ${newStatus}, Payment: ${updated.paymentStatus}`
    );
    saveDatabase(db);
    res.json({ order: updated });
  });

  // Admin: Coupons CRUD
  app.post('/api/admin/coupons', requireAdmin, (req: Request, res: Response) => {
    const { code, description, discountType, discountValue, minOrderPKR, maxDiscountPKR } =
      req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Coupon code and discount value are required.' });
    }
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: String(code).trim().toUpperCase(),
      description: String(description || 'Promotional Discount').trim(),
      discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Math.max(1, Number(discountValue)),
      minOrderPKR: Math.max(0, Number(minOrderPKR) || 0),
      maxDiscountPKR: maxDiscountPKR ? Number(maxDiscountPKR) : undefined,
      active: true,
      usageCount: 0,
    };
    db.coupons.unshift(newCoupon);
    recordAudit(adminAuth.email, 'COUPON_CREATED', `Created coupon ${newCoupon.code}`);
    saveDatabase(db);
    res.status(201).json({ coupon: newCoupon });
  });

  app.put('/api/admin/coupons/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.coupons.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Coupon not found.' });
    db.coupons[idx] = { ...db.coupons[idx], ...req.body, id: db.coupons[idx].id };
    saveDatabase(db);
    res.json({ coupon: db.coupons[idx] });
  });

  app.delete('/api/admin/coupons/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.coupons.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Coupon not found.' });
    db.coupons.splice(idx, 1);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin: Support Tickets Response
  app.put('/api/admin/tickets/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.tickets.findIndex((t) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Ticket not found.' });
    db.tickets[idx] = {
      ...db.tickets[idx],
      ...req.body,
      id: db.tickets[idx].id,
      updatedAt: new Date().toISOString(),
    };
    recordAudit(
      adminAuth.email,
      'TICKET_UPDATED',
      `Updated ticket ${db.tickets[idx].ticketNumber} (${db.tickets[idx].status})`
    );
    saveDatabase(db);
    res.json({ ticket: db.tickets[idx] });
  });

  // Admin: Cities & Shipping Configuration
  app.put('/api/admin/cities', requireAdmin, (req: Request, res: Response) => {
    const { cities } = req.body;
    if (!Array.isArray(cities)) {
      return res.status(400).json({ error: 'Invalid cities list.' });
    }
    db.cities = cities as CityDeliveryConfig[];
    saveDatabase(db);
    res.json({ cities: db.cities });
  });

  // Admin: Promotional Banners
  app.post('/api/admin/banners', requireAdmin, (req: Request, res: Response) => {
    const { kicker, title, titleUr, subtitle, ctaText, targetCategorySlug, imageUrl, active } =
      req.body;
    if (!title) return res.status(400).json({ error: 'Banner title is required.' });
    const newBanner: HeroBanner = {
      id: `banner-${Date.now()}`,
      kicker: String(kicker || 'FEATURED CAMPAIGN').trim(),
      title: String(title).trim(),
      titleUr: titleUr ? String(titleUr).trim() : '',
      subtitle: String(subtitle || '').trim(),
      ctaText: String(ctaText || 'Shop Now').trim(),
      targetCategorySlug: String(targetCategorySlug || 'all'),
      imageUrl: String(imageUrl || '/src/assets/images/case_fintech_platform_1791790598093.jpg'),
      active: active !== undefined ? Boolean(active) : true,
    };
    db.banners.push(newBanner);
    saveDatabase(db);
    res.status(201).json({ banner: newBanner });
  });

  app.delete('/api/admin/banners/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.banners.findIndex((b) => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Banner not found.' });
    db.banners.splice(idx, 1);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin: Reviews Moderation
  app.delete('/api/admin/reviews/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.reviews.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Review not found.' });
    db.reviews.splice(idx, 1);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin: Store Settings, Payment Gateways & Policies
  app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    db.settings = {
      ...db.settings,
      ...req.body,
      paymentConfig: {
        ...db.settings.paymentConfig,
        ...(req.body.paymentConfig || {}),
      },
      marketing: {
        ...db.settings.marketing,
        ...(req.body.marketing || {}),
      },
      policies: {
        ...db.settings.policies,
        ...(req.body.policies || {}),
      },
    };
    recordAudit(adminAuth.email, 'SETTINGS_UPDATED', 'Updated store settings, payment config, and policies.');
    saveDatabase(db);
    res.json({ settings: db.settings });
  });

  // Mount Vite or Static Dist
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`CARRY CART Marketplace Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
