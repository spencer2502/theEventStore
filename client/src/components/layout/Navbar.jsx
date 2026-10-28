import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Sparkles, UserCheck } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import FunkyButton from "../common/FunkyButton";

const NAV_CATEGORIES = [
  { name: "All Props", path: "/categories" },
  { name: "Lighting", path: "/category/lighting", color: "hover:text-yellow" },
  { name: "Backdrops", path: "/category/backdrops", color: "hover:text-pink" },
  { name: "Balloons", path: "/category/balloons", color: "hover:text-blue" },
  { name: "Tableware", path: "/category/tableware", color: "hover:text-lime" },
  {
    name: "Furniture",
    path: "/category/furniture",
    color: "hover:text-purple",
  },
];

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#EAE5DF] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group py-0.5">
          <img
            src="/logo.png"
            alt="THE EVENT STORE"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat.path}
              to={cat.path}
              className={`px-3.5 py-1.5 rounded-full font-semibold text-sm transition-all ${
                isCurrent(cat.path)
                  ? "bg-[#B21818] text-white shadow-sm"
                  : "text-gray-700 hover:text-[#B21818] hover:bg-[#FDF4F4]"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons: Cart & Admin Portal */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B21818] text-white text-sm font-bold hover:bg-[#8E1313] transition-all shadow-sm"
            aria-label={`View cart with ${cartCount} items`}
          >
            <ShoppingBag size={17} strokeWidth={2.2} />
            <span className="hidden sm:inline">Cart</span>
            <span className="w-5 h-5 rounded-full bg-white text-[#B21818] text-xs font-extrabold flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {/* Admin portal shortcut */}
          <Link
            to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
            className="hidden sm:inline-flex"
          >
            <button
              type="button"
              className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isAuthenticated
                  ? "bg-[#FDF4F4] text-[#B21818] border-[#F6D8D8]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#B21818] hover:text-[#B21818]"
              }`}
            >
              {isAuthenticated ? (
                <>
                  <UserCheck size={14} />
                  <span>Portal</span>
                </>
              ) : (
                <span>Admin Login</span>
              )}
            </button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#B21818] hover:border-[#B21818] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-white border-t border-gray-200 px-4 py-5 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
              Browse Categories
            </span>
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isCurrent(cat.path)
                    ? "bg-[#B21818] text-white"
                    : "text-gray-800 hover:bg-[#FDF4F4] hover:text-[#B21818]"
                }`}
              >
                {cat.name}
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-gray-200 flex flex-col gap-2">
              <Link
                to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full font-bold text-sm bg-gray-100 text-gray-800 hover:bg-[#B21818] hover:text-white transition-all"
              >
                {isAuthenticated
                  ? "Admin Dashboard Portal"
                  : "Admin Login"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
