import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import FunkyButton from '../../components/common/FunkyButton';
import Modal from '../../components/common/Modal';
import api from '../../api/client';

const BRAND_COLORS = [
  { key: 'yellow', label: 'Yellow (#FFC72C)', bgClass: 'bg-yellow' },
  { key: 'pink', label: 'Pink (#FF3E7F)', bgClass: 'bg-pink' },
  { key: 'blue', label: 'Blue (#3B5BFF)', bgClass: 'bg-blue' },
  { key: 'lime', label: 'Lime (#C6F135)', bgClass: 'bg-lime' },
  { key: 'purple', label: 'Purple (#8C52FF)', bgClass: 'bg-purple' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [colorKey, setColorKey] = useState('yellow');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Deletion with Reassignment Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignTargetId, setReassignTargetId] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Bulk Reassignment Modal
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [fromCategory, setFromCategory] = useState('');
  const [toCategory, setToCategory] = useState('');
  const [reassigning, setReassigning] = useState(false);
  const [reassignMsg, setReassignMsg] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      if (res.data?.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setColorKey('yellow');
    setDescription('');
    setIsActive(true);
    setFormError('');
    setIsCategoryModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColorKey(cat.colorKey || 'yellow');
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = {
        name: name.trim(),
        colorKey,
        description: description.trim(),
        isActive,
      };

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }

      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (cat) => {
    setCategoryToDelete(cat);
    setDeleteError('');
    // Select first other category as default target
    const other = categories.find((c) => c._id !== cat._id);
    setReassignTargetId(other ? other._id : '');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const payload = {};
      if (categoryToDelete.productCount > 0) {
        if (!reassignTargetId) {
          setDeleteError('Please select a category to reassign existing products to.');
          setDeleting(false);
          return;
        }
        payload.reassignToCategoryId = reassignTargetId;
      }

      await api.delete(`/admin/categories/${categoryToDelete._id}`, { data: payload });
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkReassign = async (e) => {
    e.preventDefault();
    if (!fromCategory || !toCategory) return;
    if (fromCategory === toCategory) {
      setReassignMsg('Source and target cannot be the same category.');
      return;
    }

    setReassigning(true);
    setReassignMsg('');

    try {
      const res = await api.post('/admin/categories/reassign', {
        fromCategoryId: fromCategory,
        toCategoryId: toCategory,
      });

      if (res.data?.success) {
        setReassignMsg(res.data.message);
        setTimeout(() => {
          setIsReassignModalOpen(false);
          setReassignMsg('');
          fetchCategories();
        }, 1500);
      }
    } catch (err) {
      setReassignMsg(err.message || 'Reassignment failed.');
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="sticker-panel p-5 bg-pink/20 shadow-funky flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider mb-0.5">
            <FolderTree size={16} /> Category Architecture
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            Category Management & Reassignment
          </h2>
          <p className="text-xs text-gray-700">
            Organize catalog categories, assign signature brand color themes, and reassign props safely.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFromCategory(categories[0]?._id || '');
              setToCategory(categories[1]?._id || '');
              setIsReassignModalOpen(true);
            }}
            className="btn-funky bg-white text-ink px-3 py-2 text-xs flex items-center gap-1.5"
          >
            <ArrowRightLeft size={14} />
            <span>Reassign Props</span>
          </button>

          <FunkyButton variant="yellow" size="md" onClick={openCreateModal}>
            <Plus size={16} strokeWidth={3} />
            <span>New Category</span>
          </FunkyButton>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="sticker-panel p-5 bg-white shadow-funky space-y-4">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="text-pink animate-spin mx-auto mb-2" />
            <span className="font-heading font-bold text-base text-ink">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <FolderTree size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-heading font-bold text-lg text-ink">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="sticker-panel-sm p-4 bg-panel-bg shadow-[4px_4px_0px_#161221] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge color={cat.colorKey || 'yellow'} size="sm">
                      {cat.name}
                    </Badge>
                    <span className="text-xs font-bold text-gray-600 bg-white px-2.5 py-0.5 rounded-full border border-ink">
                      {cat.productCount || 0} product(s)
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                  <span className="text-[10px] font-mono text-gray-400 block mt-1">
                    Slug: /{cat.slug}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-ink flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      cat.isActive
                        ? 'bg-lime text-ink border-ink'
                        : 'bg-gray-200 text-gray-600 border-gray-400'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="btn-funky bg-yellow text-ink px-2.5 py-1 text-xs"
                      title="Edit Category"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteDialog(cat)}
                      className="btn-funky bg-pink text-white px-2.5 py-1 text-xs"
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-100 border-2 border-[#ff4d4d] text-xs font-bold text-ink">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Neon Signs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full funky-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Brand Color Key
            </label>
            <div className="grid grid-cols-5 gap-2">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColorKey(c.key)}
                  className={`h-9 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#161221] transition-transform ${c.bgClass} ${
                    colorKey === c.key ? 'scale-110 ring-2 ring-ink' : 'opacity-80'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">
              Selected: <strong className="capitalize">{colorKey}</strong> (Used for site-wide badge mapping)
            </span>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of this prop category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full funky-input text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs font-bold text-ink">
            <input
              type="checkbox"
              id="catActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-pink border-2 border-ink"
            />
            <label htmlFor="catActive" className="cursor-pointer">
              Active in Storefront
            </label>
          </div>

          <div className="pt-3 border-t-2 border-ink flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="btn-funky bg-white text-ink px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-funky bg-lime text-ink px-5 py-2 text-xs font-extrabold flex items-center gap-1.5"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>{editingCategory ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation & Safe Reassignment Modal */}
      {categoryToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Category"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs font-semibold">
            <p className="text-sm text-gray-800">
              Are you sure you want to delete category <strong>'{categoryToDelete.name}'</strong>?
            </p>

            {categoryToDelete.productCount > 0 ? (
              <div className="p-3.5 bg-yellow/40 rounded-xl border-2 border-ink space-y-2">
                <div className="flex items-center gap-1.5 font-extrabold text-ink">
                  <AlertTriangle size={16} className="text-pink shrink-0" />
                  <span>
                    This category currently has {categoryToDelete.productCount} active product(s)!
                  </span>
                </div>
                <p className="text-gray-700">
                  To prevent orphaned products, please choose another category to reassign them to before deletion:
                </p>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-gray-600 mb-1">
                    Reassign Products To:
                  </label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full funky-input text-xs font-bold"
                  >
                    {categories
                      .filter((c) => c._id !== categoryToDelete._id)
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                This category has 0 products assigned and can be safely removed.
              </p>
            )}

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-red-100 border-2 border-[#ff4d4d] text-ink text-xs font-bold">
                {deleteError}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn-funky bg-white text-ink px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="btn-funky bg-pink text-white px-5 py-2 text-xs font-extrabold flex items-center gap-1.5"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Product Reassignment Tool Modal */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title="Reassign Products Between Categories"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleBulkReassign} className="space-y-4 text-xs font-semibold">
          <p className="text-gray-700">
            Move all products belonging to one category into another category in one click.
          </p>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-gray-600 mb-1">
              From Category (Source)
            </label>
            <select
              value={fromCategory}
              onChange={(e) => setFromCategory(e.target.value)}
              className="w-full funky-input text-xs font-bold"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.productCount || 0} products)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-gray-600 mb-1">
              To Category (Destination)
            </label>
            <select
              value={toCategory}
              onChange={(e) => setToCategory(e.target.value)}
              className="w-full funky-input text-xs font-bold"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {reassignMsg && (
            <div className="p-3 rounded-xl bg-lime/40 border-2 border-ink text-ink font-bold text-center">
              {reassignMsg}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReassignModalOpen(false)}
              className="btn-funky bg-white text-ink px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reassigning || fromCategory === toCategory}
              className="btn-funky bg-lime text-ink px-5 py-2 text-xs font-extrabold flex items-center gap-1.5"
            >
              {reassigning ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Execute Reassignment</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
