import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="sticker-panel p-8 flex items-center gap-3 shadow-funky">
          <Loader2 size={24} className="animate-spin text-pink" />
          <span className="font-heading font-bold text-ink">
            Verifying credentials...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="sticker-panel p-8 max-w-md text-center space-y-4 shadow-funky bg-white">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-pink text-white border-2 border-ink flex items-center justify-center shadow-funky">
            <ShieldAlert size={28} />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-ink">
            Access Restricted
          </h2>
          <p className="text-xs text-gray-700">
            Your current account role (<strong>{user?.role}</strong>) does not
            have permission to view this section.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
