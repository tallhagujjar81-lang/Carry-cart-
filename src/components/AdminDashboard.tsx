import React, { useState, useEffect } from 'react';
import {
  StoreDatabase,
  Product,
  Category,
  OrderStatus,
  PaymentStatus,
  CityDeliveryConfig,
} from '../types.ts';
import { formatPKR, SafeProductImage } from '../utils/formatters.tsx';
import { createStudioProductSvg } from '../seedData.ts';
import {
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  X,
  Upload,
  Package,
  ShoppingBag,
  Layers,
  MapPin,
  FileText,
  BarChart3,
  MessageSquare,
  Image as ImageIcon,
  ShieldCheck,
  ArrowLeft,
  Tag,
  LifeBuoy,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onStoreUpdated: () => Promise<void>;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Order Placed',
  'Payment Pending',
  'Payment Confirmed',
  'Pending Verification',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned / Refunded',
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  'COD Pending',
  'Pending Verification',
  'Paid',
  'Failed',
  'Refunded',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onStoreUpdated,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('carry_cart_admin_token')
  );
  const [email, setEmail] = useState('admin@carrycart.pk');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const [adminData, setAdminData] = useState<StoreDatabase | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'products'
    | 'categories'
    | 'orders'
    | 'coupons'
    | 'tickets'
    | 'cities'
    | 'banners'
    | 'reviews'
    | 'settings'
    | 'docs'
  >('overview');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodForm, setProdForm] = useState({
    name: '',
    nameUr: '',
    sku: '',
    categoryId: 'cat-watches-jewellery',
    subcategory: '',
    brand: 'CARRY CART Official',
    price: 5000,
    discountedPrice: '',
    stock: 25,
    description: '',
    images: [] as string[],
    variationLabel1: 'Size / Option',
    variationValues1: 'Standard, Large',
    variationLabel2: 'Color',
    variationValues2: 'Obsidian Black, Classic White',
    deliveryEstimate: '2–3 Working Days Nationwide',
    warranty: '7-Day Easy Return Guarantee',
    isTrending: true,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    isRecommended: true,
    isPublished: true,
  });

  // Category Form State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catNameUr, setCatNameUr] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSubcategories, setCatSubcategories] = useState('');
  const [catFeatured, setCatFeatured] = useState(true);

  // Coupon Form State
  const [coupCode, setCoupCode] = useState('');
  const [coupDesc, setCoupDesc] = useState('');
  const [coupType, setCoupType] = useState<'percentage' | 'fixed'>('percentage');
  const [coupVal, setCoupVal] = useState(10);
  const [coupMinOrder, setCoupMinOrder] = useState(3000);

  // Banner Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerKicker, setBannerKicker] = useState('LIMITED SEASON CAMPAIGN');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerCta, setBannerCta] = useState('Shop Collection');
  const [bannerCatSlug, setBannerCatSlug] = useState('all');

  // New City State
  const [newCityName, setNewCityName] = useState('');
  const [newCityProvince, setNewCityProvince] =
    useState<CityDeliveryConfig['province']>('Punjab');
  const [newCityFee, setNewCityFee] = useState(250);
  const [newCityDays, setNewCityDays] = useState('2–4 Days');

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const fetchAdminData = async (activeToken: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem('carry_cart_admin_token');
        setToken(null);
        return;
      }
      const data = await res.json();
      setAdminData(data);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Login failed');
      } else {
        sessionStorage.setItem('carry_cart_admin_token', data.token);
        setToken(data.token);
        setPassword('');
      }
    } catch {
      setAuthError('Network error while connecting to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    sessionStorage.removeItem('carry_cart_admin_token');
    setToken(null);
    setAdminData(null);
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    const defaultCat = adminData?.categories[0]?.id || 'cat-watches-jewellery';
    const defaultSub = adminData?.categories[0]?.subcategories[0] || 'General';
    setProdForm({
      name: '',
      nameUr: '',
      sku: `CC-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: defaultCat,
      subcategory: defaultSub,
      brand: 'CARRY CART Official',
      price: 6500,
      discountedPrice: '5200',
      stock: 30,
      description: '',
      images: [],
      variationLabel1: 'Size / Model',
      variationValues1: 'Standard, Executive',
      variationLabel2: 'Color',
      variationValues2: 'Obsidian Black, Pearl White',
      deliveryEstimate: '2–3 Working Days Nationwide',
      warranty: '1 Year Carry Cart Warranty',
      isTrending: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      isRecommended: true,
      isPublished: true,
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      nameUr: p.nameUr || '',
      sku: p.sku,
      categoryId: p.categoryId,
      subcategory: p.subcategory,
      brand: p.brand,
      price: p.price,
      discountedPrice: p.discountedPrice ? String(p.discountedPrice) : '',
      stock: p.stock,
      description: p.description,
      images: [...p.images],
      variationLabel1: p.variations[0]?.label || 'Option',
      variationValues1: p.variations[0]?.values.join(', ') || '',
      variationLabel2: p.variations[1]?.label || '',
      variationValues2: p.variations[1]?.values.join(', ') || '',
      deliveryEstimate: p.deliveryEstimate,
      warranty: p.warranty,
      isTrending: p.isTrending,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      isFlashSale: p.isFlashSale,
      isRecommended: p.isRecommended,
      isPublished: p.isPublished,
    });
    setShowProductModal(true);
  };

  const handleDuplicateProduct = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/products/${id}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchAdminData(token);
      await onStoreUpdated();
      notify('Product duplicated successfully.');
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProdForm((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateStudioVisual = () => {
    const title = prodForm.name || 'CARRY CART Product';
    const sub = prodForm.brand || 'Official Pakistan Warranty';
    const sku = prodForm.sku || 'CC-NEW';
    const svgUri = createStudioProductSvg(
      title,
      sub,
      sku,
      '#f4f4f5',
      '#dc2626',
      'watch',
      `STUDIO VIEW #${prodForm.images.length + 1}`
    );
    setProdForm((prev) => ({ ...prev, images: [...prev.images, svgUri] }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const variations = [];
    if (prodForm.variationLabel1.trim() && prodForm.variationValues1.trim()) {
      variations.push({
        label: prodForm.variationLabel1.trim(),
        values: prodForm.variationValues1
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
    }
    if (prodForm.variationLabel2.trim() && prodForm.variationValues2.trim()) {
      variations.push({
        label: prodForm.variationLabel2.trim(),
        values: prodForm.variationValues2
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
    }

    const finalImages =
      prodForm.images.length > 0
        ? prodForm.images
        : [
            createStudioProductSvg(
              prodForm.name || 'Carry Cart Item',
              prodForm.brand,
              prodForm.sku,
              '#f4f4f5',
              '#dc2626',
              'bag'
            ),
          ];

    const payload = {
      name: prodForm.name,
      nameUr: prodForm.nameUr,
      sku: prodForm.sku,
      categoryId: prodForm.categoryId,
      subcategory: prodForm.subcategory,
      brand: prodForm.brand,
      price: Number(prodForm.price),
      discountedPrice: prodForm.discountedPrice
        ? Number(prodForm.discountedPrice)
        : null,
      stock: Number(prodForm.stock),
      description: prodForm.description,
      images: finalImages,
      variations,
      deliveryEstimate: prodForm.deliveryEstimate,
      warranty: prodForm.warranty,
      isTrending: prodForm.isTrending,
      isBestSeller: prodForm.isBestSeller,
      isNewArrival: prodForm.isNewArrival,
      isFlashSale: prodForm.isFlashSale,
      isRecommended: prodForm.isRecommended,
      isPublished: prodForm.isPublished,
    };

    const url = editingProduct
      ? `/api/admin/products/${editingProduct.id}`
      : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowProductModal(false);
      await fetchAdminData(token);
      await onStoreUpdated();
      notify(
        editingProduct
          ? 'Product updated in database.'
          : 'New product published to store.'
      );
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchAdminData(token);
      await onStoreUpdated();
      notify('Product deleted permanently.');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !catName.trim()) return;
    const subList = catSubcategories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const url = editingCategory
      ? `/api/admin/categories/${editingCategory.id}`
      : '/api/admin/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: catName,
        nameUr: catNameUr || catName,
        description: catDesc,
        subcategories: subList,
        featured: catFeatured,
      }),
    });

    if (res.ok) {
      setEditingCategory(null);
      setCatName('');
      setCatNameUr('');
      setCatDesc('');
      setCatSubcategories('');
      await fetchAdminData(token);
      await onStoreUpdated();
      notify(editingCategory ? 'Category updated.' : 'New category created.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchAdminData(token);
      await onStoreUpdated();
      notify('Category removed.');
    }
  };

  const handleUpdateOrder = async (
    orderId: string,
    updates: Record<string, unknown>
  ) => {
    if (!token) return;
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await fetchAdminData(token);
      await onStoreUpdated();
      notify('Order record & timestamp history updated.');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !coupCode.trim()) return;
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: coupCode,
        description: coupDesc,
        discountType: coupType,
        discountValue: coupVal,
        minOrderPKR: coupMinOrder,
      }),
    });
    if (res.ok) {
      setCoupCode('');
      setCoupDesc('');
      await fetchAdminData(token);
      await onStoreUpdated();
      notify('Promotional coupon created.');
    }
  };

  const handleUpdateCities = async (updatedCities: CityDeliveryConfig[]) => {
    if (!token) return;
    const res = await fetch('/api/admin/cities', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cities: updatedCities }),
    });
    if (res.ok) {
      await fetchAdminData(token);
      await onStoreUpdated();
      notify('Pakistan city delivery matrix saved.');
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData || !newCityName.trim()) return;
    const updated: CityDeliveryConfig[] = [
      ...adminData.cities,
      {
        city: newCityName.trim(),
        province: newCityProvince,
        deliveryFee: Number(newCityFee) || 250,
        estimatedDays: newCityDays || '2–4 Days',
        codAvailable: true,
        active: true,
      },
    ];
    setNewCityName('');
    await handleUpdateCities(updated);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !bannerTitle.trim()) return;
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        kicker: bannerKicker,
        title: bannerTitle,
        subtitle: bannerSubtitle,
        ctaText: bannerCta,
        targetCategorySlug: bannerCatSlug,
        imageUrl: '/src/assets/images/case_fintech_platform_1791790598093.jpg',
        active: true,
      }),
    });
    if (res.ok) {
      setBannerTitle('');
      setBannerSubtitle('');
      await fetchAdminData(token);
      await onStoreUpdated();
      notify('Hero promotional banner added.');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!token) return;
    await fetch(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchAdminData(token);
    await onStoreUpdated();
    notify('Banner removed.');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !adminData) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(adminData.settings),
    });
    if (res.ok) {
      await fetchAdminData(token);
      await onStoreUpdated();
      notify('Store settings, payment config, and policies saved.');
    }
  };

  // ==========================================
  // LOGIN VIEW
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-6">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to CARRY CART Storefront
          </button>
          <span className="text-xs font-mono text-neutral-400">
            ENCRYPTED ADMIN GATEWAY
          </span>
        </div>

        <div className="max-w-md w-full mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-8 my-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                CARRY CART Admin Console
              </h1>
              <p className="text-xs text-neutral-400">
                Authorized Marketplace Operations & Inventory Control
              </p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Administrator Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {loading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-800 text-xs text-neutral-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Default Demo Admin Credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@carrycart.pk');
                  setPassword('CarryCartAdmin#2026');
                }}
                className="text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
              >
                Auto-Fill Demo Login
              </button>
            </div>
            <p className="font-mono text-[11px] text-neutral-300">
              Email: admin@carrycart.pk · Pass: CarryCartAdmin#2026
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500">
          CARRY CART Pakistan · Server-Side PBKDF2-SHA512 Authentication
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-8">
        <div className="text-sm font-medium text-neutral-600">
          Loading CARRY CART Database & Telemetry...
        </div>
      </div>
    );
  }

  const totalRevenuePKR = adminData.orders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Returned / Refunded')
    .reduce((sum, o) => sum + o.total, 0);
  const totalInventoryUnits = adminData.products.reduce(
    (sum, p) => sum + p.stock,
    0
  );
  const lowStockProducts = adminData.products.filter((p) => p.stock <= 10);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-neutral-950 text-white shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-800">
        <div>
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-display">
                CARRY<span className="text-red-600">CART</span>
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Admin Control Center
              </p>
            </div>
            <button
              onClick={onBackToStore}
              className="text-xs px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            >
              View Live Store
            </button>
          </div>

          <nav className="p-3 space-y-1 flex lg:flex-col overflow-x-auto">
            {[
              { id: 'overview', label: 'Sales & Overview', icon: BarChart3 },
              {
                id: 'products',
                label: `Products (${adminData.products.length})`,
                icon: Package,
              },
              {
                id: 'categories',
                label: `Categories (${adminData.categories.length})`,
                icon: Layers,
              },
              {
                id: 'orders',
                label: `Orders (${adminData.orders.length})`,
                icon: ShoppingBag,
              },
              {
                id: 'coupons',
                label: `Coupons (${adminData.coupons?.length || 0})`,
                icon: Tag,
              },
              {
                id: 'tickets',
                label: `Support Tickets (${adminData.tickets?.length || 0})`,
                icon: LifeBuoy,
              },
              { id: 'cities', label: 'PK Cities & Shipping', icon: MapPin },
              { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
              { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
              { id: 'settings', label: 'Payments & Policies', icon: FileText },
              { id: 'docs', label: 'Deployment & Audit', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-red-600 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-red-950/60 text-neutral-300 hover:text-red-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {statusMessage && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-neutral-900 text-white text-xs font-medium flex items-center justify-between">
            <span>{statusMessage}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW & REPORTS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-950">
                  Sales, Orders & Inventory Telemetry
                </h1>
                <p className="text-sm text-neutral-600">
                  Real-time store metrics persisted in your CARRY CART database.
                </p>
              </div>
              <button
                onClick={openCreateProductModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <span className="text-xs text-neutral-500">
                  Total Revenue (Active Orders)
                </span>
                <p className="text-2xl font-bold text-neutral-950 font-mono tabular-nums mt-1">
                  {formatPKR(totalRevenuePKR)}
                </p>
                <span className="text-xs text-neutral-500 mt-1 block">
                  Across {adminData.orders.length} total orders
                </span>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <span className="text-xs text-neutral-500">
                  Published Products
                </span>
                <p className="text-2xl font-bold text-neutral-950 font-mono tabular-nums mt-1">
                  {adminData.products.filter((p) => p.isPublished).length} /{' '}
                  {adminData.products.length}
                </p>
                <span className="text-xs text-neutral-500 mt-1 block">
                  {totalInventoryUnits.toLocaleString()} total units in stock
                </span>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <span className="text-xs text-neutral-500">
                  Active Promo Coupons
                </span>
                <p className="text-2xl font-bold text-neutral-950 font-mono tabular-nums mt-1">
                  {adminData.coupons?.filter((c) => c.active).length || 0}
                </p>
                <span className="text-xs text-neutral-500 mt-1 block">
                  {adminData.tickets?.filter((t) => t.status === 'Open').length || 0}{' '}
                  open support tickets
                </span>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <span className="text-xs text-neutral-500">
                  Covered Pakistani Cities
                </span>
                <p className="text-2xl font-bold text-neutral-950 font-mono tabular-nums mt-1">
                  {adminData.cities.filter((c) => c.active).length} Cities
                </p>
                <span className="text-xs text-neutral-500 mt-1 block">
                  Free shipping above{' '}
                  {formatPKR(adminData.settings.freeShippingThreshold)}
                </span>
              </div>
            </div>

            {/* Low stock alert */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="text-base font-bold text-neutral-950 mb-4">
                Inventory Health & Low-Stock Watchlist (≤ 10 Units)
              </h2>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-neutral-600">
                  All products have healthy inventory levels (&gt; 10 units).
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                        <th className="py-2.5 pr-4">SKU</th>
                        <th className="py-2.5 pr-4">Product</th>
                        <th className="py-2.5 pr-4 text-right">Price</th>
                        <th className="py-2.5 pr-4 text-right">
                          Remaining Stock
                        </th>
                        <th className="py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {lowStockProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 pr-4 font-mono text-xs">{p.sku}</td>
                          <td className="py-3 pr-4 font-medium">{p.name}</td>
                          <td className="py-3 pr-4 text-right font-mono tabular-nums">
                            {formatPKR(p.discountedPrice || p.price)}
                          </td>
                          <td className="py-3 pr-4 text-right font-mono tabular-nums text-red-600 font-semibold">
                            {p.stock} units
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="text-xs font-medium text-neutral-900 underline hover:text-red-600 cursor-pointer"
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGER */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-950">
                  Products & Inventory Management
                </h1>
                <p className="text-sm text-neutral-600">
                  Add, edit, duplicate, publish/unpublish, upload multiple images, and update PKR prices and stock.
                </p>
              </div>
              <button
                onClick={openCreateProductModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">SKU · Category</th>
                      <th className="py-3 px-4 text-right">Regular Price</th>
                      <th className="py-3 px-4 text-right">Sale Price</th>
                      <th className="py-3 px-4 text-right">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {adminData.products.map((product) => {
                      const cat = adminData.categories.find(
                        (c) => c.id === product.categoryId
                      );
                      return (
                        <tr key={product.id} className="hover:bg-neutral-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                                <SafeProductImage
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-neutral-950 line-clamp-1">
                                  {product.name}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {product.brand} · {product.images.length} image(s)
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-xs text-neutral-800">
                              {product.sku}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {cat?.name || product.categoryId}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-600">
                            {formatPKR(product.price)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-red-600">
                            {product.discountedPrice
                              ? formatPKR(product.discountedPrice)
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            <span
                              className={
                                product.stock <= 5
                                  ? 'text-red-600 font-bold'
                                  : 'text-neutral-900 font-medium'
                              }
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs">
                            {product.isPublished ? (
                              <span className="text-emerald-700 font-medium">
                                Published
                              </span>
                            ) : (
                              <span className="text-neutral-400">
                                Unpublished
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                            <button
                              onClick={() => openEditProductModal(product)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-neutral-200 hover:border-neutral-900 text-xs font-medium cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(product.id)}
                              title="Duplicate Product"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-neutral-200 hover:border-neutral-900 text-xs font-medium cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-neutral-200 hover:border-red-600 text-red-600 text-xs font-medium cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES & SUBCATEGORIES MANAGER */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-xl p-6 h-fit">
              <h2 className="text-base font-bold text-neutral-950 mb-4">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Category Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g., Solar & Power Solutions"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Category Name (Urdu — Optional)
                  </label>
                  <input
                    type="text"
                    value={catNameUr}
                    onChange={(e) => setCatNameUr(e.target.value)}
                    placeholder="e.g., سولر اور پاور سسٹمز"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Short category description..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Subcategories (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={catSubcategories}
                    onChange={(e) => setCatSubcategories(e.target.value)}
                    placeholder="Solar Panels, Hybrid Inverters, Lithium Batteries"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catFeatured}
                    onChange={(e) => setCatFeatured(e.target.checked)}
                    className="rounded border-neutral-300"
                  />
                  Show in Featured Homepage Categories
                </label>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCatName('');
                        setCatNameUr('');
                        setCatDesc('');
                        setCatSubcategories('');
                      }}
                      className="py-2.5 px-3 border border-neutral-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="text-base font-bold text-neutral-950 mb-4">
                Active Marketplace Categories ({adminData.categories.length})
              </h2>
              <div className="divide-y divide-neutral-200">
                {adminData.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-neutral-950">
                          {cat.name}
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs text-neutral-600">
                          {cat.nameUr}
                        </span>
                        {cat.featured && (
                          <span className="text-[11px] font-mono text-red-600">
                            · Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Subcategories:{' '}
                        {cat.subcategories.length > 0
                          ? cat.subcategories.join(' / ')
                          : 'None'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCatName(cat.name);
                          setCatNameUr(cat.nameUr);
                          setCatDesc(cat.description);
                          setCatSubcategories(cat.subcategories.join(', '));
                          setCatFeatured(cat.featured);
                        }}
                        className="px-2.5 py-1.5 border border-neutral-200 rounded text-xs font-medium hover:border-neutral-900 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="px-2.5 py-1.5 border border-neutral-200 rounded text-xs font-medium text-red-600 hover:border-red-600 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS, COURIER TRACKING & STATUS TIMELINE */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-950">
                Customer Orders, Courier Tracking & Status History
              </h1>
              <p className="text-sm text-neutral-600">
                Update order statuses, payment verification, and courier tracking numbers. Every status change automatically logs a timestamp in the customer’s tracking timeline.
              </p>
            </div>

            <div className="space-y-4">
              {adminData.orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-base font-bold text-neutral-950">
                          {order.orderNumber}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-xs font-medium text-neutral-600">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-xs font-semibold text-red-600">
                          {order.paymentMethod} ({order.paymentStatus || 'COD Pending'})
                        </span>
                      </div>
                      <p className="text-sm font-medium text-neutral-900 mt-1">
                        {order.customerName} —{' '}
                        <span className="font-mono">{order.phone}</span> ({order.city},{' '}
                        {order.province})
                      </p>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        Address: {order.address}
                        {order.landmark ? ` (Landmark: ${order.landmark})` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrder(order.id, {
                            status: e.target.value as OrderStatus,
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold bg-white text-neutral-900"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            Order: {st}
                          </option>
                        ))}
                      </select>

                      <select
                        value={order.paymentStatus || 'COD Pending'}
                        onChange={(e) =>
                          handleUpdateOrder(order.id, {
                            paymentStatus: e.target.value as PaymentStatus,
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold bg-white text-neutral-900"
                      >
                        {PAYMENT_STATUSES.map((ps) => (
                          <option key={ps} value={ps}>
                            Payment: {ps}
                          </option>
                        ))}
                      </select>

                      <a
                        href={`https://wa.me/${order.phone
                          .replace(/[^0-9]/g, '')
                          .replace(/^0/, '92')}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum ${order.customerName}, this is CARRY CART regarding your Order ${order.orderNumber} (${formatPKR(
                            order.total
                          )}). Current status: ${order.status}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium whitespace-nowrap"
                      >
                        WhatsApp Customer
                      </a>
                    </div>
                  </div>

                  {/* Courier Provider & Tracking Link Editor */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                    <div>
                      <label className="block font-medium text-neutral-600 mb-1">
                        Courier Partner (e.g., TCS / Leopards)
                      </label>
                      <input
                        type="text"
                        defaultValue={order.courierName || ''}
                        placeholder="TCS Express / Leopards"
                        onBlur={(e) =>
                          handleUpdateOrder(order.id, {
                            courierName: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-neutral-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-600 mb-1">
                        Courier Tracking Number
                      </label>
                      <input
                        type="text"
                        defaultValue={order.trackingNumber || ''}
                        placeholder="TCS-774829104"
                        onBlur={(e) =>
                          handleUpdateOrder(order.id, {
                            trackingNumber: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-neutral-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-600 mb-1">
                        Official Courier Tracking URL
                      </label>
                      <input
                        type="url"
                        defaultValue={order.trackingUrl || ''}
                        placeholder="https://www.tcsexpress.com/track/..."
                        onBlur={(e) =>
                          handleUpdateOrder(order.id, {
                            trackingUrl: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-neutral-300 bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-neutral-100">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="py-2 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-semibold">
                            {item.quantity}x
                          </span>{' '}
                          <span className="font-medium">{item.name}</span>{' '}
                          <span className="text-neutral-500 font-mono">
                            ({item.sku})
                          </span>
                        </div>
                        <span className="font-mono tabular-nums font-medium">
                          {formatPKR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status History Preview */}
                  {Array.isArray(order.statusHistory) &&
                    order.statusHistory.length > 0 && (
                      <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 flex flex-wrap gap-3">
                        <strong className="text-neutral-700">
                          Status Timeline:
                        </strong>
                        {order.statusHistory.map((h, idx) => (
                          <span key={idx} className="font-mono">
                            [{h.status}:{' '}
                            {new Date(h.timestamp).toLocaleDateString()}]
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DISCOUNT COUPONS & PROMOTIONS */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              onSubmit={handleCreateCoupon}
              className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 h-fit text-xs"
            >
              <h2 className="text-base font-bold text-neutral-950">
                Create Discount Coupon
              </h2>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  value={coupCode}
                  onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                  placeholder="e.g., AZADI20"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={coupDesc}
                  onChange={(e) => setCoupDesc(e.target.value)}
                  placeholder="20% Off Azadi Sale"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={coupType}
                    onChange={(e) =>
                      setCoupType(e.target.value as 'percentage' | 'fixed')
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed PKR</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={coupVal}
                    onChange={(e) => setCoupVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Minimum Order Subtotal (PKR)
                </label>
                <input
                  type="number"
                  value={coupMinOrder}
                  onChange={(e) => setCoupMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
              >
                Create Coupon Code
              </button>
            </form>

            <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-neutral-950">
                Active & Configured Coupons ({adminData.coupons?.length || 0})
              </h2>
              <div className="divide-y divide-neutral-200">
                {(adminData.coupons || []).map((c) => (
                  <div
                    key={c.id}
                    className="py-3.5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-neutral-950">
                          {c.code}
                        </span>
                        <span className="text-red-600 font-semibold">
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : `${formatPKR(c.discountValue)} OFF`}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-500">
                          Min Order: {formatPKR(c.minOrderPKR)}
                        </span>
                      </div>
                      <p className="text-neutral-500 mt-0.5">
                        {c.description} · Used {c.usageCount} time(s)
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch(`/api/admin/coupons/${c.id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        await fetchAdminData(token);
                        await onStoreUpdated();
                        notify('Coupon deleted.');
                      }}
                      className="px-2.5 py-1.5 border border-neutral-200 hover:border-red-600 text-red-600 rounded font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMER SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-neutral-950">
              Customer Support Enquiries & Tickets ({adminData.tickets?.length || 0})
            </h1>
            <div className="space-y-4">
              {(adminData.tickets || []).map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-neutral-950">
                        {t.ticketNumber}
                      </span>
                      <span className="mx-2 text-neutral-300">·</span>
                      <span className="font-semibold">{t.subject}</span>
                      {t.orderNumber && (
                        <span className="ml-2 font-mono text-red-600">
                          (Order: {t.orderNumber})
                        </span>
                      )}
                    </div>
                    <select
                      value={t.status}
                      onChange={async (e) => {
                        await fetch(`/api/admin/tickets/${t.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ status: e.target.value }),
                        });
                        await fetchAdminData(token);
                        notify(`Ticket ${t.ticketNumber} marked ${e.target.value}.`);
                      }}
                      className="px-2.5 py-1 rounded border border-neutral-300 bg-white font-semibold"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <p className="text-neutral-600">
                    From: <strong>{t.customerName}</strong> ({t.phone}) —{' '}
                    {t.message}
                  </p>
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Admin Response (Visible to customer in ticket lookup)
                    </label>
                    <input
                      type="text"
                      defaultValue={t.adminResponse || ''}
                      placeholder="Type official response and press Tab/click outside to save..."
                      onBlur={async (e) => {
                        await fetch(`/api/admin/tickets/${t.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            adminResponse: e.target.value,
                            status: 'Resolved',
                          }),
                        });
                        await fetchAdminData(token);
                        notify('Ticket response saved.');
                      }}
                      className="w-full px-3 py-2 rounded border border-neutral-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PAKISTAN CITIES & SHIPPING */}
        {activeTab === 'cities' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-950">
                Pakistan Delivery Cities & COD Configuration
              </h1>
              <p className="text-sm text-neutral-600">
                Configure city-specific courier charges in PKR, estimated transit times, and Cash on Delivery availability.
              </p>
            </div>

            <form
              onSubmit={handleAddCity}
              className="bg-white border border-neutral-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  City Name
                </label>
                <input
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="e.g., Jhelum"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Province / Territory
                </label>
                <select
                  value={newCityProvince}
                  onChange={(e) =>
                    setNewCityProvince(
                      e.target.value as CityDeliveryConfig['province']
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad Capital Territory">
                    Islamabad Capital Territory
                  </option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Delivery Fee (PKR)
                </label>
                <input
                  type="number"
                  value={newCityFee}
                  onChange={(e) => setNewCityFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Transit Estimate
                </label>
                <input
                  type="text"
                  value={newCityDays}
                  onChange={(e) => setNewCityDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                + Add City
              </button>
            </form>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Province</th>
                    <th className="py-3 px-4">Shipping Fee (PKR)</th>
                    <th className="py-3 px-4">Estimated Days</th>
                    <th className="py-3 px-4">COD Available</th>
                    <th className="py-3 px-4">Delivery Enabled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {adminData.cities.map((c, idx) => (
                    <tr key={c.city}>
                      <td className="py-2.5 px-4 font-medium">{c.city}</td>
                      <td className="py-2.5 px-4 text-xs text-neutral-600">
                        {c.province}
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          value={c.deliveryFee}
                          onChange={(e) => {
                            const next = [...adminData.cities];
                            next[idx] = {
                              ...c,
                              deliveryFee: Number(e.target.value),
                            };
                            setAdminData({ ...adminData, cities: next });
                          }}
                          onBlur={() => handleUpdateCities(adminData.cities)}
                          className="w-24 px-2 py-1 rounded border border-neutral-300 font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-xs">{c.estimatedDays}</td>
                      <td className="py-2.5 px-4">
                        <input
                          type="checkbox"
                          checked={c.codAvailable}
                          onChange={(e) => {
                            const next = [...adminData.cities];
                            next[idx] = { ...c, codAvailable: e.target.checked };
                            handleUpdateCities(next);
                          }}
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="checkbox"
                          checked={c.active}
                          onChange={(e) => {
                            const next = [...adminData.cities];
                            next[idx] = { ...c, active: e.target.checked };
                            handleUpdateCities(next);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: HERO BANNERS */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              onSubmit={handleAddBanner}
              className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 h-fit"
            >
              <h2 className="text-base font-bold text-neutral-950">
                Add Promotional Banner
              </h2>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Kicker Line
                </label>
                <input
                  type="text"
                  value={bannerKicker}
                  onChange={(e) => setBannerKicker(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Headline *
                </label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Eid & Season Sale — Up to 30% Off"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Subtitle
                </label>
                <textarea
                  rows={2}
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Button CTA Label
                </label>
                <input
                  type="text"
                  value={bannerCta}
                  onChange={(e) => setBannerCta(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Target Category
                </label>
                <select
                  value={bannerCatSlug}
                  onChange={(e) => setBannerCatSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white"
                >
                  <option value="all">All Categories</option>
                  {adminData.categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Publish Banner
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              {adminData.banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[11px] font-mono text-red-600">
                      {b.kicker}
                    </span>
                    <h3 className="text-base font-bold text-neutral-950 mt-0.5">
                      {b.title}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">{b.subtitle}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="px-3 py-1.5 border border-neutral-200 hover:border-red-600 text-red-600 rounded text-xs font-medium shrink-0 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: CUSTOMER REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-neutral-950">
              Customer Reviews & Feedback ({adminData.reviews.length})
            </h1>
            <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200">
              {adminData.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-950">
                        {rev.customerName}
                      </span>
                      <span>·</span>
                      <span>{rev.city}</span>
                      <span>·</span>
                      <span className="font-mono font-semibold text-amber-600">
                        {rev.rating} / 5 Stars
                      </span>
                    </div>
                    <p className="text-sm text-neutral-800 mt-1">{rev.comment}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/reviews/${rev.id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      await fetchAdminData(token);
                      await onStoreUpdated();
                      notify('Review deleted.');
                    }}
                    className="px-3 py-1.5 border border-neutral-200 hover:border-red-600 text-red-600 rounded text-xs font-medium shrink-0 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: STORE SETTINGS, PAYMENTS & POLICIES */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-bold text-neutral-950">
                Store Contact, Payment Gateways & Legal Policies
              </h1>
              <p className="text-sm text-neutral-600">
                Enable or disable individual Pakistan payment methods and update store policies without editing code.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={adminData.settings.whatsappNumber}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      settings: {
                        ...adminData.settings,
                        whatsappNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  WhatsApp Direct Link
                </label>
                <input
                  type="text"
                  value={adminData.settings.whatsappLink}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      settings: {
                        ...adminData.settings,
                        whatsappLink: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Free Shipping Threshold (PKR)
                </label>
                <input
                  type="number"
                  value={adminData.settings.freeShippingThreshold}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      settings: {
                        ...adminData.settings,
                        freeShippingThreshold: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={adminData.settings.supportEmail}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      settings: {
                        ...adminData.settings,
                        supportEmail: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>
            </div>

            {/* Payment Gateways Enable/Disable */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 text-xs">
              <h2 className="text-base font-bold text-neutral-950">
                Pakistan Payment Methods Configuration
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'codEnabled', label: 'Cash on Delivery (COD)' },
                  { key: 'easypaisaEnabled', label: 'Easypaisa Wallet' },
                  { key: 'jazzcashEnabled', label: 'JazzCash Wallet' },
                  { key: 'raastEnabled', label: 'Raast Instant Transfer' },
                  { key: 'bankTransferEnabled', label: 'Bank IBAN Transfer' },
                ].map((pm) => (
                  <label
                    key={pm.key}
                    className="flex items-center gap-2 font-semibold text-neutral-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(
                        adminData.settings.paymentConfig?.[
                          pm.key as keyof typeof adminData.settings.paymentConfig
                        ]
                      )}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          settings: {
                            ...adminData.settings,
                            paymentConfig: {
                              ...adminData.settings.paymentConfig,
                              [pm.key]: e.target.checked,
                            },
                          },
                        })
                      }
                    />
                    {pm.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-neutral-950">
                Editable Store Policies
              </h2>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  About Us
                </label>
                <textarea
                  rows={2}
                  value={adminData.settings.policies.aboutUs}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      settings: {
                        ...adminData.settings,
                        policies: {
                          ...adminData.settings.policies,
                          aboutUs: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Delivery Policy
                </label>
                <textarea
                  rows={2}
                  value={adminData.settings.policies.deliveryPolicy}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      settings: {
                        ...adminData.settings,
                        policies: {
                          ...adminData.settings.policies,
                          deliveryPolicy: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Return & Refund Policy
                </label>
                <textarea
                  rows={2}
                  value={adminData.settings.policies.returnRefundPolicy}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      settings: {
                        ...adminData.settings,
                        policies: {
                          ...adminData.settings.policies,
                          returnRefundPolicy: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Save All Store Settings & Policies
              </button>
            </div>
          </form>
        )}

        {/* TAB 11: DEPLOYMENT, AUDIT LOGS & DOCUMENTATION */}
        {activeTab === 'docs' && (
          <div className="space-y-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-neutral-950">
              Deployment Guide, Security Audit Logs & Merchant Integrations
            </h1>

            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-3 text-xs">
              <h2 className="text-base font-bold text-neutral-950">
                Recent Administrator Security Audit Logs
              </h2>
              <div className="divide-y divide-neutral-100 max-h-56 overflow-y-auto">
                {(adminData.auditLogs || []).map((log) => (
                  <div
                    key={log.id}
                    className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono font-bold text-red-600">
                        {log.action}
                      </span>{' '}
                      — <span>{log.details}</span>
                    </div>
                    <span className="font-mono text-neutral-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 text-sm text-neutral-700">
              <h2 className="text-base font-bold text-neutral-950">
                Production Deployment & Merchant Credentials Guide
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Database & Backups:</strong> All products, categories, customer accounts, orders, timestamped status histories, coupons, and tickets persist in <code>/data/carry_cart_db.json</code> with atomic file writes. Back up the <code>/data</code> directory daily via cron or object storage.
                </li>
                <li>
                  <strong>Card Payment Gateway (Safepay / PayFast / AlfaPayment):</strong> Requires an approved Pakistani corporate merchant account, NTN, and server-side webhook secret (`SAFEPAY_WEBHOOK_SECRET`). Until configured, card gateway checkout remains safely disabled while Cash on Delivery (COD), Raast, Easypaisa, JazzCash, and Bank IBAN transfers work out-of-the-box.
                </li>
                <li>
                  <strong>WhatsApp Integration (+966 50 170 1709):</strong> Click-to-Chat product inquiries, cart inquiries, and order receipts work immediately at zero cost. Automated background WhatsApp Business Cloud API messages require a paid Meta Business Account and approved templates.
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT CREATE / EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-4">
              <h2 className="text-lg font-bold text-neutral-950">
                {editingProduct
                  ? `Edit Product: ${editingProduct.name}`
                  : 'Add New Marketplace Product'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Product Name (Urdu — Optional)
                  </label>
                  <input
                    type="text"
                    value={prodForm.nameUr}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, nameUr: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={prodForm.brand}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={prodForm.categoryId}
                    onChange={(e) => {
                      const selectedCat = adminData.categories.find(
                        (c) => c.id === e.target.value
                      );
                      setProdForm({
                        ...prodForm,
                        categoryId: e.target.value,
                        subcategory:
                          selectedCat?.subcategories[0] || 'General',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    {adminData.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={prodForm.subcategory}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, subcategory: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Regular Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodForm.price}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Discounted Sale Price (PKR — Leave blank if none)
                  </label>
                  <input
                    type="number"
                    value={prodForm.discountedPrice}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        discountedPrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={prodForm.stock}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Delivery Estimate
                  </label>
                  <input
                    type="text"
                    value={prodForm.deliveryEstimate}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        deliveryEstimate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Detailed Product Description
                </label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>

              {/* Multiple Images Upload */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-neutral-900">
                    Product Images ({prodForm.images.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white rounded-lg cursor-pointer hover:bg-neutral-800">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateStudioVisual}
                      className="px-3 py-1.5 border border-neutral-300 bg-white rounded-lg hover:border-neutral-900 cursor-pointer"
                    >
                      + Generate Studio View
                    </button>
                  </div>
                </div>

                {prodForm.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {prodForm.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative group aspect-[4/3] rounded overflow-hidden border border-neutral-300 bg-white"
                      >
                        <SafeProductImage
                          src={img}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setProdForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-90 hover:opacity-100 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collection Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {[
                  { key: 'isPublished', label: 'Published Live' },
                  { key: 'isTrending', label: 'Trending Section' },
                  { key: 'isBestSeller', label: 'Best Seller' },
                  { key: 'isNewArrival', label: 'New Arrival' },
                  { key: 'isFlashSale', label: 'Flash Sale / Discount' },
                  { key: 'isRecommended', label: 'Recommended' },
                ].map((flag) => (
                  <label
                    key={flag.key}
                    className="flex items-center gap-2 font-medium text-neutral-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(
                        prodForm[flag.key as keyof typeof prodForm]
                      )}
                      onChange={(e) =>
                        setProdForm({
                          ...prodForm,
                          [flag.key]: e.target.checked,
                        })
                      }
                    />
                    {flag.label}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
