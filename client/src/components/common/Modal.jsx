import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidth} sticker-panel p-6 bg-panel-bg relative max-h-[90vh] overflow-y-auto shadow-funky-lg`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-3 border-ink">
          {title && (
            <h3 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-yellow border-2 border-ink flex items-center justify-center shadow-[2px_2px_0px_#161221] hover:bg-pink hover:text-white transition-colors ml-auto"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Modal Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
