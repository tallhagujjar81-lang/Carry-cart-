import React, { useState, useEffect, useMemo } from 'react';
import {
  Category,
  Product,
  ProductReview,
  HeroBanner,
  CityDeliveryConfig,
  StoreSettings,
  CartItem,
  Order,
  CustomerAccount,
} from './types.ts';
import { INITIAL_DATABASE } from './seedData.ts';
import {
  formatPKR,
  getEffectivePrice,
  getDiscountPercentage,
  buildWhatsAppInquiryUrl,
  SafeProductImage,
} from './utils/formatters.tsx';
import { ProductDetailView } from './components/ProductDetailView.tsx';
import {
  CartDrawer,
  CheckoutView,
  OrderTrackingView,
} from './components/CheckoutAndTracking.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { SupportAndPoliciesView } from './components/SupportAndPolicies.tsx';
import { CustomerAccountView } from './components/CustomerAccountView.tsx';
import {
  Search,
  ShoppingBag,
  Heart,
  Star,
  MessageCircle,
  ArrowRight,
  SlidersHorizontal,
  Check,
  Globe,
  User,
} from 'lucide-react';

type ActiveView =
  | 'home'
  | 'product-detail'
  | 'checkout'
  | 'track-order'
  | 'support'
  | 'wishlist'
  | 'account'
  | 'admin'
  | 'not-found';

type CollectionFilter =
  | 'all'
  | 'trending'
  | 'bestsellers'
  | 'new-arrivals'
  | 'flash-sale'
  | 'recommended'
  | 'recently-viewed';

