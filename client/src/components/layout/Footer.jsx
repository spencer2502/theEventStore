import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Sparkles } from "lucide-react";

export default function Footer() {
  const storePhone = "918962690000";
  const whatsappHelpUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(
    "Hi THE EVENT STORE! I have a question about prop availability.",
  )}`;

  return (
    <footer className="w-full bg-[#FAF8F5] border-t border-[#EAE6DF] mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="THE EVENT STORE"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-sm font-normal text-gray-600 max-w-md leading-relaxed">
              Curated, high-impact event props, statement furniture, backdrop
              installations, and decorative tableware for unforgettable parties,
              weddings, and celebrations.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <MessageCircle size={15} />
                <span>WhatsApp: +91 89626 90000</span>
              </a>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                <Sparkles size={13} className="text-[#B21818]" /> 100% Live Stock Verified
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="font-heading font-bold text-sm text-[#1A181E] mb-3 uppercase tracking-wider">
              Browse Props
            </h3>
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <Link
                  to="/category/lighting"
                  className="hover:text-[#B21818] transition-colors"
                >
                  Lighting & Neon Signs
                </Link>
              </li>
              <li>
                <Link
                  to="/category/backdrops"
                  className="hover:text-[#B21818] transition-colors"
                >
                  Shimmer & Floral Backdrops
                </Link>
              </li>
              <li>
                <Link
                  to="/category/balloons"
                  className="hover:text-[#B21818] transition-colors"
                >
                  Balloon Arches & Props
                </Link>
              </li>
              <li>
                <Link
                  to="/category/tableware"
                  className="hover:text-[#B21818] transition-colors"
                >
                  Luxury Tableware & Cutlery
                </Link>
              </li>
              <li>
                <Link
                  to="/category/furniture"
                  className="hover:text-[#B21818] transition-colors"
                >
                  Statement Furniture & Plinths
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations */}
          <div>
            <h3 className="font-heading font-bold text-sm text-[#1A181E] mb-3 uppercase tracking-wider">
              Store Operations
            </h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Counter billing, inventory management, and enquiry dispatch for store administration.
            </p>
            <Link
              to="/admin/login"
              className="px-4 py-2 rounded-lg bg-[#1A181E] text-white hover:bg-[#2D2A32] text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>Admin Portal / POS</span>
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#EAE6DF] flex flex-col sm:flex-row items-center justify-between text-xs font-normal text-gray-500 gap-3">
          <p>
            © {new Date().getFullYear()} THE EVENT STORE. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Crafted for events that sparkle.
          </p>
        </div>
      </div>
    </footer>
  );
}
