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
  Eye,
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
      <div className="sticker-panel p-12 text-center flex flex-col items-center justify-center gap-3 shadow-funky">
        <Loader2 size={36} className="text-pink animate-spin" />
        <span className="font-heading font-bold text-lg text-ink">
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
      <div className="sticker-panel p-6 bg-yellow/30 shadow-funky flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-pink uppercase tracking-wider block mb-1">
            Store Operations Control Center
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            Operations & POS Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 mt-1">
            Track storefront enquiries, finalize POS counter bills, and monitor
            real-time stock levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/billing">
            <FunkyButton variant="lime" size="md">
              <Receipt size={16} />
              <span>Open POS Billing</span>
            </FunkyButton>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="sticker-panel p-5 bg-white shadow-funky border-3 border-ink">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Total Sales Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-lime border-2 border-ink flex items-center justify-center shadow-[1px_1px_0px_#161221]">
              <IndianRupee size={16} strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-heading font-extrabold text-3xl text-ink block">
            ₹{stats.totalRevenue ? stats.totalRevenue.toFixed(2) : "0.00"}
          </span>
          <span className="text-[11px] font-bold text-gray-600 mt-1 block">
            Today: ₹
            {stats.todayRevenue ? stats.todayRevenue.toFixed(2) : "0.00"} (
            {stats.todaySalesCount || 0} bills)
          </span>
        </div>

        {/* Metric 2: Finalized POS Bills */}
        <div className="sticker-panel p-5 bg-white shadow-funky border-3 border-ink">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Finalized Sales
            </span>
            <div className="w-8 h-8 rounded-full bg-yellow border-2 border-ink flex items-center justify-center shadow-[1px_1px_0px_#161221]">
              <Receipt size={16} strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-heading font-extrabold text-3xl text-ink block">
            {stats.totalSalesCount || 0}
          </span>
          <span className="text-[11px] font-bold text-gray-600 mt-1 block">
            Counter POS transactions
          </span>
        </div>

        {/* Metric 3: Storefront Orders */}
        <div className="sticker-panel p-5 bg-white shadow-funky border-3 border-ink">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Store Enquiries
            </span>
            <div className="w-8 h-8 rounded-full bg-blue text-white border-2 border-ink flex items-center justify-center shadow-[1px_1px_0px_#161221]">
              <Inbox size={16} strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-heading font-extrabold text-3xl text-ink block">
            {stats.totalOrdersCount || 0}
          </span>
          <span className="text-[11px] font-bold text-pink mt-1 block">
            {stats.pendingOrdersCount || 0} pending review
          </span>
        </div>

        {/* Metric 4: Low Stock Alerts */}
        <div className="sticker-panel p-5 bg-white shadow-funky border-3 border-ink">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Low Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-full bg-pink text-white border-2 border-ink flex items-center justify-center shadow-[1px_1px_0px_#161221]">
              <AlertTriangle size={16} strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-heading font-extrabold text-3xl text-ink block">
            {stats.lowStockCount || 0}
          </span>
          <span className="text-[11px] font-bold text-amber-700 mt-1 block">
            Items with stock ≤ 5
          </span>
        </div>
      </div>

      {/* Low Stock Warning Banner if items exist */}
      {lowStockProducts.length > 0 && (
        <div className="sticker-panel p-5 bg-pink/15 border-3 border-ink shadow-funky">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-pink" strokeWidth={3} />
              <h3 className="font-heading font-extrabold text-lg text-ink">
                Immediate Action Required: Low Stock Items (≤ 5)
              </h3>
            </div>
            <Link
              to="/admin/inventory?lowStockOnly=true"
              className="text-xs font-bold text-pink hover:underline uppercase tracking-wider"
            >
              View All In Inventory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div
                key={p._id}
                className="bg-white p-3 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#161221] flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <span className="font-heading font-bold text-sm text-ink block truncate">
                    {p.name}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500">
                    ₹{p.price}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#ff4d4d] text-white text-xs font-extrabold border border-ink shadow-[1px_1px_0px_#161221] shrink-0">
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
        <div className="sticker-panel p-5 bg-white shadow-funky">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-ink">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-blue" />
              <h3 className="font-heading font-extrabold text-xl text-ink">
                Recent Storefront Enquiries
              </h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-pink hover:underline"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              No orders placed yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-3 rounded-xl bg-panel-bg border-2 border-ink shadow-[2px_2px_0px_#161221] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-ink">
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
                    <p className="text-xs font-bold text-gray-700 mt-1 truncate">
                      {ord.customerName} ({ord.customerPhone})
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {ord.items?.length} items • ₹{ord.totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  {/* Action: Create Bill from this Order */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/billing?orderId=${ord._id}`)
                    }
                    className="btn-funky bg-lime text-ink px-2.5 py-1 text-xs shrink-0"
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
        <div className="sticker-panel p-5 bg-white shadow-funky">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-ink">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-lime" />
              <h3 className="font-heading font-extrabold text-xl text-ink">
                Recent Finalized Sales (POS)
              </h3>
            </div>
            <Link
              to="/admin/billing"
              className="text-xs font-bold text-pink hover:underline"
            >
              New Bill
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              No sales recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale._id}
                  className="p-3 rounded-xl bg-panel-bg border-2 border-ink shadow-[2px_2px_0px_#161221] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-extrabold text-ink block">
                      {sale.billNumber}
                    </span>
                    <p className="text-xs font-bold text-gray-700 mt-0.5 truncate">
                      {sale.customerName}
                      {sale.customerAddress && (
                        <span className="text-[11px] font-normal text-gray-500 ml-1">
                          • {sale.customerAddress}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {new Date(sale.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • {sale.paymentMethod?.toUpperCase()}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-heading font-extrabold text-lg text-ink block">
                      ₹{sale.totalAmount?.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-green-700">
                      ✓ Stock Decremented
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
