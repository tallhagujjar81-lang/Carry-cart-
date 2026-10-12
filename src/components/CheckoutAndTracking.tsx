import React, { useState } from 'react';
import {
  CartItem,
  CityDeliveryConfig,
  StoreSettings,
  Order,
  PaymentMethod,
  Coupon,
  CustomerAccount,
} from '../types.ts';
import { formatPKR, SafeProductImage } from '../utils/formatters.tsx';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Search,
  ArrowLeft,
  MessageCircle,
  Clock,
  PackageCheck,
  Truck,
  ExternalLink,
  Tag,
} from 'lucide-react';

export function buildWhatsAppCartEnquiryUrl(
  baseWhatsappLink: string,
  cart: CartItem[],
  subtotal: number
): string {
  const cleanBase = (baseWhatsappLink || 'https://wa.me/966501701709').split('?')[0];
  const lines = cart.map((item, idx) => {
    const vars =
      Object.keys(item.selectedVariations || {}).length > 0
        ? ` [${Object.entries(item.selectedVariations)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')}]`
        : '';
    return `${idx + 1}. ${item.name} (${item.sku})${vars} — Qty: ${item.quantity} × ${formatPKR(
      item.price
    )} = ${formatPKR(item.price * item.quantity)}`;
  });

  const message = `Assalam-o-Alaikum CARRY CART! I would like to place / inquire about this cart order:\n\n${lines.join(
    '\n'
  )}\n\nCart Subtotal: ${formatPKR(subtotal)}\nPlease assist me with delivery details.`;

  return `${cleanBase}?text=${encodeURIComponent(message)}`;
}

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  settings: StoreSettings;
  onClose: () => void;
  onUpdateQty: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  settings,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const originalSubtotal = cart.reduce(
    (acc, item) => acc + item.originalPrice * item.quantity,
    0
  );
  const discountSavings = Math.max(0, originalSubtotal - subtotal);
  const remainingForFreeShipping = Math.max(
    0,
    settings.freeShippingThreshold - subtotal
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl">
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-neutral-950">
              Your Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-950 cursor-pointer"
            aria-label="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs">
          {remainingForFreeShipping === 0 ? (
            <p className="text-emerald-700 font-semibold">
              Unlocked: Your order qualifies for FREE Nationwide Express Delivery!
            </p>
          ) : (
            <p className="text-neutral-700">
              Add{' '}
              <strong className="font-mono text-neutral-950">
                {formatPKR(remainingForFreeShipping)}
              </strong>{' '}
              more to unlock <strong>FREE Shipping across Pakistan</strong>.
            </p>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-200">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-900">
                Your CARRY CART bag is empty
              </p>
              <p className="text-xs text-neutral-500">
                Explore our 22+ categories and add items to begin checkout.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="py-4 flex gap-3.5">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                  <SafeProductImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-neutral-950 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    SKU: {item.sku}
                  </p>
                  {Object.keys(item.selectedVariations || {}).length > 0 && (
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      {Object.entries(item.selectedVariations)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center border border-neutral-300 rounded">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(idx, item.quantity - 1)}
                        className="p-1 text-neutral-600 hover:text-neutral-950 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-mono font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQty(idx, Math.min(item.maxStock, item.quantity + 1))
                        }
                        className="p-1 text-neutral-600 hover:text-neutral-950 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-950 tabular-nums">
                        {formatPKR(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        className="text-neutral-400 hover:text-red-600 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
            {discountSavings > 0 && (
              <div className="flex items-center justify-between text-xs text-red-600 font-medium">
                <span>Product Discount Savings</span>
                <span className="font-mono tabular-nums">
                  -{formatPKR(discountSavings)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-bold text-neutral-950">
              <span>Subtotal (PKR)</span>
              <span className="font-mono text-base tabular-nums">
                {formatPKR(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Promo coupons and city delivery fees calculated at checkout.
            </p>
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Proceed to Pakistan Checkout
            </button>
            <a
              href={buildWhatsAppCartEnquiryUrl(
                settings.whatsappLink,
                cart,
                subtotal
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-lg border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-900 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Order / Enquire Full Cart via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// CHECKOUT VIEW
// ==========================================

interface CheckoutViewProps {
  cart: CartItem[];
  cities: CityDeliveryConfig[];
  settings: StoreSettings;
  customer?: CustomerAccount | null;
  onBackToStore: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  cities,
  settings,
  customer,
  onBackToStore,
  onOrderSuccess,
}) => {
  const activeCities = cities.filter((c) => c.active);
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [selectedCity, setSelectedCity] = useState(
    customer?.city || activeCities[0]?.city || 'Lahore'
  );
  const [postalCode, setPostalCode] = useState(customer?.postalCode || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [paymentReference, setPaymentReference] = useState('');
  const [authorizedConfirm, setAuthorizedConfirm] = useState(true);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [idempotencyKey] = useState(
    () => `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );

  const cityObj =
    activeCities.find((c) => c.city === selectedCity) || activeCities[0];
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const originalSubtotal = cart.reduce(
    (acc, i) => acc + i.originalPrice * i.quantity,
    0
  );
  const productDiscountTotal = Math.max(0, originalSubtotal - subtotal);
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const deliveryFee =
    discountedSubtotal >= settings.freeShippingThreshold
      ? 0
      : cityObj
      ? cityObj.deliveryFee
      : settings.defaultShippingFee;
  const grandTotal = discountedSubtotal + deliveryFee;

  const handleApplyCoupon = async () => {
    setCouponMessage('');
    if (!couponInput.trim()) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMessage(data.error || 'Invalid coupon code.');
      } else {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount);
        setCouponMessage(
          `Applied ${data.coupon.code}: -${formatPKR(data.discountAmount)}`
        );
      }
    } catch {
      setCouponMessage('Could not verify coupon right now.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg('');

    const cleanedPhone = phone.replace(/[\s\-()]/g, '');
    if (!/^(?:\+92|0092|92|0)?3[0-9]{9}$/.test(cleanedPhone)) {
      setErrorMsg(
        'Please enter a valid 11-digit Pakistani mobile number (e.g., 0300-1234567 or +92 300 1234567).'
      );
      return;
    }

    if (!authorizedConfirm) {
      setErrorMsg('Please confirm your order authorization before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer?.id,
          customerName,
          phone,
          email,
          city: selectedCity,
          postalCode,
          address,
          landmark,
          notes,
          paymentMethod,
          paymentReference,
          couponCode: appliedCoupon?.code,
          items: cart,
          idempotencyKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.error || 'Could not complete order. Please check your details.'
        );
      } else {
        onOrderSuccess(data.order);
      }
    } catch {
      setErrorMsg('Network error while submitting order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const pCfg = settings.paymentConfig;
  const availablePaymentOptions: {
    id: PaymentMethod;
    title: string;
    desc: string;
    enabled: boolean;
  }[] = [
    {
      id: 'COD',
      title: 'Cash on Delivery (COD)',
      desc: 'Pay in cash to the courier upon receiving your parcel at your doorstep.',
      enabled: pCfg?.codEnabled ?? true,
    },
    {
      id: 'Easypaisa',
      title: 'Easypaisa Mobile Wallet',
      desc: `Transfer to ${pCfg?.easypaisaNumber || settings.easypaisaNumber} (${
        pCfg?.easypaisaAccountTitle || 'CARRY CART'
      })`,
      enabled: pCfg?.easypaisaEnabled ?? true,
    },
    {
      id: 'JazzCash',
      title: 'JazzCash Mobile Wallet',
      desc: `Transfer to ${pCfg?.jazzcashNumber || settings.jazzcashNumber} (${
        pCfg?.jazzcashAccountTitle || 'CARRY CART'
      })`,
      enabled: pCfg?.jazzcashEnabled ?? true,
    },
    {
      id: 'Raast',
      title: 'Raast Instant Payment ID',
      desc: `Instant zero-fee transfer via Raast ID: ${
        pCfg?.raastId || 'CARRYCART@MEEZAN'
      }`,
      enabled: pCfg?.raastEnabled ?? true,
    },
    {
      id: 'BankTransfer',
      title: 'Direct Bank IBAN Transfer',
      desc: 'IBFT transfer to Meezan Bank with server-side verification',
      enabled: pCfg?.bankTransferEnabled ?? true,
    },
  ];

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-neutral-950">Your Cart is Empty</h1>
        <button
          onClick={onBackToStore}
          className="px-5 py-2.5 rounded-lg bg-neutral-950 text-white text-xs font-semibold cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBackToStore}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-red-600 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Customer Delivery & Payment Form */}
        <form
          onSubmit={handlePlaceOrder}
          className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-neutral-950">
              Pakistan Express Checkout
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Secure, mobile-friendly checkout. All prices in Pakistani Rupees (PKR).
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Muhammad Usman"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Pakistani Mobile Number (For Courier SMS/Call) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567 or +923001234567"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Delivery City in Pakistan *
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:border-neutral-950"
              >
                {activeCities.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city} — {c.province} ({c.estimatedDays})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Postal Code (Optional)
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g., 54000 / 75500"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:border-neutral-950"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-neutral-800 mb-1.5">
              Email Address (Optional for Order Receipt)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
            />
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-neutral-800 mb-1.5">
              Complete House / Apartment / Street Address *
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House #, Street #, Block / Sector / Phase, Area..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Nearest Famous Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Near Central Mosque / Main Market"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Courier Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Call before arriving"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 pt-2 border-t border-neutral-200">
            <h2 className="text-sm font-bold text-neutral-950">
              Select Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {availablePaymentOptions
                .filter((pm) => pm.enabled)
                .map((pm) => {
                  const selected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                          : 'border-neutral-200 hover:border-neutral-900 bg-white'
                      }`}
                    >
                      <div className="font-bold text-neutral-950">{pm.title}</div>
                      <div className="text-[11px] text-neutral-600 mt-1">
                        {pm.desc}
                      </div>
                    </button>
                  );
                })}
            </div>

            {paymentMethod !== 'COD' && (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <p className="font-semibold text-neutral-900">
                  Manual Payment & Verification Instructions:
                </p>
                <p className="text-neutral-700 font-mono text-[11px]">
                  {paymentMethod === 'BankTransfer'
                    ? pCfg?.bankDetails || settings.bankDetails
                    : paymentMethod === 'Raast'
                    ? `Raast ID: ${pCfg?.raastId || 'CARRYCART@MEEZAN'}`
                    : paymentMethod === 'Easypaisa'
                    ? `Easypaisa: ${pCfg?.easypaisaNumber || settings.easypaisaNumber} (${
                        pCfg?.easypaisaAccountTitle || 'CARRY CART'
                      })`
                    : `JazzCash: ${pCfg?.jazzcashNumber || settings.jazzcashNumber} (${
                        pCfg?.jazzcashAccountTitle || 'CARRY CART'
                      })`}
                </p>
                <p className="text-[11px] text-neutral-500">
                  Note: Online transfer orders are created with status <strong>Pending Verification</strong> and verified by our finance desk before courier dispatch.
                </p>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Transaction Reference / TID Number (Or send screenshot on WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter 11-digit TID / Raast Reference"
                    className="w-full px-3 py-2 rounded border border-neutral-300 bg-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <label className="flex items-start gap-2.5 text-xs text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={authorizedConfirm}
              onChange={(e) => setAuthorizedConfirm(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I explicitly authorize CARRY CART to place this order for{' '}
              <strong className="font-mono text-neutral-950">
                {formatPKR(grandTotal)}
              </strong>{' '}
              via <strong>{paymentMethod}</strong> and agree to the Shipping & Return Policy.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            {submitting
              ? 'Processing & Securing Order...'
              : `Authorize & Place Order — ${formatPKR(grandTotal)}`}
          </button>
        </form>

        {/* Right: Order Summary & Promo Coupon Card */}
        <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-5">
          <h2 className="text-base font-bold text-neutral-950">
            Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
          </h2>

          <div className="divide-y divide-neutral-200 max-h-80 overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded bg-white border border-neutral-200 overflow-hidden shrink-0">
                    <SafeProductImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-neutral-500 font-mono">
                      Qty: {item.quantity} × {formatPKR(item.price)}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-neutral-950 tabular-nums shrink-0">
                  {formatPKR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Discount Coupon Input */}
          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <label className="block text-xs font-semibold text-neutral-800">
              Promotional / Discount Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g., PAKISTAN10 or WELCOME500"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs font-mono uppercase"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 rounded-lg bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p
                className={`text-xs font-medium ${
                  appliedCoupon ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {couponMessage}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-neutral-200 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Items Subtotal</span>
              <span className="font-mono tabular-nums">{formatPKR(subtotal)}</span>
            </div>
            {productDiscountTotal > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Sale Price Savings</span>
                <span className="font-mono tabular-nums">
                  -{formatPKR(productDiscountTotal)}
                </span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span className="font-mono tabular-nums">
                  -{formatPKR(couponDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Courier Delivery ({selectedCity})</span>
              <span className="font-mono tabular-nums font-semibold text-neutral-900">
                {deliveryFee === 0 ? 'FREE' : formatPKR(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-neutral-950 pt-3 border-t border-neutral-200">
              <span>Total Payable (PKR)</span>
              <span className="font-mono tabular-nums text-red-600">
                {formatPKR(grandTotal)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-neutral-200 space-y-2 text-[11px] text-neutral-600">
            <div className="flex items-center gap-2 font-semibold text-neutral-900">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              <span>CARRY CART Buyer Protection</span>
            </div>
            <p>
              Every parcel is sealed with tamper-evident packaging and backed by our 7-Day Easy Return & Exchange guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ORDER CONFIRMATION & DETAILED STATUS HISTORY TIMELINE
// ==========================================

interface OrderTrackingProps {
  initialOrder: Order | null;
  settings: StoreSettings;
  onContinueShopping: () => void;
}

const CORE_TIMELINE_STATES = [
  {
    key: 'Pending',
    label: 'Pending',
    matchStatuses: ['Pending', 'Order Placed', 'Pending Verification', 'Payment Pending', 'Confirmed'],
    desc: 'Order received and verified',
  },
  {
    key: 'Processing',
    label: 'Processing',
    matchStatuses: ['Processing', 'Payment Confirmed'],
    desc: 'Quality check & protective packing',
  },
  {
    key: 'Shipped',
    label: 'Shipped',
    matchStatuses: ['Shipped', 'Out for Delivery'],
    desc: 'Dispatched with courier partner',
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    matchStatuses: ['Delivered'],
    desc: 'Handed over at customer address',
  },
];

function getStageRank(status: string): number {
  const s = status.toLowerCase();
  if (s.includes('deliver') && !s.includes('out')) return 3;
  if (s.includes('ship') || s.includes('out for delivery')) return 2;
  if (s.includes('process') || s.includes('payment confirmed')) return 1;
  return 0;
}

function formatTimelineTimestamp(iso?: string): string {
  if (!iso) return 'Pending update';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-PK', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const OrderTrackingView: React.FC<OrderTrackingProps> = ({
  initialOrder,
  settings,
  onContinueShopping,
}) => {
  const [searchQuery, setSearchQuery] = useState(
    initialOrder ? initialOrder.orderNumber : 'CC-849201'
  );
  const [orders, setOrders] = useState<Order[]>(
    initialOrder ? [initialOrder] : []
  );
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  React.useEffect(() => {
    if (!initialOrder && orders.length === 0) {
      fetch('/api/orders/track?q=CC-849201')
        .then((r) => r.json())
        .then((data) => {
          if (data.orders && data.orders.length > 0) {
            setOrders(data.orders);
          }
        })
        .catch(() => {});
    }
  }, [initialOrder]);

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const res = await fetch(
        `/api/orders/track?q=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || 'Could not look up order.');
      } else if (!data.orders || data.orders.length === 0) {
        setOrders([]);
        setSearchError(
          `No orders found matching "${searchQuery}". Try demo order CC-849201, CC-849202, or phone 03001234567.`
        );
      } else {
        setOrders(data.orders);
      }
    } catch {
      setSearchError('Error connecting to order tracking service.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {initialOrder && (
        <div className="bg-neutral-950 text-white rounded-xl p-6 sm:p-8 space-y-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-mono text-red-400 uppercase tracking-wider">
                ORDER CONFIRMED & DISPATCH QUEUED
              </span>
              <h1 className="text-2xl font-bold text-white">
                Thank You, {initialOrder.customerName}!
              </h1>
            </div>
          </div>
          <p className="text-sm text-neutral-300">
            Your unique order number is{' '}
            <strong className="font-mono text-white bg-neutral-800 px-2 py-0.5 rounded">
              {initialOrder.orderNumber}
            </strong>
            . Save this number to track your shipment status and timestamp history at any time.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`${settings.whatsappLink.split('?')[0]}?text=${encodeURIComponent(
                `Assalam-o-Alaikum CARRY CART! Please confirm my new Order ${
                  initialOrder.orderNumber
                } (${formatPKR(initialOrder.total)} via ${
                  initialOrder.paymentMethod
                }) for delivery to ${initialOrder.city}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Send Order Receipt on WhatsApp ({settings.whatsappNumber})
            </a>
            <button
              onClick={onContinueShopping}
              className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Search Order by Order Number or Phone */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-neutral-950">
              Track Order & Detailed Status History Timeline
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Enter your Order Number (e.g., <code className="font-mono">CC-849201</code> or <code className="font-mono">CC-849202</code>) or Pakistani Mobile Number (<code className="font-mono">03001234567</code>).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSearchQuery('CC-849201')}
              className="px-2.5 py-1 rounded border border-neutral-200 hover:border-neutral-900 font-mono cursor-pointer"
            >
              Demo #1 (Delivered)
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery('CC-849202')}
              className="px-2.5 py-1 rounded border border-neutral-200 hover:border-neutral-900 font-mono cursor-pointer"
            >
              Demo #2 (Shipped)
            </button>
          </div>
        </div>

        <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Order # (CC-849201) or Mobile Number (03001234567)"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:border-neutral-950"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 rounded-lg bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            {searching ? 'Searching...' : 'Track Shipment'}
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-red-600 font-medium">{searchError}</p>
        )}
      </div>

      {/* Matching Orders List with 4-Stage Timestamped Timeline + Detailed Audit Trail */}
      <div className="space-y-6">
        {orders.map((ord) => {
          const currentRank = getStageRank(ord.status);
          const historyList = Array.isArray(ord.statusHistory) ? ord.statusHistory : [];

          return (
            <div
              key={ord.id}
              className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-8"
            >
              {/* Order Header Summary */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xl font-bold text-neutral-950">
                      Order {ord.orderNumber}
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs font-semibold text-red-600">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Customer: <strong>{ord.customerName}</strong> ({ord.phone}) —{' '}
                    {ord.address}, {ord.city}, {ord.province}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-mono text-base font-bold text-neutral-950 tabular-nums">
                    {formatPKR(ord.total)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Payment: {ord.paymentMethod} ({ord.paymentStatus || 'COD Pending'})
                  </div>
                </div>
              </div>

              {/* 4-Stage Milestone Status Timeline ('Pending', 'Processing', 'Shipped', 'Delivered') with Timestamps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>Shipment Milestone Timeline & Timestamps</span>
                  </h3>
                  {ord.trackingNumber && (
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-700">
                      <span>
                        {ord.courierName || 'Courier'}:{' '}
                        <strong>{ord.trackingNumber}</strong>
                      </span>
                      {ord.trackingUrl && (
                        <a
                          href={ord.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-red-600 hover:underline font-sans font-semibold"
                        >
                          <span>Verify Courier Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {CORE_TIMELINE_STATES.map((stage, idx) => {
                    const isCompleted = idx <= currentRank && ord.status !== 'Cancelled';
                    const isCurrent = idx === currentRank && ord.status !== 'Cancelled';

                    // Find matching history entry timestamp for this milestone
                    const matchingEntry = historyList.find(
                      (h) =>
                        stage.matchStatuses.some(
                          (ms) => ms.toLowerCase() === h.status.toLowerCase()
                        ) || h.status.toLowerCase().includes(stage.key.toLowerCase())
                    );

                    const timestampStr = matchingEntry
                      ? formatTimelineTimestamp(matchingEntry.timestamp)
                      : idx === 0
                      ? formatTimelineTimestamp(ord.createdAt)
                      : isCompleted
                      ? formatTimelineTimestamp(ord.updatedAt)
                      : 'Awaiting milestone';

                    return (
                      <div
                        key={stage.key}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                          isCompleted
                            ? 'bg-neutral-950 text-white border-neutral-950'
                            : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className={isCompleted ? 'text-red-500 font-bold' : ''}>
                              0{idx + 1} · {stage.label.toUpperCase()}
                            </span>
                            {isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              isCompleted ? 'text-white' : 'text-neutral-700'
                            }`}
                          >
                            {stage.label}
                          </div>
                          <p
                            className={`text-[11px] leading-snug ${
                              isCompleted ? 'text-neutral-300' : 'text-neutral-500'
                            }`}
                          >
                            {matchingEntry?.note || stage.desc}
                          </p>
                        </div>

                        <div
                          className={`pt-2.5 border-t text-[11px] font-mono tabular-nums ${
                            isCompleted
                              ? 'border-neutral-800 text-neutral-300'
                              : 'border-neutral-200 text-neutral-400'
                          }`}
                        >
                          {isCurrent ? 'Latest · ' : ''}
                          {timestampStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chronological Status History Log */}
              {historyList.length > 0 && (
                <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Detailed Status History Log
                  </h4>
                  <div className="space-y-3">
                    {historyList.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-neutral-200/70 last:border-b-0 pb-2.5 last:pb-0"
                      >
                        <div className="flex items-start gap-2.5">
                          <PackageCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-neutral-950">
                              {entry.status}
                            </span>
                            <span className="text-neutral-400 mx-1.5">—</span>
                            <span className="text-neutral-700">{entry.note}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-neutral-500 tabular-nums shrink-0">
                          {formatTimelineTimestamp(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Ordered Items
                </h4>
                <div className="divide-y divide-neutral-100 text-xs border border-neutral-200 rounded-xl px-4">
                  {ord.items.map((item, i) => (
                    <div key={i} className="py-3 flex justify-between items-center">
                      <div>
                        <strong className="font-mono">{item.quantity}x</strong>{' '}
                        <span className="font-semibold text-neutral-900">
                          {item.name}
                        </span>{' '}
                        <span className="text-neutral-400 font-mono">
                          ({item.sku})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-neutral-950 tabular-nums">
                        {formatPKR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
