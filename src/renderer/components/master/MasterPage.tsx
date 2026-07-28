import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Layers,
  Building,
  Tag,
  PackageCheck,
  Truck,
  Filter,
  ArrowUpDown,
  Lock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { MasterEntity, MasterModuleName, MASTER_MODULE_CONFIGS } from '../../../shared/masterTypes';
import { MASTER_STORES } from '../../stores/createMasterStore';
import { useUserSessionStore } from '../../stores/userSessionStore';

interface MasterPageProps {
  moduleName: MasterModuleName;
}

export const MasterPage: React.FC<MasterPageProps> = ({ moduleName }) => {
  const config = MASTER_MODULE_CONFIGS[moduleName];
  const useStore = MASTER_STORES[moduleName];

  const {
    items,
    isLoading,
    error,
    searchTerm,
    statusFilter,
    page,
    pageSize,
    fetchItems,
    createItem,
    updateItem,
    enableItem,
    disableItem,
    deleteItem,
    setSearchTerm,
    setStatusFilter,
    setPage,
  } = useStore();

  const userRole = useUserSessionStore((state) => state.role);
  const normRole = (userRole || '').toString().toUpperCase();
  const isReadOnly = normRole === 'USER' || normRole === 'OPERATOR' || normRole === 'VIEWER';
  const canDelete = normRole === 'OWNER' || normRole === 'ADMIN';

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterEntity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [moduleName, fetchItems]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: `${config.codePrefix}-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      sortOrder: (items.length + 1) * 10,
      isActive: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MasterEntity) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.name.trim();
    const trimmedCode = formData.code.trim().toUpperCase();

    if (!trimmedName) {
      setFormError('Name is required.');
      return;
    }
    if (!trimmedCode) {
      setFormError('Code is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, {
          name: trimmedName,
          code: trimmedCode,
          description: formData.description.trim(),
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        });
      } else {
        await createItem({
          name: trimmedName,
          code: trimmedCode,
          description: formData.description.trim(),
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: MasterEntity) => {
    try {
      if (item.isActive) {
        await disableItem(item.id);
      } else {
        await enableItem(item.id);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to change status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteError(null);
    try {
      await deleteItem(deletingId);
      setDeletingId(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete record.');
    }
  };

  // Search & Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // Statistics
  const totalCount = items.length;
  const activeCount = items.filter((i) => i.isActive).length;
  const inactiveCount = totalCount - activeCount;
  const newestItem = items.length > 0 ? items[items.length - 1].name : 'N/A';

  const getModuleIcon = () => {
    switch (moduleName) {
      case 'categories':
        return <Layers className="w-6 h-6 text-indigo-400" />;
      case 'units':
        return <PackageCheck className="w-6 h-6 text-cyan-400" />;
      case 'brands':
        return <Tag className="w-6 h-6 text-amber-400" />;
      case 'warehouses':
        return <Building className="w-6 h-6 text-emerald-400" />;
      case 'suppliers':
        return <Truck className="w-6 h-6 text-rose-400" />;
      default:
        return <Layers className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl shadow-inner">
            {getModuleIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{config.pluralName}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                Master Data
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchItems()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-2 text-sm font-medium disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {!isReadOnly ? (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add {config.singularName}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-amber-400/90 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Read-Only Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Records</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-300 font-bold text-sm">
            #
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Status</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Inactive Status</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{inactiveCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Latest Entry</p>
            <p className="text-sm font-semibold text-indigo-300 mt-1 truncate max-w-[150px]">{newestItem}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ArrowUpDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search by code, name, or description...`}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/80 rounded-xl p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'INACTIVE'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchItems()}
            className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-1 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Sort Order</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading && paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                      <span>Loading master records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-slate-600" />
                      <p className="text-slate-400 font-medium">No records found</p>
                      <p className="text-xs text-slate-500">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-indigo-300 font-semibold">
                      {item.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-100">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 border border-slate-600/50 text-slate-400">
                          <XCircle className="w-3 h-3" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-400">
                      {item.sortOrder}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isReadOnly && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(item)}
                              className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                                item.isActive
                                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
                                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              }`}
                              title={item.isActive ? 'Disable Record' : 'Enable Record'}
                            >
                              {item.isActive ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/40 transition"
                              title="Edit Record"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                            title="Delete Record (Owner Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="bg-slate-900/60 border-t border-slate-700/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{filteredItems.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(page * pageSize, filteredItems.length)}</span> of{' '}
            <span className="font-semibold text-slate-200">{filteredItems.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                  {editingItem ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    {editingItem ? `Edit ${config.singularName}` : `Add New ${config.singularName}`}
                  </h2>
                  <p className="text-xs text-slate-400">Enterprise Master Data Registry</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. CAT-HWD"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`e.g. ${config.singularName} Name`}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details or context..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-300">Is Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? 'Update Record' : 'Save Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Confirm Master Record Delete</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this {config.singularName}? This action is irreversible and audited.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/30"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