export default function App() {
  // Storefront Live Database State
  const [categories, setCategories] = useState<Category[]>(
    INITIAL_DATABASE.categories
  );
  const [products, setProducts] = useState<Product[]>(INITIAL_DATABASE.products);
  const [reviews, setReviews] = useState<ProductReview[]>(
    INITIAL_DATABASE.reviews
  );
  const [banners, setBanners] = useState<HeroBanner[]>(INITIAL_DATABASE.banners);
  const [cities, setCities] = useState<CityDeliveryConfig[]>(
    INITIAL_DATABASE.cities
  );
  const [settings, setSettings] = useState<StoreSettings>(
    INITIAL_DATABASE.settings
  );
  const [loadingStore, setLoadingStore] = useState(true);

  // Navigation & UI State
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  // Customer Account Session
  const [customerToken, setCustomerToken] = useState<string | null>(() =>
    localStorage.getItem('carry_cart_customer_token')
  );
  const [customer, setCustomer] = useState<CustomerAccount | null>(() => {
    try {
      const raw = localStorage.getItem('carry_cart_customer_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // Filtering, Search & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [collectionTab, setCollectionTab] = useState<CollectionFilter>('all');
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
  >('featured');
  const [showAllCategoriesGrid, setShowAllCategoriesGrid] = useState(false);

  // Cart, Wishlist & Recently Viewed (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('carry_cart_bag');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('carry_cart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('carry_cart_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(
    null
  );

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  // Card Quick-Add Feedback
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  const fetchStoreData = async () => {
    try {
      const res = await fetch('/api/store');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || INITIAL_DATABASE.categories);
        setProducts(data.products || INITIAL_DATABASE.products);
        setReviews(data.reviews || INITIAL_DATABASE.reviews);
        setBanners(
          data.banners && data.banners.length > 0
            ? data.banners
            : INITIAL_DATABASE.banners
        );
        setCities(data.cities || INITIAL_DATABASE.cities);
        setSettings(data.settings || INITIAL_DATABASE.settings);
      }
    } catch (e) {
      console.error('Using initial fallback store data:', e);
    } finally {
      setLoadingStore(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  // Support deep linking via ?product=slug
  useEffect(() => {
    if (products.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const slugParam = params.get('product');
      if (slugParam) {
        const match = products.find((p) => p.slug === slugParam);
        if (match) {
          setSelectedProduct(match);
          setActiveView('product-detail');
        } else {
          setActiveView('not-found');
        }
      }
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('carry_cart_bag', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('carry_cart_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'carry_cart_recent',
        JSON.stringify(recentlyViewedIds)
      );
    } catch {}
  }, [recentlyViewedIds]);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowSearchSuggestions(false);
    setRecentlyViewedIds((prev) =>
      [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 8)
    );
    setActiveView('product-detail');
  };

  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedVariations?: Record<string, string>
  ) => {
    if (product.stock <= 0) return;
    const defaultVars: Record<string, string> = {};
    product.variations.forEach((v) => {
      if (v.values.length > 0) defaultVars[v.label] = v.values[0];
    });
    const finalVars = selectedVariations || defaultVars;
    const effectivePrice = getEffectivePrice(product);

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          JSON.stringify(item.selectedVariations) === JSON.stringify(finalVars)
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity = Math.min(
          product.stock,
          next[existingIdx].quantity + quantity
        );
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: effectivePrice,
          originalPrice: product.price,
          quantity: Math.min(product.stock, quantity),
          image: product.images[0] || '',
          selectedVariations: finalVars,
          maxStock: product.stock,
        },
      ];
    });
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    handleAddToCart(product, 1);
    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 1500);
  };

  const handleBuyNow = (
    product: Product,
    quantity: number,
    selectedVariations: Record<string, string>
  ) => {
    handleAddToCart(product, quantity, selectedVariations);
    setIsCartOpen(false);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCartQty = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(idx);
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newsletterEmail, consent: true }),
    });
    setNewsletterEmail('');
    setNewsletterDone(true);
    setTimeout(() => setNewsletterDone(false), 4000);
  };

  // Instant Search Autocomplete Suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [products, searchQuery]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) {
          return false;
        }
        if (
          selectedSubcategory !== 'all' &&
          p.subcategory !== selectedSubcategory
        ) {
          return false;
        }
        if (inStockOnly && p.stock <= 0) return false;
        if (collectionTab === 'trending' && !p.isTrending) return false;
        if (collectionTab === 'bestsellers' && !p.isBestSeller) return false;
        if (collectionTab === 'new-arrivals' && !p.isNewArrival) return false;
        if (collectionTab === 'flash-sale' && !p.isFlashSale) return false;
        if (collectionTab === 'recommended' && !p.isRecommended) return false;
        if (
          collectionTab === 'recently-viewed' &&
          !recentlyViewedIds.includes(p.id)
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchSub = p.subcategory.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchSku && !matchSub) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = getEffectivePrice(a);
        const priceB = getEffectivePrice(b);
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return 0;
      });
  }, [
    products,
    selectedCategoryId,
    selectedSubcategory,
    inStockOnly,
    collectionTab,
    searchQuery,
    sortBy,
    recentlyViewedIds,
  ]);

  const activeCategoryObj = categories.find(
    (c) => c.id === selectedCategoryId
  );
  const currentBanner = banners[activeBannerIdx] || banners[0];
  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (activeView === 'admin') {
    return (
      <AdminDashboard
        onBackToStore={() => setActiveView('home')}
        onStoreUpdated={fetchStoreData}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-950">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setSelectedCategoryId('all');
              setSelectedSubcategory('all');
              setCollectionTab('all');
              setActiveView('home');
            }}
            className="text-xl font-bold tracking-tight text-neutral-950 font-display whitespace-nowrap shrink-0"
          >
            CARRY<span className="text-red-600">CART</span>
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <button
              onClick={() => {
                setSelectedCategoryId('all');
                setCollectionTab('all');
                setActiveView('home');
              }}
              className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'ur' ? 'تمام مصنوعات' : 'Shop All'}
            </button>
            <button
              onClick={() => {
                setSelectedCategoryId('all');
                setCollectionTab('flash-sale');
                setActiveView('home');
              }}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'ur' ? 'فلیش سیلز' : 'Flash Deals'}
            </button>
            <button
              onClick={() => setActiveView('track-order')}
              className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'ur' ? 'آرڈر ٹریک کریں' : 'Track Order'}
            </button>
            <button
              onClick={() => setActiveView('support')}
              className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'ur' ? 'کسٹمر سپورٹ' : 'Support & FAQ'}
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'ur' ? 'ایڈمن پینل' : 'Admin Portal'}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-950 hover:bg-red-600 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {lang === 'ur' ? 'شاپنگ بیگ' : 'Shopping Bag'} ({totalCartItems})
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE UTILITY TOOLBAR (Search with Instant Autocomplete, Customer Account, Wishlist, Language) */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search Input with Instant Product Suggestions */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 180)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchSuggestions(true);
                if (activeView !== 'home') setActiveView('home');
              }}
              placeholder={
                lang === 'ur'
                  ? 'مصنوعات، برانڈز یا SKU تلاش کریں...'
                  : 'Search across 22+ categories, brands, or SKU in Pakistan...'
              }
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-neutral-300 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-950"
            />

            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-30 divide-y divide-neutral-100 overflow-hidden">
                {searchSuggestions.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onMouseDown={() => handleOpenProduct(sug)}
                    className="w-full p-3 flex items-center justify-between gap-3 hover:bg-neutral-50 text-left text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                        <SafeProductImage
                          src={sug.images[0]}
                          alt={sug.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-950 truncate">
                          {sug.name}
                        </div>
                        <div className="text-neutral-500 font-mono text-[11px]">
                          {sug.brand} · {sug.sku}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-red-600 shrink-0">
                      {formatPKR(getEffectivePrice(sug))}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Utility Controls */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveView('account')}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:border-neutral-950 text-neutral-800 font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-neutral-700" />
              <span>{customer ? customer.name.split(' ')[0] : 'Account'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('wishlist')}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:border-neutral-950 text-neutral-800 font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-red-600" />
              <span>Saved ({wishlist.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setLang((l) => (l === 'en' ? 'ur' : 'en'))}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:border-neutral-950 text-neutral-800 font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'اردو / EN' : 'English / اردو'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('track-order')}
              className="md:hidden px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-800 font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              Track Order
            </button>

            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className="md:hidden px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT ROUTER */}
      <main className="flex-1">
        {activeView === 'not-found' && (
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
            <span className="text-xs font-mono text-red-600">ERROR 404</span>
            <h1 className="text-3xl font-bold text-neutral-950">
              Page or Product Not Found
            </h1>
            <p className="text-sm text-neutral-600">
              The requested item may have been moved or unpublished by the store administrator.
            </p>
            <button
              onClick={() => {
                window.history.replaceState({}, '', '/');
                setActiveView('home');
              }}
              className="px-5 py-2.5 rounded-lg bg-neutral-950 text-white text-xs font-semibold cursor-pointer"
            >
              Return to CARRY CART Storefront
            </button>
          </div>
        )}

        {activeView === 'account' && (
          <CustomerAccountView
            customer={customer}
            customerToken={customerToken}
            customerOrders={customerOrders}
            cities={cities}
            onAuthSuccess={(token, profile, orders) => {
              setCustomerToken(token);
              setCustomer(profile);
              setCustomerOrders(orders);
              localStorage.setItem('carry_cart_customer_token', token);
              localStorage.setItem(
                'carry_cart_customer_profile',
                JSON.stringify(profile)
              );
            }}
            onLogout={() => {
              setCustomerToken(null);
              setCustomer(null);
              setCustomerOrders([]);
              localStorage.removeItem('carry_cart_customer_token');
              localStorage.removeItem('carry_cart_customer_profile');
            }}
            onProfileUpdate={(updated) => {
              setCustomer(updated);
              localStorage.setItem(
                'carry_cart_customer_profile',
                JSON.stringify(updated)
              );
            }}
            onTrackOrder={(ord) => {
              setLastConfirmedOrder(ord);
              setActiveView('track-order');
            }}
            onBackToStore={() => setActiveView('home')}
          />
        )}

        {activeView === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            category={categories.find(
              (c) => c.id === selectedProduct.categoryId
            )}
            allProducts={products}
            reviews={reviews}
            cities={cities}
            settings={settings}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            lang={lang}
            onBack={() => setActiveView('home')}
            onSelectProduct={handleOpenProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            onReviewSubmitted={fetchStoreData}
          />
        )}

        {activeView === 'checkout' && (
          <CheckoutView
            cart={cart}
            cities={cities}
            settings={settings}
            customer={customer}
            onBackToStore={() => setActiveView('home')}
            onOrderSuccess={(newOrder) => {
              setCart([]);
              setLastConfirmedOrder(newOrder);
              if (customer) {
                setCustomerOrders((prev) => [newOrder, ...prev]);
              }
              fetchStoreData();
              setActiveView('track-order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'track-order' && (
          <OrderTrackingView
            initialOrder={lastConfirmedOrder}
            settings={settings}
            onContinueShopping={() => {
              setLastConfirmedOrder(null);
              setActiveView('home');
            }}
          />
        )}

        {activeView === 'support' && (
          <SupportAndPoliciesView
            settings={settings}
            cities={cities}
            onBackToStore={() => setActiveView('home')}
          />
        )}

        {activeView === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-950">
                  Saved Wishlist Items ({wishlist.length})
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Products you have bookmarked for quick purchase in PKR.
                </p>
              </div>
              <button
                onClick={() => setActiveView('home')}
                className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-xs font-semibold cursor-pointer"
              >
                Back to Catalog
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <Heart className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-sm font-semibold text-neutral-900">
                  No saved items in your wishlist yet
                </p>
                <button
                  onClick={() => setActiveView('home')}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Explore Marketplace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => wishlist.includes(p.id))
                  .map((product) => {
                    const effectivePrice = getEffectivePrice(product);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleOpenProduct(product)}
                        className="border border-neutral-200 rounded-xl overflow-hidden bg-white hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col"
                      >
                        <div className="aspect-[4/3] bg-neutral-100">
                          <SafeProductImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-xs uppercase text-neutral-500">
                              {product.brand}
                            </span>
                            <h3 className="text-base font-semibold text-neutral-950 mt-1">
                              {product.name}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="font-mono text-sm font-bold text-neutral-950">
                              {formatPKR(effectivePrice)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(e, product)}
                              className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer"
                            >
                              Add to Bag
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* STOREFRONT HOMEPAGE VIEW */}
        {activeView === 'home' && (
          <div className="space-y-16 pb-16">
            {/* SECTION 1: STOREFRONT HERO SHOWCASE */}
            {currentBanner && (
              <section className="bg-neutral-950 text-white border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="text-xs font-mono text-red-500 tracking-wider uppercase">
                          {currentBanner.kicker}
                        </div>
                        <h1
                          className="font-display font-bold tracking-tight text-white leading-[1.12]"
                          style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}
                        >
                          {lang === 'ur' && currentBanner.titleUr
                            ? currentBanner.titleUr
                            : currentBanner.title}
                        </h1>
                        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                          {currentBanner.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (currentBanner.targetCategorySlug !== 'all') {
                              const targetCat = categories.find(
                                (c) =>
                                  c.slug === currentBanner.targetCategorySlug
                              );
                              if (targetCat) setSelectedCategoryId(targetCat.id);
                            }
                            const el = document.getElementById(
                              'catalog-anchor'
                            );
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 py-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>{currentBanner.ctaText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {banners.length > 1 && (
                          <div className="flex items-center gap-2">
                            {banners.map((b, idx) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setActiveBannerIdx(idx)}
                                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                                  activeBannerIdx === idx
                                    ? 'bg-white text-neutral-950 font-bold'
                                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                }`}
                              >
                                0{idx + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-5">
                      <div className="aspect-[16/10] lg:h-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
                        <SafeProductImage
                          src={currentBanner.imageUrl}
                          alt={currentBanner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full-Width Trust & Operations Strip Below Split Hero */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10 pt-8 border-t border-neutral-800/80 text-xs">
                    <div>
                      <span className="font-mono text-red-500 font-semibold">
                        01. NATIONWIDE COD
                      </span>
                      <p className="text-neutral-300 mt-1">
                        Cash on Delivery across Karachi, Lahore, Islamabad & 20+ cities
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-red-500 font-semibold">
                        02. TRANSPARENT PKR PRICING
                      </span>
                      <p className="text-neutral-300 mt-1">
                        Free insured courier shipping on orders above{' '}
                        {formatPKR(settings.freeShippingThreshold)}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-red-500 font-semibold">
                        03. 7-DAY EASY RETURNS
                      </span>
                      <p className="text-neutral-300 mt-1">
                        Hassle-free inspection, size exchange, and fast refund guarantee
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-red-500 font-semibold">
                        04. DIRECT WHATSAPP DESK
                      </span>
                      <p className="text-neutral-300 mt-1">
                        Instant support & product inquiries at {settings.whatsappNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: SHOP BY CATEGORY DIRECTORY & FILTERABLE PRODUCT CATALOG */}
            <section
              id="catalog-anchor"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
            >
              {/* Dynamic 22-Category Interactive Selector */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
                      {lang === 'ur'
                        ? 'کیٹیگری کے مطابق خریداری کریں'
                        : 'Shop by Department & Category'}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Select any department below or open the Mega Menu to browse all {categories.length} dynamic marketplace categories.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllCategoriesGrid((v) => !v)}
                    className="text-xs font-semibold text-red-600 hover:text-neutral-950 underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {showAllCategoriesGrid
                      ? 'Close Category Mega Menu'
                      : `Open Mega Menu (${categories.length} Categories)`}
                  </button>
                </div>

                {/* Horizontal Category Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId('all');
                      setSelectedSubcategory('all');
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategoryId === 'all'
                        ? 'bg-neutral-950 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    All Departments ({products.length})
                  </button>

                  {categories.map((cat) => {
                    const active = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setSelectedSubcategory('all');
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-red-600 text-white font-semibold'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {lang === 'ur' ? cat.nameUr : cat.name}
                      </button>
                    );
                  })}
                </div>

                {/* Expanded 22-Category Mega Menu Grid */}
                {showAllCategoriesGrid && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {categories.map((cat, idx) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setSelectedSubcategory('all');
                          setShowAllCategoriesGrid(false);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedCategoryId === cat.id
                            ? 'border-red-600 bg-red-50/20'
                            : 'border-neutral-200 hover:border-neutral-950 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                          <span>{String(idx + 1).padStart(2, '0')}</span>
                          <span>{cat.nameUr}</span>
                        </div>
                        <h3 className="text-sm font-bold text-neutral-950 mt-1">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                          {cat.subcategories.join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subcategory Filter Bar if a specific category is selected */}
                {activeCategoryObj &&
                  activeCategoryObj.subcategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-neutral-500 font-medium">
                        {activeCategoryObj.name} Subcategories:
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSubcategory('all')}
                        className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                          selectedSubcategory === 'all'
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-600 hover:text-neutral-950'
                        }`}
                      >
                        All
                      </button>
                      {activeCategoryObj.subcategories.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setSelectedSubcategory(sub)}
                          className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                            selectedSubcategory === sub
                              ? 'bg-red-600 text-white'
                              : 'text-neutral-600 hover:text-neutral-950'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {/* Segmented Collection Tabs + Availability & Sort Control */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg overflow-x-auto">
                  {[
                    { id: 'all', label: 'All Products' },
                    { id: 'trending', label: 'Trending Now' },
                    { id: 'bestsellers', label: 'Best Sellers' },
                    { id: 'new-arrivals', label: 'New Arrivals' },
                    { id: 'flash-sale', label: 'Flash Discounts' },
                    { id: 'recommended', label: 'Recommended' },
                    {
                      id: 'recently-viewed',
                      label: `Recently Viewed (${recentlyViewedIds.length})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setCollectionTab(tab.id as CollectionFilter)
                      }
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        collectionTab === tab.id
                          ? 'bg-white text-neutral-950 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-950'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
                  <label className="flex items-center gap-1.5 text-neutral-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    In Stock Only
                  </label>

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as typeof sortBy)
                      }
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white font-medium text-neutral-900"
                    >
                      <option value="featured">Featured Curated</option>
                      <option value="price-asc">Price: Low to High (PKR)</option>
                      <option value="price-desc">
                        Price: High to Low (PKR)
                      </option>
                      <option value="rating">Top Customer Rated</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3-Column Featured Product Grid */}
              {loadingStore ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="aspect-[4/4] rounded-xl bg-neutral-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 px-6 text-center rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
                  <p className="text-base font-bold text-neutral-950">
                    No matching products found
                  </p>
                  <p className="text-xs text-neutral-600 max-w-md mx-auto">
                    Try clearing your search filter or switching to All Departments. Administrators can also add new products in this category via the Admin Portal.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId('all');
                      setSelectedSubcategory('all');
                      setCollectionTab('all');
                      setSearchQuery('');
                      setInStockOnly(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {filteredProducts.map((product) => {
                    const effectivePrice = getEffectivePrice(product);
                    const discountPct = getDiscountPercentage(product);
                    const isSaved = wishlist.includes(product.id);
                    const isJustAdded = quickAddedId === product.id;

                    return (
                      <article
                        key={product.id}
                        onClick={() => handleOpenProduct(product)}
                        className="group bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 hover:border-neutral-900 cursor-pointer"
                      >
                        <div>
                          {/* Product Image Container (65%-75% Visual Weight) */}
                          <div className="aspect-[4/3] w-full bg-neutral-100 overflow-hidden relative border-b border-neutral-100">
                            <SafeProductImage
                              src={product.images[0]}
                              alt={product.name}
                              itemTitle={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Card Body — Clean Unboxed Metadata */}
                          <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between text-xs text-neutral-500">
                              <span className="uppercase tracking-wider font-medium text-neutral-600 truncate">
                                {product.brand} · {product.subcategory}
                              </span>
                              <span className="inline-flex items-center gap-1 font-mono text-neutral-800 shrink-0">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {product.rating.toFixed(1)}
                              </span>
                            </div>

                            <h3 className="text-base font-semibold text-neutral-950 group-hover:text-red-600 transition-colors line-clamp-1">
                              {lang === 'ur' && product.nameUr
                                ? product.nameUr
                                : product.name}
                            </h3>

                            {/* Price & Unboxed Status Row */}
                            <div className="pt-1 flex items-baseline justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[15px] font-bold font-mono tabular-nums text-neutral-950">
                                  {formatPKR(effectivePrice)}
                                </span>
                                {discountPct > 0 && (
                                  <span className="text-xs font-mono tabular-nums text-neutral-400 line-through">
                                    {formatPKR(product.price)}
                                  </span>
                                )}
                              </div>

                              <span className="text-xs text-red-600 font-medium">
                                {discountPct > 0
                                  ? `-${discountPct}% Off`
                                  : product.stock > 0
                                  ? 'In Stock'
                                  : 'Sold Out'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="px-5 pb-5 pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            disabled={product.stock <= 0}
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="flex-1 py-2 px-4 rounded-lg bg-neutral-950 hover:bg-red-600 disabled:bg-neutral-300 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Added to Bag
                              </>
                            ) : product.stock > 0 ? (
                              'Add to Cart'
                            ) : (
                              'Out of Stock'
                            )}
                          </button>

                          <a
                            href={buildWhatsAppInquiryUrl(
                              settings.whatsappLink,
                              product
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Inquire via WhatsApp"
                            className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-900 text-neutral-700 hover:text-emerald-600 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(product.id);
                            }}
                            aria-label="Toggle Wishlist"
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              isSaved
                                ? 'border-red-600 text-red-600 bg-red-50'
                                : 'border-neutral-200 hover:border-neutral-900 text-neutral-600'
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isSaved ? 'fill-red-600' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* SECTION 3: VERIFIED CUSTOMER PROOF, FEATURED BRANDS & NEWSLETTER */}
            <section className="bg-neutral-50 border-t border-b border-neutral-200 py-14">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Featured Official Brands Bar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-neutral-950">
                      Featured Official Brands & Partners
                    </h2>
                    <span className="text-xs text-neutral-500">
                      100% Original & Verified Inventory
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {settings.featuredBrands.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => {
                          setSearchQuery(brand);
                          const el = document.getElementById('catalog-anchor');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="p-3 rounded-lg border border-neutral-200 bg-white hover:border-neutral-950 text-xs font-semibold text-neutral-800 text-center truncate transition-colors cursor-pointer"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified Buyer Reviews Across Pakistan */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-950">
                      Verified Shoppers Across Pakistan
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Unedited feedback from Cash on Delivery and prepaid customers in Lahore, Karachi, Islamabad, and Peshawar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {reviews.slice(0, 4).map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-xl bg-white border border-neutral-200 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5 fill-amber-500"
                              />
                            ))}
                          </div>
                          <p className="text-xs text-neutral-700 leading-relaxed">
                            “{rev.comment}”
                          </p>
                        </div>

                        <div className="pt-3 border-t border-neutral-100 text-xs">
                          <div className="font-bold text-neutral-950">
                            {rev.customerName}
                          </div>
                          <div className="text-neutral-500">
                            {rev.city} · Verified Buyer
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter & Flash Drop Alerts */}
                <div className="p-6 sm:p-8 rounded-xl bg-neutral-950 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-1 max-w-xl">
                    <h3 className="text-xl font-bold text-white">
                      Receive Early Access to Pakistan Flash Sales & Promo Codes
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Consent-based weekly updates with PKR discount codes (try <code className="text-red-400 font-mono">PAKISTAN10</code> or <code className="text-red-400 font-mono">WELCOME500</code> at checkout).
                    </p>
                  </div>

                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="flex flex-col sm:flex-row w-full lg:w-auto gap-2.5"
                  >
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs sm:text-sm text-white min-w-[260px] focus:outline-none focus:border-red-600"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                    >
                      {newsletterDone ? 'Subscribed!' : 'Subscribe Now'}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* QUIET PROFESSIONAL FOOTER */}
      <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-lg font-bold tracking-tight text-white font-display">
              CARRY<span className="text-red-600">CART</span>
            </span>
            <p className="text-neutral-400 leading-relaxed">
              {settings.tagline}. Offering verified electronics, fashion, timepieces, and home essentials with nationwide Cash on Delivery in Pakistani Rupees (PKR).
            </p>
            <div className="pt-1 font-mono text-white">
              WhatsApp & Support: {settings.whatsappNumber}
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-white">Top Categories</h4>
            <ul className="space-y-1.5">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategoryId(c.id);
                      setActiveView('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-white">
              Customer Service & Policies
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => {
                    setActiveView('track-order');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Your Order & Status History
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('account');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Customer Login & Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('support');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shipping, Return, Privacy & Terms
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Administrator Login & Guide
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-white">Direct Contact</h4>
            <p>Phone / WhatsApp: {settings.whatsappNumber}</p>
            <p>Email: {settings.supportEmail}</p>
            <p className="text-neutral-500">{settings.headquarters}</p>
            <div className="pt-2">
              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <span>
            © {new Date().getFullYear()} CARRY CART Pakistan. All prices displayed in Pakistani Rupees (PKR).
          </span>
          <span>
            Cash on Delivery (COD) · Raast · Easypaisa · JazzCash · Direct Bank IBAN
          </span>
        </div>
      </footer>

      {/* SLIDE-OVER SHOPPING CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        settings={settings}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setActiveView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* FLOATING WHATSAPP CONCIERGE BUTTON (+966 50 170 1709) */}
      <a
        href={buildWhatsAppInquiryUrl(
          settings.whatsappLink,
          activeView === 'product-detail' && selectedProduct
            ? selectedProduct
            : undefined
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold shadow-lg border border-neutral-800 transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-emerald-400" />
        <span>WhatsApp Support</span>
      </a>
    </div>
  );
}
