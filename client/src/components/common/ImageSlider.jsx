import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageSlider({
  images = [],
  alt = 'Product image',
  className = '',
  aspectRatio = 'aspect-square',
  showDots = true,
  showArrows = true,
  compact = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const validImages = Array.isArray(images) && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'];

  const hasMultiple = validImages.length > 1;

  const goToPrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (idx, e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(idx);
  };

  // Touch Swipe handlers for mobile-first experience
  const minSwipeDistance = 40;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultiple) {
      goToNext(e);
    } else if (isRightSwipe && hasMultiple) {
      goToPrev(e);
    }
  };

  return (
    <div
      className={`relative overflow-hidden group select-none ${aspectRatio} ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Current Image */}
      <img
        src={validImages[currentIndex]}
        alt={`${alt} - photo ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80';
        }}
      />

      {/* Navigation Arrows */}
      {hasMultiple && showArrows && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous photo"
            className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-panel-bg text-ink border-2 border-ink shadow-[2px_2px_0px_#161221] hover:bg-yellow active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center z-10 ${
              compact ? 'w-6 h-6 p-0.5 opacity-90' : 'w-8 h-8 md:opacity-0 md:group-hover:opacity-100'
            }`}
          >
            <ChevronLeft size={compact ? 14 : 18} strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next photo"
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-panel-bg text-ink border-2 border-ink shadow-[2px_2px_0px_#161221] hover:bg-yellow active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center z-10 ${
              compact ? 'w-6 h-6 p-0.5 opacity-90' : 'w-8 h-8 md:opacity-0 md:group-hover:opacity-100'
            }`}
          >
            <ChevronRight size={compact ? 14 : 18} strokeWidth={3} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {hasMultiple && showDots && (
        <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
          {validImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => goToIndex(idx, e)}
              aria-label={`Jump to photo ${idx + 1}`}
              className={`rounded-full border border-ink transition-all pointer-events-auto ${
                currentIndex === idx
                  ? 'w-4 h-2 bg-pink shadow-[1px_1px_0px_#161221]'
                  : 'w-2 h-2 bg-panel-bg/90 hover:bg-yellow'
              }`}
            />
          ))}
        </div>
      )}

      {/* Photo Counter Pill (compact or top right) */}
      {hasMultiple && (
        <span className="absolute top-2 right-2 bg-panel-bg/95 backdrop-blur-sm text-ink text-[10px] font-bold px-2 py-0.5 rounded-full border border-ink shadow-[1px_1px_0px_#161221] z-10">
          {currentIndex + 1}/{validImages.length}
        </span>
      )}
    </div>
  );
}
