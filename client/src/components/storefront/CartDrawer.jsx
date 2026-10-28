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
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-[#FDFCF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF5F5] border border-[#E8D0D0] flex items-center justify-center text-[#B21818]">
              <ShoppingBag size={16} />
            </div>
            <h2 className="font-heading font-bold text-xl text-[#1A181E]">
              Selected Props ({cartCount})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#B21818] hover:border-[#B21818] transition-colors"
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body: Items list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF5F5] border border-[#E8D0D0] flex items-center justify-center text-2xl mb-4 text-[#B21818]">
                🎪
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A181E]">
                Your cart is empty
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Explore our props catalog and add statement pieces for your upcoming event.
              </p>
              <div className="mt-5">
                <FunkyButton
                  variant="crimson"
                  size="md"
                  onClick={() => setIsCartOpen(false)}
                >
                  Browse Catalog
                </FunkyButton>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const isCapped = item.stock && item.quantity >= item.stock;

              return (
                <div
                  key={item.productId}
                  className="p-3 bg-[#FAF8F5] rounded-xl border border-gray-200 flex gap-3 items-center"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-[#1A181E] leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#B21818] mt-0.5">
                      ₹{item.price.toFixed(2)} each
                    </p>

                    {item.stock && item.stock <= 5 && (
                      <span className="text-[10px] font-medium text-amber-700 block">
                        Only {item.stock} left in stock
                      </span>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center rounded-md border border-gray-300 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-l-md transition-colors text-gray-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#1A181E] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={isCapped}
                          className={`w-6 h-6 flex items-center justify-center rounded-r-md transition-colors ${
                            isCapped
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-[#B21818] p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-[#1A181E] block">
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
          <div className="p-5 border-t border-gray-200 bg-white space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Total</span>
              <span className="font-heading font-bold text-xl text-[#1A181E]">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 bg-[#FAF8F5] p-2.5 rounded-lg border border-gray-200">
              <ShieldCheck size={14} className="text-[#B21818] shrink-0" />
              <span>Stock is confirmed in real-time before booking.</span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-3 px-4 rounded-lg bg-[#B21818] text-white hover:bg-[#8F1313] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium text-gray-400 hover:text-gray-700 text-center py-1 transition-colors"
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
