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

  const categoryColor = product.categoryId?.colorKey || 'yellow';

  return (
    <div
      onClick={handleCardClick}
      className="sticker-panel bg-panel-bg p-3.5 sm:p-4 cursor-pointer group flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0px_#161221]"
    >
      <div>
        {/* In-Card Image Carousel */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-ink shadow-[3px_3px_0px_#161221] bg-white">
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
              <span className="bg-[#ff4d4d] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-ink shadow-[1px_1px_0px_#161221]">
                Out of Stock
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="bg-yellow text-ink text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-ink shadow-[1px_1px_0px_#161221] flex items-center gap-1">
                <AlertTriangle size={10} strokeWidth={3} />
                Only {product.stock} left!
              </span>
            </div>
          ) : null}
        </div>

        {/* Product Details */}
        <div className="mt-3.5">
          <h3 className="font-heading font-extrabold text-lg sm:text-xl text-ink leading-snug line-clamp-2 group-hover:text-pink transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'Premium event decor prop available for rental and booking.'}
          </p>
        </div>
      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="mt-4 pt-3 border-t-2 border-ink flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            Listed Price
          </span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-ink">
            ₹{product.price.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMaxInCart}
          aria-label={`Add ${product.name} to cart`}
          className={`btn-funky px-3.5 sm:px-4 py-2 text-xs flex items-center gap-1.5 ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed shadow-none'
              : isMaxInCart
              ? 'bg-panel-bg text-ink border-ink'
              : 'bg-yellow text-ink hover:bg-lime'
          }`}
        >
          {isOutOfStock ? (
            <span>Sold Out</span>
          ) : isMaxInCart ? (
            <>
              <Check size={14} strokeWidth={3} />
              <span>Max in Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} strokeWidth={2.5} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
