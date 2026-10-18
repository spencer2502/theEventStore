import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  KeyRound,
  Trash2,
  Edit2,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import FunkyButton from "../../components/common/FunkyButton";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Password Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!name || !email || !password) {
      setCreateError("All fields are required");
      return;
    }
    if (password.length < 6 || !/\d/.test(password)) {
      setCreateError(
        "Password must be at least 6 characters long and contain a number",
      );
      return;
    }

    setCreating(true);
    try {
      await api.post("/admin/users", { name, email, password });
      setIsCreateModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      fetchUsers();
    } catch (err) {
      setCreateError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditIsActive(u.isActive);
    setEditError("");
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    setEditError("");

    try {
      await api.put(`/admin/users/${editingUser._id}`, {
        name: editName.trim(),
        isActive: editIsActive,
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      setEditError(err.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const openResetModal = (u) => {
    setResettingUser(u);
    setNewPassword("");
    setResetError("");
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newPassword.length < 6 || !/\d/.test(newPassword)) {
      setResetError(
        "Password must be at least 6 characters long and contain a number",
      );
      return;
    }

    setResetting(true);
    setResetError("");

    try {
      await api.put(`/admin/users/${resettingUser._id}/password`, {
        newPassword,
      });
      setIsResetModalOpen(false);
      alert(`Password updated for ${resettingUser.name}`);
    } catch (err) {
      setResetError(err.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (u._id === currentUser?.id) {
      alert("You cannot delete your own active admin account.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete user account '${u.name}'?`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/${u._id}`);
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const getRoleBadge = (userRole) => {
    return (
      <Badge color="yellow" size="xs">
        Admin
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="sticker-panel p-5 bg-purple/20 shadow-funky flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider mb-0.5">
            <Users size={16} /> Administrator Access
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            Administrator Accounts
          </h2>
          <p className="text-xs text-gray-700">
            Manage administrator accounts with full access to the store portal.
          </p>
        </div>

        <FunkyButton
          variant="yellow"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={16} strokeWidth={3} />
          <span>New Account</span>
        </FunkyButton>
      </div>

      {/* Users Table */}
      <div className="sticker-panel p-5 bg-white shadow-funky space-y-4">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2
              size={32}
              className="text-pink animate-spin mx-auto mb-2"
            />
            <span className="font-heading font-bold text-base text-ink">
              Loading administrator accounts...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-3 border-ink bg-panel-bg text-ink uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3 px-3">Name & Email</th>
                  <th className="py-3 px-3">Assigned Role</th>
                  <th className="py-3 px-3">Role Capabilities</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200 font-semibold">
                {users.map((u) => {
                  const isSelf = u._id === currentUser?.id;

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-yellow/10 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span className="font-heading font-extrabold text-sm text-ink block">
                          {u.name} {isSelf && "(You)"}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {u.email}
                        </span>
                      </td>
                      <td className="py-3 px-3">{getRoleBadge(u.role)}</td>
                      <td className="py-3 px-3 text-gray-600 text-[11px]">
                        Full System Control & Accounts
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            u.isActive
                              ? "bg-lime text-ink border-ink"
                              : "bg-gray-200 text-gray-500 border-gray-400"
                          }`}
                        >
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openResetModal(u)}
                          className="btn-funky bg-white text-ink px-2.5 py-1 text-xs"
                          title="Reset Password"
                        >
                          <KeyRound size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="btn-funky bg-yellow text-ink px-2.5 py-1 text-xs"
                          title="Edit User"
                        >
                          <Edit2 size={13} />
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="btn-funky bg-pink text-white px-2.5 py-1 text-xs"
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User Account"
        maxWidth="max-w-md"
      >
        <form
          onSubmit={handleCreateUser}
          className="space-y-4 text-xs font-semibold"
        >
          {createError && (
            <div className="p-2.5 rounded-xl bg-red-100 border-2 border-[#ff4d4d] text-ink font-bold">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-gray-600 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full funky-input text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-gray-600 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="jordan@theeventstore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full funky-input text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-gray-600 mb-1">
              Password (min. 6 chars + number) *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full funky-input text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-funky bg-white text-ink px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-funky bg-lime text-ink px-5 py-2 text-xs font-extrabold flex items-center gap-1.5"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Account: ${editingUser.name}`}
          maxWidth="max-w-md"
        >
          <form
            onSubmit={handleUpdateUser}
            className="space-y-4 text-xs font-semibold"
          >
            {editError && (
              <div className="p-2.5 rounded-xl bg-red-100 border-2 border-[#ff4d4d] text-ink font-bold">
                {editError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full funky-input text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs font-bold text-ink">
              <input
                type="checkbox"
                id="userActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                disabled={editingUser._id === currentUser?.id}
                className="w-4 h-4 rounded text-pink border-2 border-ink"
              />
              <label htmlFor="userActive" className="cursor-pointer">
                Account Active (Can log in)
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn-funky bg-white text-ink px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="btn-funky bg-lime text-ink px-5 py-2 text-xs font-extrabold flex items-center gap-1.5"
              >
                {updating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Password Reset Modal */}
      {resettingUser && (
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title={`Reset Password for ${resettingUser.name}`}
          maxWidth="max-w-md"
        >
          <form
            onSubmit={handleResetPassword}
            className="space-y-4 text-xs font-semibold"
          >
            {resetError && (
              <div className="p-2.5 rounded-xl bg-red-100 border-2 border-[#ff4d4d] text-ink font-bold">
                {resetError}
              </div>
            )}

            <p className="text-gray-600">
              Enter a new temporary password for{" "}
              <strong>{resettingUser.email}</strong>. This will invalidate any
              existing active session for this user.
            </p>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-600 mb-1">
                New Password (min 6 chars + number) *
              </label>
              <input
                type="password"
                required
                placeholder="NewPassword123!"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full funky-input text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="btn-funky bg-white text-ink px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetting}
                className="btn-funky bg-pink text-white px-5 py-2 text-xs font-extrabold flex items-center gap-1.5"
              >
                {resetting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                <span>Set New Password</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
