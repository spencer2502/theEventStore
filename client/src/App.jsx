import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Storefront components & pages
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/storefront/CartDrawer";
import HomePage from "./pages/storefront/HomePage";
import CategoryPage from "./pages/storefront/CategoryPage";
import ProductDetailPage from "./pages/storefront/ProductDetailPage";

// Admin components & pages
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminBillingPage from "./pages/admin/AdminBillingPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminInventoryPage from "./pages/admin/AdminInventoryPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";

// Storefront wrapper containing Navbar, CartDrawer, and Footer
function StorefrontLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="pb-8">{children}</main>
      </div>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route
        path="/"
        element={
          <StorefrontLayout>
            <HomePage />
          </StorefrontLayout>
        }
      />
      <Route
        path="/categories"
        element={
          <StorefrontLayout>
            <CategoryPage />
          </StorefrontLayout>
        }
      />
      <Route
        path="/category/:slug"
        element={
          <StorefrontLayout>
            <CategoryPage />
          </StorefrontLayout>
        }
      />
      <Route
        path="/product/:idOrSlug"
        element={
          <StorefrontLayout>
            <ProductDetailPage />
          </StorefrontLayout>
        }
      />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* Dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* POS Billing */}
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminBillingPage />
            </ProtectedRoute>
          }
        />

        {/* Orders Inbox */}
        <Route
          path="orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Products Management */}
        <Route
          path="products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />

        {/* Categories Management */}
        <Route
          path="categories"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory Reports & CSV */}
        <Route
          path="inventory"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminInventoryPage />
            </ProtectedRoute>
          }
        />

        {/* User Accounts Management */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* Audit Logs */}
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
