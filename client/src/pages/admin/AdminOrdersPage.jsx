import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Search,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Phone,
  MessageCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import FunkyButton from '../../components/common/FunkyButton';
import Modal from '../../components/common/Modal';
import api from '../../api/client';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `/admin/orders?status=${statusFilter}&limit=100`;
      const res = await api.get(url);
      if (res.data?.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      ord.customerName.toLowerCase().includes(term) ||
      ord.customerPhone.toLowerCase().includes(term) ||
      ord.orderNumber.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge color="success" size="xs">Confirmed</Badge>;
      case 'cancelled':
        return <Badge color="danger" size="xs">Cancelled</Badge>;
      default:
        return <Badge color="warning" size="xs">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="sticker-panel p-5 bg-blue/20 shadow-funky flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink uppercase tracking-wider mb-0.5">
            <Inbox size={16} /> Guest Enquiries Inbox
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            Storefront Orders & Enquiries
          </h2>
          <p className="text-xs text-gray-700">
            Review guest checkout submissions, contact customers via phone/WhatsApp, and turn enquiries into finalized POS sales.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border-2 border-ink shadow-[2px_2px_0px_#161221] shrink-0">
          {['all', 'pending', 'confirmed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                statusFilter === st
                  ? 'bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#161221]'
                  : 'text-gray-600 hover:text-ink'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="sticker-panel p-5 bg-white shadow-funky space-y-4">
        {/* Search */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by customer name, phone, order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full funky-input pl-10 text-xs sm:text-sm"
            />
          </div>
          <span className="text-xs font-bold text-gray-500 shrink-0">
            {filteredOrders.length} enquiries
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="text-pink animate-spin mx-auto mb-2" />
            <span className="font-heading font-bold text-base text-ink">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Inbox size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-heading font-bold text-lg text-ink">No enquiries found</p>
            <p className="text-xs text-gray-500">There are no orders matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-3 border-ink bg-panel-bg text-ink uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-yellow/10 transition-colors font-semibold">
                    <td className="py-3 px-3 font-mono font-extrabold text-ink">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-ink block">{ord.customerName}</span>
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="text-[11px] text-pink hover:underline flex items-center gap-1"
                      >
                        <Phone size={11} /> {ord.customerPhone}
                      </a>
                      {ord.customerAddress && (
                        <span className="text-[10px] text-gray-600 font-medium block truncate max-w-[180px] mt-0.5">
                          📍 {ord.customerAddress}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate text-gray-600">
                      {ord.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-3 font-heading font-extrabold text-sm text-ink">
                      ₹{ord.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-3 text-gray-500 text-[11px]">
                      {new Date(ord.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 shrink-0">
                      {/* View details */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsDetailOpen(true);
                        }}
                        className="btn-funky bg-white text-ink px-2.5 py-1 text-xs"
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>

                      {/* Convert to Bill in POS */}
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/billing?orderId=${ord._id}`)}
                        className="btn-funky bg-lime text-ink px-3 py-1 text-xs inline-flex items-center gap-1"
                        title="Create Bill from Order"
                      >
                        <Receipt size={13} />
                        <span>Bill POS</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Enquiry #${selectedOrder.orderNumber}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs font-semibold">
            {/* Customer Info Card */}
            <div className="p-3.5 bg-yellow/30 rounded-xl border-2 border-ink space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-ink">{selectedOrder.customerName}</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <p className="text-gray-700">Phone: {selectedOrder.customerPhone}</p>
              {selectedOrder.customerAddress && (
                <p className="text-gray-800 font-bold mt-1">
                  📍 Event/Delivery Address: <span className="font-normal">{selectedOrder.customerAddress}</span>
                </p>
              )}
              <p className="text-[11px] text-gray-500">
                Submitted on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
              {selectedOrder.notes && (
                <div className="mt-2 pt-2 border-t border-ink/20 text-gray-800 italic">
                  "{selectedOrder.notes}"
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="font-extrabold uppercase text-gray-600 block">Requested Items</span>
              <div className="divide-y border-2 border-ink rounded-xl bg-white p-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 px-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-ink">{item.name}</p>
                      <p className="text-gray-500">
                        {item.quantity} x ₹{item.priceAtOrder?.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-heading font-extrabold text-sm text-ink">
                      ₹{(item.quantity * item.priceAtOrder)?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-3 bg-panel-bg rounded-xl border-2 border-ink flex justify-between items-center text-sm font-extrabold">
              <span>Total Estimated Amount:</span>
              <span className="font-heading text-xl text-ink">
                ₹{selectedOrder.totalAmount?.toFixed(2)}
              </span>
            </div>

            {/* Status Change Buttons */}
            <div className="pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-600 block mb-2">Change Status:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'confirmed')}
                  className={`btn-funky px-3 py-1.5 text-xs ${
                    selectedOrder.status === 'confirmed' ? 'bg-lime text-ink' : 'bg-white text-ink'
                  }`}
                >
                  ✓ Mark Confirmed
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                  className={`btn-funky px-3 py-1.5 text-xs ${
                    selectedOrder.status === 'cancelled' ? 'bg-pink text-white' : 'bg-white text-ink'
                  }`}
                >
                  ✕ Mark Cancelled
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'pending')}
                  className={`btn-funky px-3 py-1.5 text-xs ${
                    selectedOrder.status === 'pending' ? 'bg-yellow text-ink' : 'bg-white text-ink'
                  }`}
                >
                  ⏳ Mark Pending
                </button>
              </div>
            </div>

            {/* Convert to Bill Action */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  navigate(`/admin/billing?orderId=${selectedOrder._id}`);
                }}
                className="w-full btn-funky bg-lime text-ink py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <Receipt size={16} />
                <span>Open in POS Billing Tool to Adjust & Decrement Stock</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
