import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, AlertTriangle, Check } from 'lucide-react';
import ImageSlider from '../common/ImageSlider';
import Badge from '../common/Badge';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  if (!product) return null;

  const currentCartItem = items.find((i) => i.productId === product._id);
  const inCartQty = currentCartItem ? currentCartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isMaxInCart = inCartQty >= product.stock;

  const handleCardClick = () => {
    navigate(`/product/${product.slug || product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInCart) return;
    addToCart(product, 1);
  };

  const categoryColor = product.categoryId?.colorKey || 'crimson';

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-[#EAE6DF] p-3.5 sm:p-4 cursor-pointer group flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-[#D1C9BE]"
    >
      <div>
        {/* In-Card Image Carousel */}
        <div className="relative rounded-lg overflow-hidden border border-gray-100 bg-[#FBF9F6]">
          <ImageSlider
            images={product.images}
            alt={product.name}
            aspectRatio="aspect-square"
            showArrows={true}
            showDots={true}
            compact={true}
          />

          {/* Category Chip */}
          {product.categoryId && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <Badge color={categoryColor} size="xs">
                {product.categoryId.name}
              </Badge>
            </div>
          )}

          {/* Stock Warning Badge */}
          {isOutOfStock ? (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="bg-[#1A181E] text-white text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md shadow-sm">
                Out of Stock
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="bg-[#FFF5F5] text-[#B21818] border border-[#F3C1C1] text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <AlertTriangle size={10} />
                Only {product.stock} left
              </span>
            </div>
          ) : null}
        </div>

        {/* Product Details */}
        <div className="mt-3.5">
          <h3 className="font-heading font-bold text-base sm:text-lg text-[#1A181E] leading-snug line-clamp-2 group-hover:text-[#B21818] transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
            {product.description || 'Premium event decor prop available for rental and booking.'}
          </p>
        </div>
      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="mt-4 pt-3 border-t border-[#F0ECE6] flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block">
            Rental Rate
          </span>
          <span className="font-heading font-bold text-lg sm:text-xl text-[#1A181E]">
            ₹{product.price.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMaxInCart}
          aria-label={`Add ${product.name} to cart`}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isMaxInCart
              ? 'bg-[#FAF6F2] text-[#B21818] border border-[#E8D0D0]'
              : 'bg-[#B21818] text-white hover:bg-[#8F1313] active:scale-95 shadow-sm'
          }`}
        >
          {isOutOfStock ? (
            <span>Unavailable</span>
          ) : isMaxInCart ? (
            <>
              <Check size={13} strokeWidth={2.5} />
              <span>In Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag size={13} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
