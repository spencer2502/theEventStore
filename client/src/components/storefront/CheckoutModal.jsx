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
          particleCount: 80,
          spread: 70,
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
      title={completedOrder ? 'Enquiry Submitted! 🎉' : 'Instant Checkout & Enquiry'}
      maxWidth="max-w-xl"
    >
      {completedOrder ? (
        /* Order Confirmation View */
        <div className="space-y-5 text-center py-2 animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-lime border-3 border-ink flex items-center justify-center shadow-funky">
            <CheckCircle2 size={36} className="text-ink" strokeWidth={2.5} />
          </div>

          <div>
            <h4 className="font-heading font-extrabold text-2xl text-ink">
              Thank you, {completedOrder.customerName}!
            </h4>
            <p className="text-sm font-bold text-pink mt-1">
              Order Ref: #{completedOrder.orderNumber}
            </p>
            {completedOrder.customerAddress && (
              <p className="text-xs text-gray-700 font-semibold mt-1">
                📍 {completedOrder.customerAddress}
              </p>
            )}
            <p className="text-xs text-gray-700 mt-2 max-w-md mx-auto leading-relaxed">
              Your prop enquiry has been logged into our system and automatically sent to our team's Telegram channel.
            </p>
          </div>

          {/* Primary Call to Action: WhatsApp */}
          <div className="p-4 rounded-2xl bg-yellow/40 border-3 border-ink shadow-[4px_4px_0px_#161221] text-left">
            <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageCircle size={16} className="text-green-600" /> Fast-Track on WhatsApp:
            </p>
            <p className="text-xs text-gray-700 mb-3">
              Click below to send your pre-filled order summary directly to our store's WhatsApp number for instant confirmation!
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-funky bg-[#25D366] text-white py-3.5 text-base flex items-center justify-center gap-2 hover:bg-[#20bd5a]"
            >
              <MessageCircle size={20} strokeWidth={2.5} />
              <span>Send Order on WhatsApp</span>
            </a>
          </div>

          {/* Itemized summary */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-ink text-left text-xs space-y-1.5 shadow-[2px_2px_0px_#161221]">
            <div className="font-bold text-gray-700 pb-1 border-b border-gray-300 flex justify-between">
              <span>Itemized Summary</span>
              <span>Total: ₹{completedOrder.totalAmount?.toFixed(2)}</span>
            </div>
            {completedOrder.items?.map((it, idx) => (
              <div key={idx} className="flex justify-between text-gray-800">
                <span>
                  {it.name} x {it.quantity}
                </span>
                <span className="font-bold">
                  ₹{(it.priceAtOrder * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <FunkyButton variant="white" size="md" onClick={handleResetAndClose}>
              Done / Continue Browsing
            </FunkyButton>
          </div>
        </div>
      ) : (
        /* Checkout Form View */
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <p className="text-xs font-semibold text-gray-700 bg-yellow/40 p-2.5 rounded-xl border-2 border-ink">
            ✨ <strong>No account or card needed!</strong> Just submit your name, phone, and event address. Our team reviews your booking and confirms via WhatsApp & phone.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 border-2 border-[#ff4d4d] text-ink text-xs font-bold flex items-start gap-2 shadow-[2px_2px_0px_#161221]">
              <AlertCircle size={16} className="text-[#ff4d4d] shrink-0 mt-0.5" />
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
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Patel"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full funky-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Phone / WhatsApp Number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full funky-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Event Venue / Delivery Address *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Banquet Hall A, Royal Orchid Resort, MG Road, Bengaluru"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full funky-input text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Event Date / Special Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Wedding reception on 28th October, require setup by 4 PM."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full funky-input text-sm resize-none"
            />
          </div>

          {/* Order Summary Pill */}
          <div className="p-3 rounded-xl bg-white border-2 border-ink shadow-[2px_2px_0px_#161221] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 block">
                Order Items ({items.length} props)
              </span>
              <span className="text-xs text-gray-700">
                {items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
              </span>
            </div>
            <div className="text-right pl-3 shrink-0">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">
                Est. Total
              </span>
              <span className="font-heading font-extrabold text-xl text-ink">
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
              className="btn-funky bg-white text-ink px-4 py-3 text-sm flex-1"
            >
              Back to Cart
            </button>

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="btn-funky bg-lime text-ink px-6 py-3 text-sm font-extrabold flex-[2] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Validating Stock...</span>
                </>
              ) : (
                <>
                  <span>Submit Order Enquiry</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
