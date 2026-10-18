import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  AlertTriangle,
  MessageCircle,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import ImageSlider from '../../components/common/ImageSlider';
import Badge from '../../components/common/Badge';
import FunkyButton from '../../components/common/FunkyButton';
import { useCart } from '../../context/CartContext';
import api from '../../api/client';

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [idOrSlug]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/products/${idOrSlug}`);
      if (res.data?.success) {
        setProduct(res.data.product);
      }
    } catch (err) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="sticker-panel p-12 shadow-funky flex flex-col items-center justify-center gap-3">
          <Loader2 size={40} className="text-pink animate-spin" />
          <span className="font-heading font-bold text-xl text-ink">Loading prop details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="sticker-panel p-8 shadow-funky space-y-4">
          <div className="text-5xl">🎪</div>
          <h2 className="font-heading font-extrabold text-2xl text-ink">Prop Not Found</h2>
          <p className="text-sm text-gray-600">The prop you are looking for might have been moved or deactivated.</p>
          <Link to="/categories">
            <FunkyButton variant="yellow" size="md">
              Back to Catalog
            </FunkyButton>
          </Link>
        </div>
      </div>
    );
  }

  const currentCartItem = items.find((i) => i.productId === product._id);
  const inCartQty = currentCartItem ? currentCartItem.quantity : 0;
  const remainingStock = Math.max(0, product.stock - inCartQty);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const maxAllowedToSelect = Math.min(remainingStock, product.stock);

  const handleAddToCart = () => {
    if (selectedQty <= 0 || isOutOfStock) return;
    const result = addToCart(product, selectedQty);
    setAddedMessage(result.message);
    setTimeout(() => setAddedMessage(''), 3500);
  };

  const storePhone = '918962690000';
  const whatsappPropEnquiryUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(
    `Hi THE EVENT STORE! I'm interested in booking "${product.name}" (₹${product.price}). Is it available for my date?`
  )}`;

  const categoryColor = product.categoryId?.colorKey || 'yellow';

  return (
    <div className="w-full py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-funky bg-white text-ink px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
            <span>Back to Catalog</span>
          </button>
        </div>

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Full Image Gallery */}
          <div>
            <div className="rounded-3xl overflow-hidden border-3 border-ink shadow-funky bg-white">
              <ImageSlider
                images={product.images}
                alt={product.name}
                aspectRatio="aspect-[4/3] sm:aspect-square"
                showArrows={true}
                showDots={true}
              />
            </div>

            {/* Thumbnail row if multiple images */}
            {product.images?.length > 1 && (
              <div className="mt-4 flex gap-2.5 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-ink shadow-[2px_2px_0px_#161221]"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Stock Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.categoryId && (
                  <Badge color={categoryColor} size="sm">
                    {product.categoryId.name}
                  </Badge>
                )}

                {isOutOfStock ? (
                  <Badge color="danger" size="sm">
                    Out of Stock
                  </Badge>
                ) : isLowStock ? (
                  <Badge color="warning" size="sm" className="flex items-center gap-1">
                    <AlertTriangle size={12} strokeWidth={3} />
                    Only {product.stock} Left!
                  </Badge>
                ) : (
                  <Badge color="success" size="sm">
                    In Stock ({product.stock} Available)
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  / Booking Rental
                </span>
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t-2 border-ink">
                <h3 className="text-xs font-extrabold text-ink uppercase tracking-wider mb-2">
                  Prop Description & Specs
                </h3>
                <p className="text-sm sm:text-base font-medium text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description || 'Stunning decorative prop, perfect for weddings, birthdays, baby showers, and commercial photoshoots.'}
                </p>
              </div>

              {/* In-cart notice if already added */}
              {inCartQty > 0 && (
                <div className="mt-4 p-3 rounded-2xl bg-yellow/40 border-2 border-ink text-xs font-bold text-ink flex items-center gap-2">
                  <Check size={16} className="text-ink" strokeWidth={3} />
                  <span>You have {inCartQty} unit(s) of this prop currently in your cart.</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t-3 border-ink space-y-3">
              {/* Quantity Selector + Add to Cart */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Quantity input capped at remaining stock */}
                {!isOutOfStock && remainingStock > 0 && (
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-4 py-2.5 rounded-full border-3 border-ink shadow-funky-sm">
                    <span className="text-xs font-extrabold text-gray-600 uppercase">Qty:</span>
                    <select
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(parseInt(e.target.value, 10))}
                      className="bg-transparent font-heading font-extrabold text-base text-ink outline-none cursor-pointer"
                    >
                      {Array.from({ length: Math.min(10, remainingStock) }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

                {/* Add to cart button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || remainingStock === 0}
                  className={`flex-1 btn-funky py-3 text-base flex items-center justify-center gap-2 ${
                    isOutOfStock || remainingStock === 0
                      ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-yellow text-ink hover:bg-lime'
                  }`}
                >
                  <ShoppingBag size={18} strokeWidth={2.5} />
                  <span>
                    {isOutOfStock
                      ? 'Sold Out'
                      : remainingStock === 0
                      ? 'Max Allowed in Cart'
                      : `Add ${selectedQty} to Cart`}
                  </span>
                </button>
              </div>

              {/* Direct WhatsApp enquiry button */}
              <a
                href={whatsappPropEnquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-funky bg-lime text-ink py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle size={17} />
                <span>Enquire Specifically About This Prop on WhatsApp</span>
              </a>

              {/* Added Feedback Toast */}
              {addedMessage && (
                <div className="p-3 rounded-xl bg-lime border-2 border-ink text-xs font-bold text-ink text-center shadow-[2px_2px_0px_#161221] animate-in fade-in">
                  {addedMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
