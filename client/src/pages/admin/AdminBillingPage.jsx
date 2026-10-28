import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  User,
  Phone,
  CreditCard,
  X,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import Modal from "../../components/common/Modal";
import FunkyButton from "../../components/common/FunkyButton";
import Badge from "../../components/common/Badge";
import api from "../../api/client";

export default function AdminBillingPage() {
  const [searchParams] = useSearchParams();
  const linkedOrderId = searchParams.get("orderId");

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState("");

  // POS Line items
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const [finalizing, setFinalizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [finalizedSale, setFinalizedSale] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Load products list for POS search
  useEffect(() => {
    fetchProducts();
  }, []);

  // Pre-fill if linkedOrderId was supplied
  useEffect(() => {
    if (linkedOrderId) {
      loadOrderToBill(linkedOrderId);
    }
  }, [linkedOrderId]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error("Failed to load products for POS", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrderToBill = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      if (res.data?.success) {
        const order = res.data.order;
        setCustomerName(order.customerName || "Walk-in Customer");
        setCustomerPhone(order.customerPhone || "");
        setCustomerAddress(order.customerAddress || "");
        setNotes(`Converted from online order #${order.orderNumber}`);

        // Map items
        const mappedItems = order.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantitySold: item.quantity,
          soldPrice: item.priceAtOrder, // defaults to listed price, can be edited
          subtotal: item.quantity * item.priceAtOrder,
          maxStock: 999, // will be validated on finalize
        }));
        setBillItems(mappedItems);
      }
    } catch (err) {
      console.error("Failed to load order into billing", err);
    }
  };

  const handleAddProductToBill = (product) => {
    setErrorMsg("");
    if (product.stock <= 0) {
      setErrorMsg(`'${product.name}' is currently out of stock.`);
      return;
    }

    setBillItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === product._id);
      if (existingIdx > -1) {
        const existing = prev[existingIdx];
        if (existing.quantitySold >= product.stock) {
          setErrorMsg(
            `Cannot add more than available stock (${product.stock}) for '${product.name}'.`,
          );
          return prev;
        }
        const updated = [...prev];
        const newQty = existing.quantitySold + 1;
        updated[existingIdx] = {
          ...existing,
          quantitySold: newQty,
          subtotal: newQty * existing.soldPrice,
        };
        return updated;
      }

      // New line item: soldPrice initialized to product listed price, but fully editable!
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          quantitySold: 1,
          soldPrice: product.price,
          subtotal: product.price,
          maxStock: product.stock,
        },
      ];
    });
  };

  const handleUpdateLineItem = (index, field, value) => {
    setBillItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "quantitySold") {
        const parsed = parseInt(value, 10) || 0;
        const capped = item.maxStock ? Math.min(parsed, item.maxStock) : parsed;
        item.quantitySold = Math.max(1, capped);
      } else if (field === "soldPrice") {
        const parsedPrice = parseFloat(value);
        item.soldPrice = isNaN(parsedPrice) ? 0 : parsedPrice;
      }

      item.subtotal = item.quantitySold * item.soldPrice;
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveLineItem = (index) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = billItems.reduce((acc, i) => acc + (i.subtotal || 0), 0);

  const handleFinalizeBill = async () => {
    if (billItems.length === 0) {
      setErrorMsg("Please add at least one item to the bill.");
      return;
    }

    setErrorMsg("");
    setFinalizing(true);

    try {
      const payload = {
        items: billItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantitySold: i.quantitySold,
          soldPrice: i.soldPrice,
        })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        paymentMethod,
        notes: notes.trim(),
        linkedOrderId: linkedOrderId || null,
      };

      const res = await api.post("/admin/sales", payload);

      if (res.data?.success) {
        setFinalizedSale(res.data.sale);
        setIsReceiptOpen(true);

        // Reset form
        setBillItems([]);
        setCustomerName("Walk-in Customer");
        setCustomerPhone("");
        setCustomerAddress("");
        setNotes("");

        // Refresh products list so stock updates in POS
        fetchProducts();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to finalize bill.");
    } finally {
      setFinalizing(false);
    }
  };

  const handleSendWhatsAppBill = (sale, recipient = "customer") => {
    const storeNumber = "918962690000";
    let targetPhone = storeNumber;

    if (recipient === "customer" && sale.customerPhone) {
      let cleanPhone = sale.customerPhone.replace(/[^0-9]/g, "");
      if (cleanPhone.length === 10) {
        cleanPhone = `91${cleanPhone}`;
      }
      targetPhone = cleanPhone;
    }

    const itemsSummary = sale.items
      ?.map(
        (it, idx) =>
          `${idx + 1}. *${it.name}* (${it.quantitySold}x) — ₹${(it.subtotal || 0).toFixed(2)}`
      )
      .join("\n");

    const message = `
*🎪 THE EVENT STORE — OFFICIAL BILL*
━━━━━━━━━━━━━━━━━━━━
🧾 *Receipt #:* ${sale.billNumber}
📅 *Date:* ${new Date(sale.createdAt).toLocaleString()}
👤 *Customer:* ${sale.customerName}
${sale.customerPhone ? `📞 *Phone:* ${sale.customerPhone}\n` : ""}${sale.customerAddress ? `📍 *Address / Venue:* ${sale.customerAddress}\n` : ""}💳 *Payment:* ${sale.paymentMethod?.toUpperCase()}

🛍️ *Itemized Items:*
${itemsSummary}
━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL AMOUNT:* ₹${(sale.totalAmount || 0).toFixed(2)}

✨ *Thank you for choosing THE EVENT STORE!*
📞 For questions or support, contact +91 89626 90000.
    `.trim();

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // Filter products for quick search
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const term = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.categoryId && p.categoryId.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#EAE5DF] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B21818] uppercase tracking-wider mb-0.5">
            <Receipt size={15} /> Counter Point of Sale
          </div>
          <h2 className="font-heading font-bold text-2xl text-[#1A181E]">
            POS Billing & Stock Decrement
          </h2>
          <p className="text-xs text-gray-500">
            Search products, adjust actual sold price, and finalize the bill to atomically decrement stock.
          </p>
        </div>

        {linkedOrderId && (
          <div className="bg-[#FAF6F2] px-3.5 py-1.5 rounded-full border border-[#E8D0D0] text-xs font-semibold text-[#B21818] shrink-0">
            🔗 Linked to Online Order Enquiry
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* POS Grid: Left is Product Search/Selector, Right is Current Bill */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Search & Selector (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE5DF] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
            <h3 className="font-heading font-bold text-lg text-[#1A181E]">
              Select Products
            </h3>
            <span className="text-xs font-medium text-gray-400">
              {filteredProducts.length} items available
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search by prop name or category..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full funky-input pl-10 text-sm"
            />
          </div>

          {/* Product Items List */}
          {loadingProducts ? (
            <div className="py-16 text-center">
              <Loader2 size={28} className="animate-spin text-pink mx-auto" />
              <span className="text-xs font-bold text-gray-600 mt-2 block">
                Loading catalog...
              </span>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {filteredProducts.map((p) => {
                const isOut = p.stock <= 0;
                const isLow = p.stock > 0 && p.stock <= 5;

                return (
                  <div
                    key={p._id}
                    onClick={() => !isOut && handleAddProductToBill(p)}
                    className={`p-3 rounded-2xl border-2 border-ink flex items-center justify-between transition-all select-none ${
                      isOut
                        ? "bg-gray-100 opacity-60 cursor-not-allowed border-gray-400"
                        : "bg-panel-bg hover:bg-yellow/30 hover:border-pink hover:shadow-[3px_3px_0px_#161221] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          p.images?.[0] ||
                          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=150&q=80"
                        }
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-ink shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-heading font-extrabold text-sm text-ink leading-tight block truncate">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-pink">
                            ₹{p.price.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            • Cat: {p.categoryId?.name || "Props"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isOut ? (
                        <Badge color="danger" size="xs">
                          0 Left
                        </Badge>
                      ) : isLow ? (
                        <Badge color="warning" size="xs">
                          {p.stock} Left
                        </Badge>
                      ) : (
                        <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full border border-ink">
                          Stock: {p.stock}
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={isOut}
                        className="w-8 h-8 rounded-full bg-yellow border-2 border-ink flex items-center justify-center shadow-[1px_1px_0px_#161221] hover:bg-lime disabled:opacity-50"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Current Bill & Checkout (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE5DF] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0ECE6]">
              <h3 className="font-heading font-bold text-lg text-[#1A181E]">
                Current Bill ({billItems.length} items)
              </h3>
              {billItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBillItems([])}
                  className="text-xs font-semibold text-gray-400 hover:text-[#B21818] transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Line Items List */}
            {billItems.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-gray-200 rounded-xl bg-[#FAF8F5] p-6">
                <Receipt size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="font-medium text-sm text-gray-600">
                  No items added yet
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click products on the left to add them to this bill.
                </p>
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
                {billItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF8F5] rounded-xl border border-gray-200 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-heading font-extrabold text-xs text-ink leading-tight truncate">
                        {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="text-gray-400 hover:text-red-500 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2 items-center text-xs font-bold">
                      {/* Qty */}
                      <div className="col-span-4">
                        <label className="text-[10px] text-gray-500 block uppercase">
                          Qty (Max {item.maxStock || "?"})
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={item.maxStock || 999}
                          value={item.quantitySold}
                          onChange={(e) =>
                            handleUpdateLineItem(
                              idx,
                              "quantitySold",
                              e.target.value,
                            )
                          }
                          className="w-full funky-input py-1 px-2 text-xs text-center"
                        />
                      </div>

                      {/* Sold Price (Independent from listed price!) */}
                      <div className="col-span-4">
                        <label className="text-[10px] text-gray-500 block uppercase">
                          Sold Price (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.soldPrice}
                          onChange={(e) =>
                            handleUpdateLineItem(
                              idx,
                              "soldPrice",
                              e.target.value,
                            )
                          }
                          className="w-full funky-input py-1 px-2 text-xs text-center bg-yellow/20"
                          title="Actual sold price (can differ from catalog listed price)"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-4 text-right">
                        <span className="text-[10px] text-gray-500 block uppercase">
                          Subtotal
                        </span>
                        <span className="font-heading font-extrabold text-sm text-ink block mt-1">
                          ₹{(item.subtotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Details Form */}
            <div className="mt-4 pt-3 border-t-2 border-ink space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-600 block mb-0.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full funky-input py-1.5 px-2.5 text-xs"
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-600 block mb-0.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full funky-input py-1.5 px-2.5 text-xs"
                    placeholder="Phone"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-600 block mb-0.5">
                  Customer / Event Venue Address (Optional)
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full funky-input py-1.5 px-2.5 text-xs"
                  placeholder="Venue / delivery address (e.g. 402, Lotus Avenue, Pune)"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-600 block mb-0.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full funky-input py-1.5 px-2 text-xs font-bold cursor-pointer"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / QR Code</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-600 block mb-0.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full funky-input py-1.5 px-2.5 text-xs"
                    placeholder="Remarks / discount"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bill Footer: Grand Total & Finalize Button */}
          <div className="mt-4 pt-4 border-t-3 border-ink space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-base text-gray-700">
                Total Amount:
              </span>
              <span className="font-heading font-extrabold text-3xl text-ink">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleFinalizeBill}
              disabled={finalizing || billItems.length === 0}
              className="w-full btn-funky bg-lime text-ink py-3 text-base flex items-center justify-center gap-2 font-extrabold"
            >
              {finalizing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Decrementing Stock & Finalizing...</span>
                </>
              ) : (
                <>
                  <Receipt size={18} strokeWidth={2.5} />
                  <span>Finalize Bill & Adjust Stock</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {finalizedSale && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title="Official Sales Receipt"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-ink">
            {/* The Dedicated Printable Area (Guaranteed 1 page print / PDF) */}
            <div id="printable-receipt" className="space-y-4 bg-white p-4 rounded-xl border border-gray-200">
              {/* Store Receipt Header */}
              <div className="text-center pb-3 border-b border-gray-200">
                <img
                  src="/logo.png"
                  alt="THE EVENT STORE"
                  className="h-14 mx-auto object-contain mb-1.5"
                />
                <h3 className="font-heading font-extrabold text-xl text-ink tracking-tight">
                  THE EVENT STORE
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  Props & Decor Hire • Official Sales Receipt
                </p>
                <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-dashed border-gray-200 text-gray-600 font-medium">
                  <span><strong>Receipt #:</strong> {finalizedSale.billNumber}</span>
                  <span>{new Date(finalizedSale.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Customer & Cashier Info */}
              <div className="text-xs space-y-1.5 bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE5DF]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-ink">{finalizedSale.customerName}</span>
                </div>
                {finalizedSale.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-semibold text-ink">{finalizedSale.customerPhone}</span>
                  </div>
                )}
                {finalizedSale.customerAddress && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 shrink-0">Address:</span>
                    <span className="font-semibold text-right break-words max-w-[240px] text-ink">
                      {finalizedSale.customerAddress}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-200/60">
                  <span className="text-gray-500">Payment:</span>
                  <span className="uppercase font-bold text-ink">
                    {finalizedSale.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Billed By:</span>
                  <span className="font-medium text-ink">{finalizedSale.createdByName || "Administrator"}</span>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider block">
                  Itemized Items
                </span>
                <div className="divide-y divide-gray-100 text-xs border-y border-gray-200">
                  {finalizedSale.items?.map((it, idx) => (
                    <div
                      key={idx}
                      className="py-2 flex justify-between items-center"
                    >
                      <div className="pr-2">
                        <p className="font-bold text-ink leading-tight">{it.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {it.quantitySold} x ₹{it.soldPrice?.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold text-sm text-ink shrink-0">
                        ₹{it.subtotal?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Paid */}
              <div className="p-3 rounded-lg bg-[#FDF4F4] border border-[#F4D2D2] flex justify-between items-center">
                <span className="font-heading font-bold text-sm text-gray-800">
                  TOTAL PAID:
                </span>
                <span className="font-heading font-extrabold text-xl text-[#B21818]">
                  ₹{finalizedSale.totalAmount?.toFixed(2)}
                </span>
              </div>

              {/* Official Receipt Footer Note */}
              <p className="text-[10px] text-gray-400 text-center pt-1">
                Thank you for choosing THE EVENT STORE. For enquiries: +91 89626 90000
              </p>
            </div>

            {/* Actions (HIDDEN WHEN PRINTING) */}
            <div className="print:hidden space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleSendWhatsAppBill(finalizedSale, "customer")}
                className="w-full btn-funky bg-[#25D366] text-white px-4 py-2.5 text-xs flex items-center justify-center gap-2 font-bold hover:bg-[#20bd5a]"
              >
                <MessageSquare size={15} />
                <span>
                  {finalizedSale.customerPhone
                    ? `Send Bill to Customer on WhatsApp (${finalizedSale.customerPhone})`
                    : "Send Bill to Customer on WhatsApp"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSendWhatsAppBill(finalizedSale, "store")}
                className="w-full btn-funky bg-white text-ink px-4 py-2 text-[11px] flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={14} className="text-[#25D366]" />
                <span>Send Copy to Store WhatsApp (8962690000)</span>
              </button>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-funky bg-[#B21818] text-white px-4 py-2.5 text-xs flex-1 flex items-center justify-center gap-1.5 font-bold hover:bg-[#8E1313]"
                >
                  <Printer size={15} />
                  <span>Download / Print Bill</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptOpen(false)}
                  className="btn-funky bg-white text-ink px-4 py-2.5 text-xs flex-1"
                >
                  Close & Next Sale
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
