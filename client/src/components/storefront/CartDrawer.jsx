import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import FunkyButton from '../common/FunkyButton';
import CheckoutModal from './CheckoutModal';

export default function CartDrawer() {
  const {
    items,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-panel-bg border-l-3 border-ink shadow-funky-lg flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b-3 border-ink flex items-center justify-between bg-yellow/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow border-2 border-ink flex items-center justify-center shadow-[2px_2px_0px_#161221]">
              <ShoppingBag size={16} strokeWidth={2.5} />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              Your Cart ({cartCount})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white border-2 border-ink flex items-center justify-center shadow-[2px_2px_0px_#161221] hover:bg-pink hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Drawer Body: Items list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-yellow/50 border-3 border-ink flex items-center justify-center text-4xl mb-4 shadow-funky">
                🎪
              </div>
              <h3 className="font-heading font-extrabold text-xl text-ink">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-600 mt-1 max-w-xs mx-auto">
                Explore our props catalog and add statement pieces for your upcoming event!
              </p>
              <div className="mt-6">
                <FunkyButton
                  variant="yellow"
                  size="md"
                  onClick={() => setIsCartOpen(false)}
                >
                  Start Browsing
                </FunkyButton>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const isCapped = item.stock && item.quantity >= item.stock;

              return (
                <div
                  key={item.productId}
                  className="sticker-panel-sm p-3 bg-white flex gap-3 items-center shadow-[3px_3px_0px_#161221]"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-ink shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-extrabold text-sm text-ink leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-pink mt-0.5">
                      ₹{item.price.toFixed(2)} each
                    </p>

                    {item.stock && item.stock <= 5 && (
                      <span className="text-[10px] font-bold text-amber-700 block">
                        Only {item.stock} left in stock
                      </span>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center rounded-full border-2 border-ink bg-panel-bg shadow-[1px_1px_0px_#161221]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-yellow rounded-l-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="px-2 text-xs font-extrabold text-ink min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={isCapped}
                          className={`w-6 h-6 flex items-center justify-center rounded-r-full transition-colors ${
                            isCapped
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'hover:bg-yellow'
                          }`}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-[#ff4d4d] p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <span className="font-heading font-extrabold text-base text-ink block">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t-3 border-ink bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-600">Estimated Total:</span>
              <span className="font-heading font-extrabold text-2xl text-ink">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-panel-bg p-2 rounded-xl border border-ink">
              <ShieldCheck size={14} className="text-pink shrink-0" />
              <span>Stock is re-validated in real-time before booking submission.</span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full btn-funky bg-lime text-ink py-3 text-base flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} strokeWidth={3} />
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-bold text-gray-500 hover:text-ink text-center py-1 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
        }}
      />
    </>
  );
}
