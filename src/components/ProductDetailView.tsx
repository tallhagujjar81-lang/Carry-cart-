import React, { useState, useEffect } from 'react';
import {
  Product,
  Category,
  ProductReview,
  CityDeliveryConfig,
  StoreSettings,
} from '../types.ts';
import {
  formatPKR,
  getEffectivePrice,
  getDiscountPercentage,
  buildWhatsAppInquiryUrl,
  SafeProductImage,
} from '../utils/formatters.tsx';
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  Check,
  Minus,
  Plus,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  category?: Category;
  allProducts: Product[];
  reviews: ProductReview[];
  cities: CityDeliveryConfig[];
  settings: StoreSettings;
  isWishlisted: boolean;
  lang: 'en' | 'ur';
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariations: Record<string, string>
  ) => void;
  onBuyNow: (
    product: Product,
    quantity: number,
    selectedVariations: Record<string, string>
  ) => void;
  onToggleWishlist: (productId: string) => void;
  onReviewSubmitted: () => Promise<void>;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  category,
  allProducts,
  reviews,
  cities,
  settings,
  isWishlisted,
  lang,
  onBack,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onReviewSubmitted,
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [selectedCity, setSelectedCity] = useState<string>('Lahore');
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Review Form State
  const [revName, setRevName] = useState('');
  const [revCity, setRevCity] = useState('Karachi');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revSuccess, setRevSuccess] = useState(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setQuantity(1);
    const initialVars: Record<string, string> = {};
    product.variations.forEach((v) => {
      if (v.values.length > 0) {
        initialVars[v.label] = v.values[0];
      }
    });
    setSelectedVariations(initialVars);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const effectivePrice = getEffectivePrice(product);
  const discountPct = getDiscountPercentage(product);
  const activeCityConfig =
    cities.find((c) => c.city === selectedCity && c.active) || cities[0];
  const qualifiesForFreeShipping =
    effectivePrice * quantity >= settings.freeShippingThreshold;

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 3);

  const handleAddClick = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, quantity, selectedVariations);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;
    setRevSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: revName,
          city: revCity,
          rating: revRating,
          comment: revComment,
        }),
      });
      if (res.ok) {
        setRevName('');
        setRevComment('');
        setRevSuccess(true);
        await onReviewSubmitted();
        setTimeout(() => setRevSuccess(false), 4000);
      }
    } finally {
      setRevSubmitting(false);
    }
  };

  const whatsappInquiryHref = buildWhatsAppInquiryUrl(
    settings.whatsappLink,
    product,
    selectedVariations
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-red-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>CARRY CART</span>
          <span>/</span>
          <span>{category?.name || 'Marketplace'}</span>
          <span>/</span>
          <span className="text-neutral-900 font-medium truncate max-w-[220px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Contiguous Purchase Module (Sticky Gallery Left, Sticky Purchase Module Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Image Gallery */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
            <SafeProductImage
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.name}
              itemTitle={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`aspect-[4/3] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    selectedImageIdx === idx
                      ? 'border-red-600 ring-2 ring-red-600/20'
                      : 'border-neutral-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeProductImage
                    src={imgUrl}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-900 uppercase tracking-wider">
              {product.brand}
            </span>
            <span>·</span>
            <span className="font-mono">SKU: {product.sku}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-neutral-800 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              {lang === 'ur' && product.nameUr ? product.nameUr : product.name}
            </h1>
            {product.nameUr && lang === 'en' && (
              <p className="text-sm text-neutral-500 mt-1">{product.nameUr}</p>
            )}
          </div>

          {/* Pricing Block in PKR */}
          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-950 font-mono tabular-nums">
                {formatPKR(effectivePrice)}
              </span>
              {discountPct > 0 && (
                <>
                  <span className="text-sm text-neutral-400 line-through font-mono tabular-nums">
                    {formatPKR(product.price)}
                  </span>
                  <span className="text-xs font-mono font-semibold text-red-600">
                    Save {discountPct}% ({formatPKR(product.price - effectivePrice)})
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span>
                Availability:{' '}
                {product.stock > 0 ? (
                  <strong className="text-emerald-700 font-mono">
                    In Stock ({product.stock} units ready to ship)
                  </strong>
                ) : (
                  <strong className="text-red-600">Out of Stock</strong>
                )}
              </span>
              <span className="text-neutral-500">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Product Variations Selector */}
          {product.variations.length > 0 && (
            <div className="space-y-4">
              {product.variations.map((variation) => (
                <div key={variation.label}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-neutral-900">
                      {variation.label}:
                    </span>
                    <span className="text-neutral-600 font-medium">
                      {selectedVariations[variation.label]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variation.values.map((val) => {
                      const active = selectedVariations[variation.label] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSelectedVariations((prev) => ({
                              ...prev,
                              [variation.label]: val,
                            }))
                          }
                          className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                            active
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Primary Purchase Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-neutral-600 hover:text-neutral-950 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-mono font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))
                  }
                  className="p-2.5 text-neutral-600 hover:text-neutral-950 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAddClick}
                className="flex-1 py-3 px-5 rounded-lg bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>

              {/* Wishlist Toggle */}
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'border-red-600 bg-red-50 text-red-600'
                    : 'border-neutral-300 hover:border-neutral-900 text-neutral-700'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600' : ''}`} />
              </button>
            </div>

            {/* Buy Now (Direct Express Checkout) */}
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => onBuyNow(product, quantity, selectedVariations)}
              className="w-full py-3 px-5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Buy Now with Cash on Delivery — {formatPKR(effectivePrice * quantity)}
            </button>

            {/* WhatsApp Product Inquiry Button */}
            <a
              href={whatsappInquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-lg border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-900 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Inquire on WhatsApp ({settings.whatsappNumber})
            </a>
          </div>

          {/* Pakistan City Delivery Estimator */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-red-600" />
                Pakistan Delivery Estimator
              </span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-2.5 py-1 rounded border border-neutral-300 text-xs font-medium bg-white"
              >
                {cities
                  .filter((c) => c.active)
                  .map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} ({c.province})
                    </option>
                  ))}
              </select>
            </div>

            {activeCityConfig && (
              <div className="text-neutral-600 space-y-1 pt-1 border-t border-neutral-100">
                <p>
                  Estimated Arrival in <strong>{activeCityConfig.city}</strong>:{' '}
                  <span className="font-semibold text-neutral-900">
                    {activeCityConfig.estimatedDays}
                  </span>
                </p>
                <p>
                  Courier Charge:{' '}
                  {qualifiesForFreeShipping ? (
                    <span className="font-semibold text-emerald-700">
                      FREE (Order exceeds {formatPKR(settings.freeShippingThreshold)})
                    </span>
                  ) : (
                    <span className="font-mono font-semibold text-neutral-900">
                      {formatPKR(activeCityConfig.deliveryFee)} (Free above{' '}
                      {formatPKR(settings.freeShippingThreshold)})
                    </span>
                  )}
                </p>
                <p>
                  Cash on Delivery (COD):{' '}
                  <span className="font-semibold text-neutral-900">
                    {activeCityConfig.codAvailable ? 'Available' : 'Prepaid Only'}
                  </span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                <span>7-Day Easy Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-neutral-200">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-neutral-950">
            Product Overview & Craftsmanship
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-bold text-neutral-950">
            Technical Specifications
          </h2>
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <tbody className="divide-y divide-neutral-200">
                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <tr key={key}>
                    <th className="py-3 px-4 bg-neutral-50 font-semibold text-neutral-700 w-2/5">
                      {key}
                    </th>
                    <td className="py-3 px-4 text-neutral-900 font-medium">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Submit Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-neutral-200">
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-950">
              Verified Customer Reviews ({productReviews.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Real feedback from verified buyers across Pakistan.
            </p>
          </div>

          {productReviews.length === 0 ? (
            <div className="p-6 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-600">
              No reviews yet for this product. Be the first verified customer to share your experience!
            </div>
          ) : (
            <div className="space-y-4">
              {productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-xl border border-neutral-200 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-950">
                        {rev.customerName}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-600">{rev.city}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-emerald-700 font-medium">
                        Verified COD Buyer
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    “{rev.comment}”
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <form
            onSubmit={handleReviewSubmit}
            className="p-6 rounded-xl border border-neutral-200 bg-neutral-50 space-y-4"
          >
            <h3 className="text-base font-bold text-neutral-950">
              Write a Customer Review
            </h3>
            {revSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950 text-emerald-200 text-xs font-medium">
                Thank you! Your review has been published.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="e.g., Bilal Ahmed"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Your City in Pakistan
                </label>
                <select
                  value={revCity}
                  onChange={(e) => setRevCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                >
                  {cities.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-medium text-neutral-700 mb-1">
                Rating
              </label>
              <select
                value={revRating}
                onChange={(e) => setRevRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white font-medium"
              >
                <option value={5}>5 Stars — Excellent Quality</option>
                <option value={4}>4 Stars — Very Good</option>
                <option value={3}>3 Stars — Satisfactory</option>
                <option value={2}>2 Stars — Subpar</option>
                <option value={1}>1 Star — Poor</option>
              </select>
            </div>

            <div className="text-xs">
              <label className="block font-medium text-neutral-700 mb-1">
                Your Experience *
              </label>
              <textarea
                rows={3}
                required
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                placeholder="Share how the product quality and delivery speed were..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={revSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {revSubmitting ? 'Submitting...' : 'Submit Verified Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-neutral-200 space-y-6">
          <h2 className="text-xl font-bold text-neutral-950">
            Related Products in {category?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => {
              const relPrice = getEffectivePrice(rel);
              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel)}
                  className="group border border-neutral-200 rounded-xl overflow-hidden bg-white hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <SafeProductImage
                      src={rel.images[0]}
                      alt={rel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-neutral-500">
                        {rel.brand}
                      </span>
                      <h3 className="text-base font-semibold text-neutral-950 mt-1 line-clamp-1 group-hover:text-red-600 transition-colors">
                        {rel.name}
                      </h3>
                    </div>
                    <div className="font-mono text-sm font-bold text-neutral-950 tabular-nums">
                      {formatPKR(relPrice)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
