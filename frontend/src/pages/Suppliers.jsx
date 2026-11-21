import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Edit2,
  Trash2,
  Eye,
  Building,
  Package
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/mockData';

export const Suppliers = () => {
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier, globalSearchQuery } = useApp();

  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const initialForm = {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    leadTime: '3',
    suppliedCategories: [INITIAL_CATEGORIES[0]]
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  const effectiveSearch = (search || globalSearchQuery).toLowerCase();

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(effectiveSearch) ||
        s.contactPerson.toLowerCase().includes(effectiveSearch) ||
        s.email.toLowerCase().includes(effectiveSearch) ||
        s.phone.includes(effectiveSearch)
    );
  }, [suppliers, effectiveSearch]);

  const handleOpenAdd = () => {
    setSelectedSupplier(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      leadTime: String(supplier.leadTime),
      suppliedCategories: supplier.suppliedCategories || [INITIAL_CATEGORIES[0]]
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Supplier name is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!formData.leadTime || Number(formData.leadTime) < 1) errors.leadTime = 'Lead time must be at least 1 day';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      leadTime: Number(formData.leadTime),
      suppliedCategories: formData.suppliedCategories
    };

    if (selectedSupplier) {
      await updateSupplier(selectedSupplier.id, payload);
    } else {
      await addSupplier(payload);
    }
    setIsAddEditOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSupplier) {
      await deleteSupplier(selectedSupplier.id);
      setIsDeleteOpen(false);
    }
  };

  // Find products associated with selected supplier
  const supplierProducts = useMemo(() => {
    if (!selectedSupplier) return [];
    return products.filter(p => p.supplierId === selectedSupplier.id || p.supplierName === selectedSupplier.name);
  }, [selectedSupplier, products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Supplier Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maintain authorized vendor contacts, delivery SLA lead times and linked product catalogs ({filteredSuppliers.length} vendors)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Supplier
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by company name, contact person, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers found"
          description="Try modifying your search or add a new vendor to your supply chain registry."
          actionLabel="Add Supplier"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map((s) => {
            const linkedProductsCount = products.filter(
              (p) => p.supplierId === s.id || p.supplierName === s.name
            ).length;

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                          {s.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {s.id}</span>
                      </div>
                    </div>
                    <Badge size="sm">{s.status || 'Active'}</Badge>
                  </div>

                  {/* Supplier Details */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold">{s.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-[11px] text-slate-500">{s.address}</span>
                    </div>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Lead Time</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {s.leadTime} Days
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Catalog SKUs</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-0.5">
                        <Package className="w-3 h-3 text-emerald-500" />
                        {linkedProductsCount} Products
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSupplier(s);
                      setIsDetailOpen(true);
                    }}
                    className="flex-1 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 text-amber-600 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 rounded-xl transition-colors"
                    title="Edit Supplier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSupplier(s);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 text-rose-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xl transition-colors"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedSupplier ? 'Edit Supplier Record' : 'Register New Vendor / Supplier'}
        subtitle="Ensure procurement contact details and fulfillment lead times are accurate"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company / Supplier Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tata Consumer Products Supply"
                className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none ${
                  formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              {formErrors.name && <p className="text-[10px] text-rose-500 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Sunita Deshmukh"
                className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none ${
                  formErrors.contactPerson ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              {formErrors.contactPerson && (
                <p className="text-[10px] text-rose-500 mt-1">{formErrors.contactPerson}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98450 11234"
                className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none ${
                  formErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              {formErrors.phone && <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. sunita.d@tataconsumer.com"
                className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none ${
                  formErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              {formErrors.email && <p className="text-[10px] text-rose-500 mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Average Lead Time (Days) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                placeholder="3"
                className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none ${
                  formErrors.leadTime ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              {formErrors.leadTime && (
                <p className="text-[10px] text-rose-500 mt-1">{formErrors.leadTime}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Warehouse / Office Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full dispatch hub address, postal code..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              {selectedSupplier ? 'Save Updates' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Supplier Profile & Supplied Items"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedSupplier.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">Supplier Code: {selectedSupplier.id}</span>
              </div>
              <Badge size="sm">{selectedSupplier.status || 'Active'}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Contact Person</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedSupplier.contactPerson}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Average Lead Time</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {selectedSupplier.leadTime} Business Days
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedSupplier.phone}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {selectedSupplier.email}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
              <span className="text-[10px] text-slate-400 block uppercase">Dispatch Address</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{selectedSupplier.address}</p>
            </div>

            {/* Supplied Products in Catalog */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Supplied Products in Inventory ({supplierProducts.length})
              </h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                {supplierProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">
                    No products currently mapped to this supplier.
                  </p>
                ) : (
                  supplierProducts.map((p) => (
                    <div key={p.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block">SKU: {p.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Stock: {p.currentStock}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Min: {p.minStockLevel}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Are you sure you want to remove "${selectedSupplier?.name}" from your authorized vendor list?`}
        confirmText="Confirm Delete"
      />
    </div>
  );
};
