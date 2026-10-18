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
  ShieldAlert,
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

  // All portal areas are available to the administrator.
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

  const roleColor = "yellow";

  return (
    <div className="min-h-screen flex flex-col bg-panel-bg">
      {/* Top Navbar */}
      <header className="w-full bg-panel-bg border-b-3 border-ink px-4 sm:px-8 py-3.5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="THE EVENT STORE"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="text-xs font-bold text-pink block">
                Admin & Operations Portal
              </span>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1 rounded-full border-2 border-ink shadow-[2px_2px_0px_#161221]">
            <span className="text-xs font-bold text-gray-700">
              {user?.name}
            </span>
            <Badge color={roleColor} size="xs">
              {role}
            </Badge>
          </div>

          <Link
            to="/"
            target="_blank"
            className="btn-funky bg-white text-ink px-3 py-1.5 text-xs flex items-center gap-1"
            title="Open Public Storefront in new tab"
          >
            <span className="hidden md:inline">View Store</span>
            <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="btn-funky bg-pink text-white px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pb-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-64 sticker-panel p-4 flex flex-col justify-between shadow-funky">
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-heading font-bold text-sm border-2 transition-all shrink-0 md:shrink ${
                    isActive
                      ? "bg-yellow text-ink border-ink shadow-[3px_3px_0px_#161221] translate-x-1"
                      : "bg-white/80 border-transparent text-gray-800 hover:bg-white hover:border-ink hover:shadow-[2px_2px_0px_#161221]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} strokeWidth={2.5} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="hidden lg:inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-panel-bg border border-ink">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick operations note */}
          <div className="hidden md:block mt-6 p-3 rounded-2xl bg-white/70 border-2 border-dashed border-ink text-[11px] text-gray-700 leading-snug">
            <p className="font-bold flex items-center gap-1 text-ink mb-1">
              <ShieldAlert size={13} className="text-pink" /> Role Notice
            </p>
            You are logged in as <strong className="capitalize">{role}</strong>.
            Permissions are strictly checked on both client and server API
            endpoints.
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
