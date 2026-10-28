import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MessageCircle, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import FunkyButton from '../common/FunkyButton';
import { useCart } from '../../context/CartContext';
import api from '../../api/client';

export default function CheckoutModal({ isOpen, onClose, onSuccess }) {
  const { items, cartTotal, clearCart, validateCartWithServer } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [stockErrors, setStockErrors] = useState([]);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStockErrors([]);

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMsg('Please enter a valid phone or WhatsApp number.');
      return;
    }

    if (!customerAddress.trim()) {
      setErrorMsg('Please enter your delivery or event venue address.');
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Pre-flight stock check
      const validation = await validateCartWithServer();
      if (!validation.valid) {
        setSubmitting(false);
        setErrorMsg('Some items in your cart had stock changes. We updated your quantities. Please review and submit again.');
        return;
      }

      // Step 2: Submit order enquiry
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        notes: notes.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          priceAtOrder: item.price,
        })),
      };

      const res = await api.post('/public/orders', payload);

      if (res.data?.success) {
        setCompletedOrder(res.data.order);
        setWhatsappUrl(res.data.whatsappUrl);
        clearCart();

        // Trigger celebratory confetti
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });

        if (onSuccess) onSuccess();
      }
    } catch (err) {
      if (err.raw?.response?.data?.stockErrors) {
        setStockErrors(err.raw.response.data.stockErrors);
        setErrorMsg('Stock availability has changed since you added items.');
      } else {
        setErrorMsg(err.message || 'Failed to submit enquiry. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCompletedOrder(null);
    setWhatsappUrl('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setNotes('');
    setErrorMsg('');
    setStockErrors([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={completedOrder ? 'Enquiry Confirmed' : 'Prop Reservation Enquiry'}
      maxWidth="max-w-xl"
    >
      {completedOrder ? (
        /* Order Confirmation View */
        <div className="space-y-5 text-center py-2 animate-in fade-in">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF5F5] border border-[#E8D0D0] flex items-center justify-center text-[#B21818]">
            <CheckCircle2 size={30} />
          </div>

          <div>
            <h4 className="font-heading font-bold text-xl text-[#1A181E]">
              Thank you, {completedOrder.customerName}!
            </h4>
            <p className="text-xs font-semibold text-[#B21818] mt-1">
              Booking Ref: #{completedOrder.orderNumber}
            </p>
            {completedOrder.customerAddress && (
              <p className="text-xs text-gray-600 mt-1">
                📍 {completedOrder.customerAddress}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
              Your prop enquiry has been logged. Our team has received your details and will coordinate confirmation promptly.
            </p>
          </div>

          {/* Primary Call to Action: WhatsApp */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-200 text-left">
            <p className="text-xs font-semibold text-[#1A181E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageCircle size={15} className="text-emerald-600" /> Fast-Track via WhatsApp:
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Click below to send your pre-filled reservation summary directly to our WhatsApp number for immediate verification.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircle size={18} />
              <span>Send Order on WhatsApp</span>
            </a>
          </div>

          {/* Itemized summary */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-left text-xs space-y-1.5 shadow-sm">
            <div className="font-semibold text-gray-700 pb-1 border-b border-gray-200 flex justify-between">
              <span>Itemized Summary</span>
              <span>Total: ₹{completedOrder.totalAmount?.toFixed(2)}</span>
            </div>
            {completedOrder.items?.map((it, idx) => (
              <div key={idx} className="flex justify-between text-gray-600">
                <span>
                  {it.name} x {it.quantity}
                </span>
                <span className="font-medium text-[#1A181E]">
                  ₹{(it.priceAtOrder * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:border-gray-400 hover:text-black transition-colors"
            >
              Done / Return to Catalog
            </button>
          </div>
        </div>
      ) : (
        /* Checkout Form View */
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <div className="text-xs text-gray-600 bg-[#FAF8F5] p-3 rounded-xl border border-gray-200">
            ✨ <strong>No card or upfront payment needed!</strong> Submit your details and our team will verify availability and confirm your booking.
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2">
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p>{errorMsg}</p>
                {stockErrors.length > 0 && (
                  <ul className="list-disc list-inside mt-1 space-y-0.5 font-normal">
                    {stockErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Form Inputs */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Patel"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#B21818] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Phone / WhatsApp Number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#B21818] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Event Venue / Delivery Address *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Banquet Hall A, Royal Orchid Resort, MG Road, Bengaluru"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#B21818] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Event Date / Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Wedding reception on 28th October, require setup by 4 PM."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#B21818] transition-colors resize-none"
            />
          </div>

          {/* Order Summary Pill */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Selected Props ({items.length})
              </span>
              <span className="text-xs text-gray-700 line-clamp-1 font-medium">
                {items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
              </span>
            </div>
            <div className="text-right pl-3 shrink-0">
              <span className="text-[10px] font-medium text-gray-500 uppercase block">
                Estimated Total
              </span>
              <span className="font-heading font-bold text-lg text-[#1A181E]">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium flex-1 transition-colors"
            >
              Back to Cart
            </button>

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="px-6 py-2.5 rounded-lg bg-[#B21818] text-white hover:bg-[#8F1313] text-sm font-semibold flex-[2] flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Order Enquiry</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
