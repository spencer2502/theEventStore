import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  AlertTriangle,
  MessageCircle,
  Loader2,
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
        <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center gap-3">
          <Loader2 size={36} className="text-[#B21818] animate-spin" />
          <span className="font-medium text-base text-gray-700">Loading prop details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-4">
          <div className="text-4xl">✨</div>
          <h2 className="font-heading font-bold text-2xl text-[#1A181E]">Prop Not Found</h2>
          <p className="text-sm text-gray-600">The prop you are looking for might have been moved or deactivated.</p>
          <Link to="/categories">
            <FunkyButton variant="crimson" size="md">
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

  const categoryColor = product.categoryId?.colorKey || 'crimson';

  return (
    <div className="w-full py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:text-[#B21818] hover:border-[#B21818] transition-colors shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Back to Catalog</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl border border-[#EAE6DF] p-6 sm:p-8 shadow-sm">
          {/* Left Column: Full Image Gallery */}
          <div>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-[#FBF9F6]">
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
              <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 hover:border-[#B21818] transition-colors cursor-pointer"
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
                    <AlertTriangle size={12} />
                    Only {product.stock} Left
                  </Badge>
                ) : (
                  <Badge color="success" size="sm">
                    In Stock ({product.stock} Available)
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A181E] leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-heading font-bold text-3xl sm:text-4xl text-[#1A181E]">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  / Rental Rate
                </span>
              </div>

              {/* Description */}
              <div className="mt-6 pt-5 border-t border-[#F0ECE6]">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Prop Description & Specs
                </h3>
                <p className="text-sm font-normal text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description || 'Stunning decorative prop, perfect for weddings, birthdays, baby showers, and commercial photoshoots.'}
                </p>
              </div>

              {/* In-cart notice if already added */}
              {inCartQty > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-[#FAF6F2] border border-[#E8D0D0] text-xs font-medium text-[#8F1313] flex items-center gap-2">
                  <Check size={15} className="text-[#B21818]" />
                  <span>You have {inCartQty} unit(s) of this prop currently in your cart.</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-[#F0ECE6] space-y-3">
              {/* Quantity Selector + Add to Cart */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {!isOutOfStock && remainingStock > 0 && (
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3.5 py-2.5 rounded-lg border border-gray-300">
                    <span className="text-xs font-medium text-gray-500 uppercase">Qty:</span>
                    <select
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(parseInt(e.target.value, 10))}
                      className="bg-transparent font-bold text-sm text-[#1A181E] outline-none cursor-pointer"
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
                  className={`flex-1 py-3 px-5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock || remainingStock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#B21818] text-white hover:bg-[#8F1313] active:scale-[0.99] shadow-sm'
                  }`}
                >
                  <ShoppingBag size={17} />
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
                className="w-full py-2.5 px-4 rounded-lg border border-gray-300 bg-white hover:border-[#B21818] hover:text-[#B21818] text-xs sm:text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <MessageCircle size={16} className="text-[#B21818]" />
                <span>Enquire Specifically About This Prop on WhatsApp</span>
              </a>

              {/* Added Feedback Toast */}
              {addedMessage && (
                <div className="p-3 rounded-lg bg-[#FAF6F2] border border-[#E8D0D0] text-xs font-semibold text-[#8F1313] text-center shadow-sm">
                  {addedMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
