import React from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ReceiptText,
  Inbox,
  Users,
  ScrollText,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Badge from "../common/Badge";

export default function AdminLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      roles: ["admin"],
    },
    {
      label: "POS Billing",
      path: "/admin/billing",
      icon: ReceiptText,
      roles: ["admin"],
    },
    {
      label: "Orders Inbox",
      path: "/admin/orders",
      icon: Inbox,
      roles: ["admin"],
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
      roles: ["admin"],
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: FolderTree,
      roles: ["admin"],
    },
    {
      label: "Inventory Report",
      path: "/admin/inventory",
      icon: Boxes,
      roles: ["admin"],
    },
    {
      label: "User Accounts",
      path: "/admin/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      label: "Audit Log",
      path: "/admin/audit-logs",
      icon: ScrollText,
      roles: ["admin"],
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9]">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-[#EAE5DF] px-4 sm:px-8 py-3 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="THE EVENT STORE"
              className="h-9 w-auto object-contain"
            />
            <div>
              <span className="text-xs font-semibold text-[#B21818] block tracking-wide">
                Admin & Operations Portal
              </span>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#FAF8F5] px-3 py-1 rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-700">
              {user?.name}
            </span>
            <Badge color="crimson" size="xs">
              {role}
            </Badge>
          </div>

          <Link
            to="/"
            target="_blank"
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:text-[#B21818] hover:border-[#B21818] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            title="Open Public Storefront in new tab"
          >
            <span className="hidden md:inline">View Store</span>
            <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-[#1A181E] text-white hover:bg-[#2D2A32] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pb-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-60 bg-white rounded-2xl border border-gray-200 p-3 flex flex-col justify-between shadow-sm shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shrink-0 md:shrink ${
                    isActive
                      ? "bg-[#B21818] text-white shadow-sm"
                      : "text-gray-700 hover:bg-[#FAF8F5] hover:text-[#B21818]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="hidden lg:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick operations note */}
          <div className="hidden md:block mt-6 p-3 rounded-xl bg-[#FAF8F5] border border-gray-200 text-[11px] text-gray-500 leading-relaxed">
            <p className="font-semibold flex items-center gap-1 text-gray-700 mb-1">
              <ShieldCheck size={13} className="text-[#B21818]" /> Role Notice
            </p>
            Logged in as <strong className="capitalize text-gray-800">{role}</strong>. Operations, billing, and inventory changes are logged to the audit trail.
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
