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
    <header className="sticky top-0 z-40 w-full bg-panel-bg border-b-3 border-ink shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
              className={`px-3 py-1.5 rounded-full font-heading font-bold text-sm transition-all border-2 ${
                isCurrent(cat.path)
                  ? "bg-yellow text-ink border-ink shadow-[2px_2px_0px_#161221]"
                  : "border-transparent text-ink hover:bg-white hover:border-ink hover:shadow-[2px_2px_0px_#161221]"
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
            className="btn-funky bg-lime text-ink px-3.5 sm:px-4 py-2 text-sm flex items-center gap-2"
            aria-label={`View cart with ${cartCount} items`}
          >
            <ShoppingBag size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline font-extrabold">Cart</span>
            <span className="w-6 h-6 rounded-full bg-pink text-white text-xs font-extrabold border-2 border-ink flex items-center justify-center shadow-[1px_1px_0px_#161221]">
              {cartCount}
            </span>
          </button>

          {/* Admin portal shortcut */}
          <Link
            to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
            className="hidden sm:inline-flex"
          >
            <FunkyButton
              variant={isAuthenticated ? "pink" : "white"}
              size="sm"
              className="text-xs"
            >
              {isAuthenticated ? (
                <>
                  <UserCheck size={14} />
                  <span>Portal ({user?.role})</span>
                </>
              ) : (
                <>
                  <span>Admin Login</span>
                </>
              )}
            </FunkyButton>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl bg-white border-2 border-ink flex items-center justify-center shadow-[2px_2px_0px_#161221]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-panel-bg border-t-3 border-ink px-4 py-5 shadow-funky animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider px-2">
              Categories
            </span>
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-xl font-heading font-bold text-base border-2 ${
                  isCurrent(cat.path)
                    ? "bg-yellow text-ink border-ink shadow-[2px_2px_0px_#161221]"
                    : "bg-white border-ink text-ink hover:bg-lime/30"
                }`}
              >
                {cat.name}
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t-2 border-ink flex flex-col gap-2">
              <Link
                to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full font-heading font-extrabold text-sm border-2 border-ink bg-purple text-white shadow-[2px_2px_0px_#161221]"
              >
                {isAuthenticated
                  ? `Admin Portal (${user?.role})`
                  : "Admin Login"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
