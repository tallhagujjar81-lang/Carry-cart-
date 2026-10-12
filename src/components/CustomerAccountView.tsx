import React, { useState } from 'react';
import { CustomerAccount, Order, CityDeliveryConfig } from '../types.ts';
import { formatPKR } from '../utils/formatters.tsx';
import { User, LogOut, KeyRound, Package, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface CustomerAccountViewProps {
  customer: CustomerAccount | null;
  customerToken: string | null;
  customerOrders: Order[];
  cities: CityDeliveryConfig[];
  onAuthSuccess: (token: string, customer: CustomerAccount, orders: Order[]) => void;
  onLogout: () => void;
  onProfileUpdate: (customer: CustomerAccount) => void;
  onTrackOrder: (order: Order) => void;
  onBackToStore: () => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  customer,
  customerToken,
  customerOrders,
  cities,
  onAuthSuccess,
  onLogout,
  onProfileUpdate,
  onTrackOrder,
  onBackToStore,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState(customer?.city || 'Lahore');
  const [postalCode, setPostalCode] = useState(customer?.postalCode || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [marketingConsent, setMarketingConsent] = useState(
    customer?.marketingConsent ?? false
  );

  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not sign in.');
      } else {
        onAuthSuccess(data.token, data.customer, data.orders || []);
      }
    } catch {
      setErrorMsg('Network error while signing in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          city,
          postalCode,
          address,
          marketingConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed.');
      } else {
        onAuthSuccess(data.token, data.customer, []);
      }
    } catch {
      setErrorMsg('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/customer/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Password reset failed.');
      } else {
        setStatusMsg('Password updated! You can now sign in with your new password.');
        setAuthMode('login');
      }
    } catch {
      setErrorMsg('Network error during password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToken) return;
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          name,
          phone,
          city,
          postalCode,
          address,
          marketingConsent,
        }),
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        onProfileUpdate(data.customer);
        setStatusMsg('Profile & delivery address saved.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logged-Out View (Login / Register / Password Recovery)
  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-6">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-red-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Storefront
        </button>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-950 text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-950">
                {authMode === 'login'
                  ? 'Customer Sign In'
                  : authMode === 'register'
                  ? 'Create CARRY CART Account'
                  : 'Reset Customer Password'}
              </h1>
              <p className="text-xs text-neutral-500">
                Manage saved Pakistan delivery addresses, wishlist, and order history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-md cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-md cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('reset');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-md cursor-pointer ${
                authMode === 'reset'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600'
              }`}
            >
              Reset Password
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {statusMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              {statusMsg}
            </div>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In to My Account'}
              </button>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ali Raza"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ali.raza@example.pk"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Pakistani Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
                  >
                    {cities.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Default Delivery Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street #, Sector / Phase"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Create Password (Min 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-neutral-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                />
                <span>Opt-in to receive discount coupons & restock updates</span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Create Customer Account'}
              </button>
            </form>
          )}

          {authMode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Registered Pakistani Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  New Password (Min 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 inline mr-1.5" />
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Logged-In Customer Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-xs font-mono text-red-600 uppercase tracking-wider">
            VERIFIED CUSTOMER ACCOUNT
          </span>
          <h1 className="text-2xl font-bold text-neutral-950 mt-0.5">
            Welcome back, {customer.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold hover:border-neutral-950 cursor-pointer"
          >
            Continue Shopping
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-950 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Saved Profile & Address */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-6 space-y-4 h-fit text-xs"
        >
          <h2 className="text-base font-bold text-neutral-950">
            Saved Profile & Default Pakistan Delivery Address
          </h2>
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Street / House Delivery Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-neutral-950 hover:bg-red-600 text-white font-semibold transition-colors cursor-pointer"
          >
            Save Address & Settings
          </button>
        </form>

        {/* Customer Order History */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-950 flex items-center gap-2">
            <Package className="w-4 h-4 text-red-600" />
            <span>My Order History ({customerOrders.length})</span>
          </h2>

          {customerOrders.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">
              You have not placed any orders under this account yet.
            </p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {customerOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-sm text-neutral-950">
                      {ord.orderNumber}
                    </div>
                    <div className="text-neutral-500">
                      {new Date(ord.createdAt).toLocaleDateString()} ·{' '}
                      {ord.items.length} item(s) · {formatPKR(ord.total)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-red-600">{ord.status}</span>
                    <button
                      onClick={() => onTrackOrder(ord)}
                      className="px-3 py-1.5 rounded border border-neutral-300 hover:border-neutral-950 font-semibold cursor-pointer"
                    >
                      View Status Timeline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
