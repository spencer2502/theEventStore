import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import FunkyButton from '../../components/common/FunkyButton';
import Modal from '../../components/common/Modal';
import api from '../../api/client';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/admin/products?';
      if (categoryFilter !== 'all') url += `category=${categoryFilter}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data?.success) {
        setCategories(res.data.categories);
        if (!categoryId && res.data.categories.length > 0) {
          setCategoryId(res.data.categories[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId(categories[0]?._id || '');
    setPrice('');
    setStock('');
    setImages([]);
    setIsActive(true);
    setFeatured(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setCategoryId(product.categoryId?._id || product.categoryId || '');
    setPrice(product.price);
    setStock(product.stock);
    setImages(product.images || []);
    setIsActive(product.isActive);
    setFeatured(product.featured || false);
    setFormError('');
    setIsModalOpen(true);
  };

  // Upload photos through backend proxy to Cloudinary
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setFormError('');

    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));

    try {
      const res = await api.post('/admin/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.urls) {
        setImages((prev) => [...prev, ...res.data.urls]);
      }
    } catch (err) {
      setFormError(err.message || 'Image upload failed.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Move an image to cover (index 0)
  const setAsCoverImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.unshift(item);
      return updated;
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (!categoryId) {
      setFormError('Please select a category');
      return;
    }
    if (price === '' || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setFormError('Please provide a valid non-negative price');
      return;
    }
    if (stock === '' || isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0) {
      setFormError('Please provide a valid stock quantity (0 or greater)');
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      images: images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
      ],
      isActive,
      featured,
    };

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId, prodName) => {
    if (!window.confirm(`Are you sure you want to delete '${prodName}'?`)) return;

    try {
      await api.delete(`/admin/products/${productId}`);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="sticker-panel p-5 bg-yellow/30 shadow-funky flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink uppercase tracking-wider mb-0.5">
            <Package size={16} /> Catalog Management
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            Event Props & Products
          </h2>
          <p className="text-xs text-gray-700">
            Create, edit, manage stock, and upload multi-angle photos directly to Cloudinary.
          </p>
        </div>

        <FunkyButton variant="lime" size="md" onClick={openCreateModal}>
          <Plus size={16} strokeWidth={3} />
          <span>Add New Prop</span>
        </FunkyButton>
      </div>

      {/* Products Table Card */}
      <div className="sticker-panel p-5 bg-white shadow-funky space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search props by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full funky-input pl-10 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="funky-input text-xs sm:text-sm py-2 px-3 font-bold cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="text-pink animate-spin mx-auto mb-2" />
            <span className="font-heading font-bold text-base text-ink">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Package size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-heading font-bold text-lg text-ink">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-3 border-ink bg-panel-bg text-ink uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3 px-3">Prop Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Live Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= 5 && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p._id} className="hover:bg-yellow/10 transition-colors font-semibold">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=150&q=80'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-ink shadow-[1px_1px_0px_#161221]"
                          />
                          <div className="min-w-0">
                            <span className="font-heading font-extrabold text-sm text-ink block truncate max-w-xs">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              {p.images?.length || 0} photo(s)
                              {p.featured && ' • ⭐ Featured'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge color={p.categoryId?.colorKey || 'yellow'} size="xs">
                          {p.categoryId?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-heading font-extrabold text-sm text-ink">
                        ₹{p.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        {isOut ? (
                          <Badge color="danger" size="xs">
                            Out of Stock (0)
                          </Badge>
                        ) : isLow ? (
                          <Badge color="warning" size="xs" className="flex items-center gap-1 w-fit">
                            <AlertTriangle size={11} strokeWidth={3} />
                            Only {p.stock} left
                          </Badge>
                        ) : (
                          <span className="font-bold text-gray-700 bg-panel-bg px-2.5 py-1 rounded-full border border-ink">
                            {p.stock} units
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            p.isActive
                              ? 'bg-lime text-ink border-ink'
                              : 'bg-gray-200 text-gray-600 border-gray-400'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="btn-funky bg-yellow text-ink px-2.5 py-1 text-xs"
                          title="Edit product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="btn-funky bg-pink text-white px-2.5 py-1 text-xs"
                          title="Delete product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Prop Details' : 'Add New Event Prop'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-100 border-2 border-[#ff4d4d] text-xs font-bold text-ink">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Prop Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vintage Moroccan Brass Geometric Lantern"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full funky-input text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full funky-input text-sm font-bold cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
                Listed Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="45.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full funky-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full funky-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              placeholder="Detailed dimensions, color, finish, and recommended events..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full funky-input text-sm resize-none"
            />
          </div>

          {/* Photo Management & Cloudinary Upload */}
          <div className="p-4 rounded-2xl bg-panel-bg border-2 border-ink space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-ink uppercase tracking-wider block">
                  Photos & Angles (First is Cover)
                </span>
                <span className="text-[11px] text-gray-500">
                  Uploaded securely through backend to Cloudinary.
                </span>
              </div>

              <label className="btn-funky bg-yellow text-ink px-3 py-1.5 text-xs cursor-pointer inline-flex items-center gap-1.5">
                {uploadingImages ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Upload Photos</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>
            </div>

            {/* Images Grid */}
            {images.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-ink/40 rounded-xl bg-white/40">
                <ImageIcon size={24} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">No photos uploaded yet. You can upload multiple angles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden border-2 border-ink shadow-[2px_2px_0px_#161221] bg-white group"
                  >
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-20 object-cover"
                    />

                    {/* Cover badge */}
                    {idx === 0 ? (
                      <span className="absolute top-1 left-1 bg-lime text-ink text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border border-ink shadow-[1px_1px_0px_#161221]">
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsCoverImage(idx)}
                        className="absolute top-1 left-1 bg-white/90 text-ink text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-ink opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Set as cover image"
                      >
                        Set Cover
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-pink text-white flex items-center justify-center border border-ink shadow-[1px_1px_0px_#161221]"
                      aria-label="Remove photo"
                    >
                      <X size={11} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="flex items-center gap-6 pt-1 text-xs font-bold text-ink">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-pink focus:ring-pink border-2 border-ink"
              />
              <span>Active in Storefront</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-pink focus:ring-pink border-2 border-ink"
              />
              <span>Feature on Homepage</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t-2 border-ink flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="btn-funky bg-white text-ink px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-funky bg-lime text-ink px-6 py-2.5 text-xs font-extrabold flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Prop...</span>
                </>
              ) : (
                <span>{editingProduct ? 'Save Changes' : 'Create Prop'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
