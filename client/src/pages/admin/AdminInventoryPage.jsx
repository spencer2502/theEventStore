import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Download,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import FunkyButton from '../../components/common/FunkyButton';
import api from '../../api/client';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const url = `/admin/inventory?lowStockOnly=${lowStockOnly}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setInventory(res.data.inventory);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Direct file download trigger
      const response = await api.get('/admin/inventory/export-csv', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `theeventstore-inventory-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const filteredItems = inventory.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      (item.category && item.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="sticker-panel p-5 bg-lime/20 shadow-funky flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider mb-0.5">
            <Boxes size={16} /> Real-Time Stock Tracking
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            Inventory & Stock Reports
          </h2>
          <p className="text-xs text-gray-700">
            Monitor real-time inventory levels, inspect low-stock thresholds (≤ 5 units), and export CSV reports.
          </p>
        </div>

        {/* CSV Export Action Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="btn-funky bg-yellow text-ink px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 shrink-0 font-extrabold"
        >
          {exporting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Generating CSV...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet size={16} strokeWidth={2.5} />
              <span>Export CSV Report</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Status Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="sticker-panel-sm p-3.5 bg-white shadow-[3px_3px_0px_#161221]">
          <span className="text-[10px] font-extrabold uppercase text-gray-500 block">
            Total Catalog Props
          </span>
          <span className="font-heading font-extrabold text-2xl text-ink">
            {summary.totalProducts || 0}
          </span>
        </div>

        <div className="sticker-panel-sm p-3.5 bg-yellow/30 shadow-[3px_3px_0px_#161221]">
          <span className="text-[10px] font-extrabold uppercase text-amber-800 block flex items-center gap-1">
            <AlertTriangle size={12} strokeWidth={3} /> Low Stock (1–5)
          </span>
          <span className="font-heading font-extrabold text-2xl text-amber-900">
            {summary.lowStockCount || 0}
          </span>
        </div>

        <div className="sticker-panel-sm p-3.5 bg-red-100 shadow-[3px_3px_0px_#161221]">
          <span className="text-[10px] font-extrabold uppercase text-red-700 block flex items-center gap-1">
            <XCircle size={12} strokeWidth={3} /> Out of Stock (0)
          </span>
          <span className="font-heading font-extrabold text-2xl text-red-900">
            {summary.outOfStockCount || 0}
          </span>
        </div>

        <div className="sticker-panel-sm p-3.5 bg-lime/30 shadow-[3px_3px_0px_#161221]">
          <span className="text-[10px] font-extrabold uppercase text-green-800 block flex items-center gap-1">
            <CheckCircle2 size={12} strokeWidth={3} /> Healthy Stock (&gt;5)
          </span>
          <span className="font-heading font-extrabold text-2xl text-green-900">
            {summary.inStockCount || 0}
          </span>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="sticker-panel p-5 bg-white shadow-funky space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Filter by prop or category name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full funky-input pl-10 text-xs sm:text-sm"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-panel-bg px-3.5 py-2 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#161221] select-none text-xs font-extrabold text-ink">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-pink focus:ring-pink border-2 border-ink"
            />
            <span>Filter Low Stock Only (≤ 5)</span>
          </label>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="text-pink animate-spin mx-auto mb-2" />
            <span className="font-heading font-bold text-base text-ink">Loading inventory data...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Boxes size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-heading font-bold text-lg text-ink">No inventory items matched</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-3 border-ink bg-panel-bg text-ink uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3 px-3">Prop</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Listed Price</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Stock Status Flag</th>
                  <th className="py-3 px-3">Storefront Visibility</th>
                  <th className="py-3 px-3 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {filteredItems.map((item) => {
                  const isOut = item.isOutOfStock;
                  const isLow = item.isLowStock && !isOut;

                  return (
                    <tr
                      key={item._id}
                      className={`font-semibold transition-colors ${
                        isOut
                          ? 'bg-red-50/70 hover:bg-red-100/70'
                          : isLow
                          ? 'bg-amber-50/70 hover:bg-amber-100/70'
                          : 'hover:bg-yellow/10'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.coverImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=150&q=80'}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-ink shrink-0"
                          />
                          <span className="font-heading font-extrabold text-sm text-ink max-w-xs truncate block">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge color={item.categoryColorKey || 'yellow'} size="xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-heading font-extrabold text-sm text-ink">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-heading font-extrabold text-base text-ink">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg border ${
                            isOut
                              ? 'bg-red-200 text-red-900 border-red-400'
                              : isLow
                              ? 'bg-yellow text-ink border-ink'
                              : 'bg-white text-gray-800 border-ink'
                          }`}
                        >
                          {item.stock}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase text-red-700 bg-red-100 px-2.5 py-1 rounded-full border border-red-400 shadow-[1px_1px_0px_#161221]">
                            <XCircle size={12} strokeWidth={3} /> OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase text-amber-900 bg-yellow px-2.5 py-1 rounded-full border border-ink shadow-[1px_1px_0px_#161221]">
                            <AlertTriangle size={12} strokeWidth={3} /> LOW STOCK (≤ 5)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase text-green-800 bg-lime/40 px-2.5 py-1 rounded-full border border-ink shadow-[1px_1px_0px_#161221]">
                            <CheckCircle2 size={12} strokeWidth={3} /> IN STOCK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            item.isActive
                              ? 'bg-lime text-ink border-ink'
                              : 'bg-gray-200 text-gray-500 border-gray-400'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500 text-[11px]">
                        {new Date(item.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
