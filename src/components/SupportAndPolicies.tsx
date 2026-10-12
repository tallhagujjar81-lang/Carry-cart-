import React, { useState } from 'react';
import { StoreSettings, CityDeliveryConfig, SupportTicket } from '../types.ts';
import { formatPKR } from '../utils/formatters.tsx';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  FileText,
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  Search,
} from 'lucide-react';

interface SupportAndPoliciesProps {
  settings: StoreSettings;
  cities: CityDeliveryConfig[];
  initialSection?: 'contact' | 'policies' | 'faq' | 'about';
  onBackToStore: () => void;
}

export const SupportAndPoliciesView: React.FC<SupportAndPoliciesProps> = ({
  settings,
  cities,
  onBackToStore,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('Order / Product Inquiry');
  const [message, setMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  // Ticket Lookup
  const [lookupQuery, setLookupQuery] = useState('');
  const [foundTickets, setFoundTickets] = useState<SupportTicket[]>([]);

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone,
          email,
          orderNumber,
          subject,
          message,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setCreatedTicket(data.ticket);
        setMessage('');
      }
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleOpenWhatsAppWithDetails = () => {
    const baseUrl = (settings.whatsappLink || 'https://wa.me/966501701709').split('?')[0];
    const text = `Assalam-o-Alaikum CARRY CART Support!\n\nName: ${name || 'Customer'}\nMobile: ${
      phone || 'N/A'
    }\nOrder #: ${orderNumber || 'N/A'}\nTopic: ${subject}\nMessage: ${message}`;
    window.open(
      `${baseUrl}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleLookupTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    const res = await fetch(
      `/api/tickets/lookup?q=${encodeURIComponent(lookupQuery.trim())}`
    );
    if (res.ok) {
      const data = await res.json();
      setFoundTickets(data.tickets || []);
    }
  };

  const faqs = settings.faqs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <button
        onClick={onBackToStore}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-red-600 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Storefront
      </button>

      {/* Contact Us, Support Ticket Submission & WhatsApp Concierge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-mono text-red-600 uppercase tracking-wider">
              CUSTOMER SUPPORT & CONCIERGE
            </span>
            <h1 className="text-3xl font-bold text-neutral-950 mt-1">
              Contact CARRY CART Pakistan
            </h1>
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
              Submit an official support ticket with your Order Number below or chat directly with our team on WhatsApp for immediate assistance.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950 text-white space-y-5 border border-neutral-800">
            <div className="flex items-start gap-3.5">
              <Phone className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-neutral-400">
                  Official Support & WhatsApp Number
                </div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {settings.whatsappNumber}
                </div>
                <a
                  href={settings.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat Directly on WhatsApp
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-4 border-t border-neutral-800">
              <Mail className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-neutral-400">Customer Care Email</div>
                <div className="text-sm font-medium text-white mt-0.5">
                  {settings.supportEmail}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-4 border-t border-neutral-800">
              <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-neutral-400">
                  Configured Operations Details
                </div>
                <div className="text-sm font-medium text-white mt-0.5">
                  {settings.headquarters}
                </div>
              </div>
            </div>
          </div>

          {/* Check Existing Support Ticket Response */}
          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
            <h3 className="font-bold text-neutral-950">
              Check Support Ticket Status & Admin Reply
            </h3>
            <form onSubmit={handleLookupTickets} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Ticket # (TKT-9012) or Order # (CC-849202)"
                  className="w-full pl-8 pr-3 py-2 rounded border border-neutral-300 bg-white font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded bg-neutral-950 text-white font-semibold cursor-pointer"
              >
                Check
              </button>
            </form>
            {foundTickets.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-lg bg-white border border-neutral-200 space-y-1.5"
              >
                <div className="flex justify-between font-mono font-bold">
                  <span>{t.ticketNumber}</span>
                  <span className="text-red-600">{t.status}</span>
                </div>
                <p className="text-neutral-700">{t.message}</p>
                {t.adminResponse && (
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-200 text-neutral-900">
                    <strong>Support Reply:</strong> {t.adminResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket & WhatsApp Enquiry Form */}
        <form
          onSubmit={handleCreateSupportTicket}
          className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-4"
        >
          <h2 className="text-xl font-bold text-neutral-950">
            Submit a Customer Support Enquiry
          </h2>
          <p className="text-xs text-neutral-500">
            Log an official support ticket in our database or forward your inquiry directly to WhatsApp (<strong>{settings.whatsappNumber}</strong>).
          </p>

          {createdTicket && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>
                  Support Ticket {createdTicket.ticketNumber} Created!
                </span>
              </div>
              <p>
                Our support specialists have received your inquiry and will respond shortly. You can check the status anytime using ticket number <strong>{createdTicket.ticketNumber}</strong>.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Hassan Ali"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Your Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Order Number (If applicable)
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., CC-849201"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1.5">
                Inquiry Topic
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm bg-white"
              >
                <option value="Order / Product Inquiry">
                  Order or Product Inquiry
                </option>
                <option value="Cash on Delivery Verification">
                  Cash on Delivery (COD) Verification
                </option>
                <option value="7-Day Return or Size Exchange">
                  7-Day Return or Size Exchange
                </option>
                <option value="Payment / Refund Assistance">
                  Payment or Refund Assistance
                </option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-neutral-800 mb-1.5">
              Description of Your Question or Issue *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe how we can help..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submittingTicket}
              className="flex-1 py-3 px-5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {submittingTicket ? 'Submitting Ticket...' : 'Submit Official Support Ticket'}
            </button>
            <button
              type="button"
              onClick={handleOpenWhatsAppWithDetails}
              className="flex-1 py-3 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp ({settings.whatsappNumber})
            </button>
          </div>
        </form>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      {faqs.length > 0 && (
        <div className="pt-8 border-t border-neutral-200 space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-2xl font-bold text-neutral-950">
              Frequently Asked Questions (FAQ)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-6 rounded-xl border border-neutral-200 bg-white space-y-2"
              >
                <span className="text-[11px] font-mono text-red-600 uppercase">
                  {faq.category}
                </span>
                <h3 className="text-sm font-bold text-neutral-950">
                  {faq.question}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About Us & All Editable Legal Policies */}
      <div className="pt-8 border-t border-neutral-200 space-y-6">
        <h2 className="text-2xl font-bold text-neutral-950">
          About CARRY CART & Store Policies
        </h2>

        <div className="p-6 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
          <h3 className="text-sm font-bold text-neutral-950">About Us</h3>
          <p className="text-xs text-neutral-700 leading-relaxed">
            {settings.policies.aboutUs}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-neutral-200 bg-white space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
              <Truck className="w-4 h-4 text-red-600" />
              <span>Shipping & Delivery Policy</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {settings.policies.deliveryPolicy}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-neutral-200 bg-white space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
              <RotateCcw className="w-4 h-4 text-red-600" />
              <span>7-Day Return, Exchange & Refund Policy</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {settings.policies.returnRefundPolicy}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-neutral-200 bg-white space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
              <FileText className="w-4 h-4 text-red-600" />
              <span>Order Cancellation Policy</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {settings.policies.cancellationPolicy}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-neutral-200 bg-white space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Privacy Policy & Terms and Conditions</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {settings.policies.privacyPolicy}
            </p>
            {settings.policies.termsAndConditions && (
              <p className="text-xs text-neutral-500 leading-relaxed pt-2 border-t border-neutral-100">
                <strong>Terms:</strong> {settings.policies.termsAndConditions}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pakistan City Delivery Rates Table */}
      <div className="pt-8 border-t border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-neutral-950">
            Pakistan City-by-City Courier Tariff & COD Coverage
          </h2>
          <span className="text-xs text-emerald-700 font-semibold">
            Free Delivery on All Orders Above {formatPKR(settings.freeShippingThreshold)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Province / Territory</th>
                  <th className="py-3 px-4">Standard Courier Rate</th>
                  <th className="py-3 px-4">Estimated Transit Time</th>
                  <th className="py-3 px-4">Cash on Delivery (COD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {cities
                  .filter((c) => c.active)
                  .map((c) => (
                    <tr key={c.city}>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">
                        {c.city}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600">{c.province}</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums font-semibold">
                        {formatPKR(c.deliveryFee)}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-700">
                        {c.estimatedDays}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-700 font-medium">
                        {c.codAvailable ? 'Available' : 'Prepaid Only'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
