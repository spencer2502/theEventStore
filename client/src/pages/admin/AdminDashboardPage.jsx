import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  Receipt,
  ArrowRight,
  TrendingUp,
  Inbox,
  Loader2,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import FunkyButton from "../../components/common/FunkyButton";
import api from "../../api/client";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard/stats");
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
        <Loader2 size={32} className="text-[#B21818] animate-spin" />
        <span className="font-medium text-sm text-gray-600">
          Loading dashboard metrics...
        </span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const recentSales = data?.recentSales || [];
  const lowStockProducts = data?.lowStockProducts || [];

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-white rounded-2xl border border-[#EAE5DF] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#B21818] uppercase tracking-wider block mb-1">
            Store Operations Control Center
          </span>
          <h2 className="font-heading font-bold text-2xl text-[#1A181E]">
            Operations & POS Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track customer enquiries, finalize counter billing receipts, and monitor inventory levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/billing">
            <FunkyButton variant="crimson" size="md">
              <Receipt size={16} />
              <span>Open POS Billing</span>
            </FunkyButton>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FFF5F5] border border-[#E8D0D0] flex items-center justify-center text-[#B21818]">
              <IndianRupee size={15} />
            </div>
          </div>
          <span className="font-heading font-bold text-2xl sm:text-3xl text-[#1A181E] block">
            ₹{stats.totalRevenue ? stats.totalRevenue.toFixed(2) : "0.00"}
          </span>
          <span className="text-xs font-medium text-gray-500 mt-1 block">
            Today: ₹{stats.todayRevenue ? stats.todayRevenue.toFixed(2) : "0.00"} ({stats.todaySalesCount || 0} bills)
          </span>
        </div>

        {/* Metric 2: Finalized POS Bills */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Finalized Sales
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <Receipt size={15} />
            </div>
          </div>
          <span className="font-heading font-bold text-2xl sm:text-3xl text-[#1A181E] block">
            {stats.totalSalesCount || 0}
          </span>
          <span className="text-xs font-medium text-gray-500 mt-1 block">
            Counter POS transactions
          </span>
        </div>

        {/* Metric 3: Storefront Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Store Enquiries
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FFF5F5] border border-[#E8D0D0] flex items-center justify-center text-[#B21818]">
              <Inbox size={15} />
            </div>
          </div>
          <span className="font-heading font-bold text-2xl sm:text-3xl text-[#1A181E] block">
            {stats.totalOrdersCount || 0}
          </span>
          <span className="text-xs font-medium text-[#B21818] mt-1 block">
            {stats.pendingOrdersCount || 0} pending review
          </span>
        </div>

        {/* Metric 4: Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle size={15} />
            </div>
          </div>
          <span className="font-heading font-bold text-2xl sm:text-3xl text-[#1A181E] block">
            {stats.lowStockCount || 0}
          </span>
          <span className="text-xs font-medium text-amber-700 mt-1 block">
            Props with stock ≤ 5
          </span>
        </div>
      </div>

      {/* Low Stock Warning Banner if items exist */}
      {lowStockProducts.length > 0 && (
        <div className="bg-[#FFF8F8] border border-[#F0D5D5] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#B21818]" />
              <h3 className="font-heading font-bold text-base text-[#1A181E]">
                Attention Required: Low Stock Props (≤ 5 units remaining)
              </h3>
            </div>
            <Link
              to="/admin/inventory?lowStockOnly=true"
              className="text-xs font-semibold text-[#B21818] hover:underline uppercase tracking-wider"
            >
              View In Inventory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div
                key={p._id}
                className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <span className="font-medium text-sm text-[#1A181E] block truncate">
                    {p.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ₹{p.price}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#FFF5F5] text-[#B21818] border border-[#E8D0D0] text-xs font-bold shrink-0">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Columns: Recent Storefront Orders & Recent POS Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Recent Storefront Orders */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag size={17} className="text-[#B21818]" />
              <h3 className="font-heading font-bold text-lg text-[#1A181E]">
                Recent Storefront Enquiries
              </h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#B21818] hover:underline"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No orders placed yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1A181E]">
                        {ord.orderNumber}
                      </span>
                      <Badge
                        color={
                          ord.status === "confirmed"
                            ? "success"
                            : ord.status === "cancelled"
                              ? "danger"
                              : "warning"
                        }
                        size="xs"
                      >
                        {ord.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-gray-700 mt-1 truncate">
                      {ord.customerName} ({ord.customerPhone})
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {ord.items?.length} items • ₹{ord.totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  {/* Action: Create Bill from this Order */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/billing?orderId=${ord._id}`)
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#B21818] text-white hover:bg-[#8F1313] text-xs font-medium shrink-0 transition-colors shadow-sm"
                    title="Pre-fill POS billing with this order"
                  >
                    Bill Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Recent Finalized POS Sales */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Receipt size={17} className="text-[#B21818]" />
              <h3 className="font-heading font-bold text-lg text-[#1A181E]">
                Recent Finalized Sales (POS)
              </h3>
            </div>
            <Link
              to="/admin/billing"
              className="text-xs font-semibold text-[#B21818] hover:underline"
            >
              New Bill
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No sales recorded yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentSales.map((sale) => (
                <div
                  key={sale._id}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-[#1A181E] block">
                      {sale.billNumber}
                    </span>
                    <p className="text-xs font-medium text-gray-700 mt-0.5 truncate">
                      {sale.customerName}
                      {sale.customerAddress && (
                        <span className="text-[11px] font-normal text-gray-500 ml-1">
                          • {sale.customerAddress}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(sale.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • {sale.paymentMethod?.toUpperCase()}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-heading font-bold text-base text-[#1A181E] block">
                      ₹{sale.totalAmount?.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-700">
                      ✓ Decremented
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
