import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Send, Heart, Sparkles } from "lucide-react";

export default function Footer() {
  const storePhone = "918962690000";
  const whatsappHelpUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(
    "Hi THE EVENT STORE! I have a question about prop availability.",
  )}`;

  return (
    <footer className="w-full bg-panel-bg border-t-3 border-ink mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="THE EVENT STORE"
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm font-medium text-gray-700 max-w-md leading-relaxed">
              Curated, high-impact event props, statement furniture, backdrop
              installations, and decorative tableware for unforgettable parties,
              weddings, and celebrations.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-funky bg-lime text-ink px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Us: +91 89626 90000</span>
              </a>
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow px-3 py-1.5 rounded-full border-2 border-ink shadow-[2px_2px_0px_#161221]">
                <Sparkles size={13} /> 100% Live Stock Verified
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="font-heading font-bold text-lg text-ink mb-3 uppercase tracking-wider">
              Browse Props
            </h3>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link
                  to="/category/lighting"
                  className="hover:text-pink transition-colors"
                >
                  💡 Lighting & Neon Signs
                </Link>
              </li>
              <li>
                <Link
                  to="/category/backdrops"
                  className="hover:text-pink transition-colors"
                >
                  ✨ Shimmer & Floral Backdrops
                </Link>
              </li>
              <li>
                <Link
                  to="/category/balloons"
                  className="hover:text-pink transition-colors"
                >
                  🎈 Balloon Arches & Props
                </Link>
              </li>
              <li>
                <Link
                  to="/category/tableware"
                  className="hover:text-pink transition-colors"
                >
                  🍽️ Luxury Tableware & Cutlery
                </Link>
              </li>
              <li>
                <Link
                  to="/category/furniture"
                  className="hover:text-pink transition-colors"
                >
                  🪑 Statement Furniture & Plinths
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations */}
          <div>
            <h3 className="font-heading font-bold text-lg text-ink mb-3 uppercase tracking-wider">
              Store Operations
            </h3>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Counter billing, inventory reports, and enquiry dispatch for
              administrators.
            </p>
            <Link
              to="/admin/login"
              className="btn-funky bg-pink text-white px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <span>Admin Login / POS</span>
            </Link>
            <p className="text-[11px] text-gray-500 mt-4">
              One administrator account with full access.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t-3 border-ink flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-gray-600 gap-3">
          <p>
            © {new Date().getFullYear()} THE EVENT STORE. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart size={14} className="text-pink fill-pink" /> for
            events that sparkle.
          </p>
        </div>
      </div>
    </footer>
  );
}
