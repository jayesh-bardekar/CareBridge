import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Search,
  RefreshCw,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  X,
  Pill,
  Boxes,
} from "lucide-react";

const categories = [
  "TABLETS",
  "CAPSULES",
  "SYRUPS",
  "INJECTIONS",
  "OINTMENTS",
  "CREAMS",
  "DROPS",
  "POWDERS",
  "INHALERS",
  "VITAMINS",
  "SUPPLEMENTS",
  "MEDICAL_DEVICES",
  "OTHER",
];

const emptyForm = {
  medicineName: "",
  manufacturer: "",
  category: "TABLETS",
  batchNumber: "",
  price: "",
  quantity: "",
  minimumStockLevel: "",
  expiryDate: "",
  description: "",
  active: true,
};

const PharmacyInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  const [modal, setModal] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMedicines = async () => {
    try {
      const response = await api.get("/inventory/medicines");
      setMedicines(response.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError(
        err.response?.data?.message || "Unable to load medicine inventory.",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshMedicines = () => {
    setLoading(true);
    fetchMedicines();
  };

  useEffect(() => {
    let cancelled = false;

    const loadMedicines = async () => {
      try {
        const response = await api.get("/inventory/medicines");
        if (!cancelled) {
          setMedicines(response.data || []);
          setError("");
        }
      } catch (err) {
        console.error("Failed to load inventory:", err);
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Unable to load medicine inventory.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMedicines();
    return () => {
      cancelled = true;
    };
  }, []);

  const lowStockCount = medicines.filter(
    (medicine) => medicine.lowStock,
  ).length;

  const activeCount = medicines.filter((medicine) => medicine.active).length;

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        medicine.medicineName,
        medicine.manufacturer,
        medicine.batchNumber,
        medicine.category,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchText));

      const matchesCategory =
        categoryFilter === "ALL" || medicine.category === categoryFilter;

      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "LOW" && medicine.lowStock) ||
        (stockFilter === "AVAILABLE" && !medicine.lowStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [medicines, search, categoryFilter, stockFilter]);

  const openAddModal = () => {
    setSelectedMedicine(null);
    setForm(emptyForm);
    setModal("form");
    setMessage("");
    setError("");
  };

  const openEditModal = (medicine) => {
    setSelectedMedicine(medicine);
    setForm({
      medicineName: medicine.medicineName || "",
      manufacturer: medicine.manufacturer || "",
      category: medicine.category || "TABLETS",
      batchNumber: medicine.batchNumber || "",
      price: medicine.price ?? "",
      quantity: medicine.quantity ?? "",
      minimumStockLevel: medicine.minimumStockLevel ?? "",
      expiryDate: medicine.expiryDate || "",
      description: medicine.description || "",
      active: medicine.active,
    });
    setModal("form");
    setError("");
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveMedicine = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        minimumStockLevel: Number(form.minimumStockLevel),
      };

      if (selectedMedicine) {
        await api.put(`/inventory/medicines/${selectedMedicine.id}`, payload);
        setMessage("Medicine updated successfully.");
      } else {
        await api.post("/inventory/medicines", payload);
        setMessage("Medicine added successfully.");
      }

      setModal("");
      await fetchMedicines();
    } catch (err) {
      console.error("Medicine save failed:", err);
      setError(err.response?.data?.message || "Failed to save medicine.");
    } finally {
      setSaving(false);
    }
  };

  const openQuantityModal = (medicine, type) => {
    setSelectedMedicine(medicine);
    setQuantity("");
    setModal(type);
    setError("");
  };

  const handleQuantityAction = async (e) => {
    e.preventDefault();

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount < 1) {
      setError("Please enter a valid quantity greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (modal === "stock") {
        await api.patch(`/inventory/medicines/${selectedMedicine.id}/stock`, {
          quantity: amount,
        });
        setMessage("Stock updated successfully.");
      } else {
        await api.patch(
          `/inventory/medicines/${selectedMedicine.id}/dispense`,
          { quantity: amount },
        );
        setMessage("Medicine dispensed successfully.");
      }

      setModal("");
      await fetchMedicines();
    } catch (err) {
      console.error("Inventory operation failed:", err);
      setError(err.response?.data?.message || "Inventory operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicine) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${medicine.medicineName}?`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/inventory/medicines/${medicine.id}`);
      setMessage("Medicine deleted successfully.");
      await fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete medicine.");
    }
  };

  const getExpiryStyle = (expiryDate) => {
    if (!expiryDate) return "text-gray-500";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(`${expiryDate}T00:00:00`);

    if (expiry < today) return "text-red-600 font-semibold";

    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 30) return "text-amber-600 font-semibold";

    return "text-gray-600";
  };

  const formatCategory = (category) => category?.replaceAll("_", " ") || "N/A";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Medicine Inventory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage medicines, stock levels and dispensing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={refreshMedicines}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
          <button onClick={() => setMessage("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {error && !modal && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Medicines"
          value={medicines.length}
          icon={<Package size={23} />}
          color="blue"
        />

        <StatCard
          title="Active Medicines"
          value={activeCount}
          icon={<CheckCircle size={23} />}
          color="emerald"
        />

        <StatCard
          title="Low Stock"
          value={lowStockCount}
          icon={<AlertTriangle size={23} />}
          color="amber"
        />

        <StatCard
          title="Inactive Medicines"
          value={medicines.length - activeCount}
          icon={<Boxes size={23} />}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine, manufacturer or batch..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {formatCategory(category)}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">All Stock</option>
          <option value="LOW">Low Stock</option>
          <option value="AVAILABLE">Normal Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Medicine List</h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredMedicines.length} medicines found
            </p>
          </div>
          <Pill size={22} className="text-blue-600" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : error && medicines.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-red-600">
            {error}
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Package size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-3 font-semibold text-gray-800">
              No medicines found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a medicine or change your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Medicine</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Batch</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Expiry</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {medicine.medicineName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {medicine.manufacturer || "N/A"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatCategory(medicine.category)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {medicine.batchNumber}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                      ₹{Number(medicine.price).toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {medicine.quantity}
                      </p>
                      <p
                        className={`text-xs ${
                          medicine.lowStock ? "text-amber-600" : "text-gray-500"
                        }`}
                      >
                        {medicine.lowStock
                          ? "Low stock"
                          : `Minimum: ${medicine.minimumStockLevel}`}
                      </p>
                    </td>

                    <td
                      className={`whitespace-nowrap px-5 py-4 ${getExpiryStyle(
                        medicine.expiryDate,
                      )}`}
                    >
                      {medicine.expiryDate || "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          medicine.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {medicine.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(medicine)}
                          title="Edit Medicine"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => openQuantityModal(medicine, "stock")}
                          title="Update Stock"
                          className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Boxes size={16} />
                        </button>

                        <button
                          onClick={() =>
                            openQuantityModal(medicine, "dispense")
                          }
                          disabled={
                            !medicine.active ||
                            medicine.quantity <= 0 ||
                            medicine.expiryDate <
                              new Date().toISOString().slice(0, 10)
                          }
                          title="Dispense Medicine"
                          className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Pill size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(medicine)}
                          title="Delete Medicine"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal === "form" && (
        <Modal
          title={selectedMedicine ? "Edit Medicine" : "Add New Medicine"}
          onClose={() => setModal("")}
        >
          <form onSubmit={handleSaveMedicine} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Medicine Name" required>
                <input
                  name="medicineName"
                  value={form.medicineName}
                  onChange={handleFormChange}
                  minLength={2}
                  maxLength={150}
                  required
                  className="input-field"
                />
              </FormField>

              <FormField label="Manufacturer">
                <input
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleFormChange}
                  maxLength={150}
                  className="input-field"
                />
              </FormField>

              <FormField label="Category" required>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className="input-field"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {formatCategory(category)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Batch Number" required>
                <input
                  name="batchNumber"
                  value={form.batchNumber}
                  onChange={handleFormChange}
                  maxLength={100}
                  required
                  className="input-field"
                />
              </FormField>

              <FormField label="Price (₹)" required>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleFormChange}
                  min="0.01"
                  step="0.01"
                  required
                  className="input-field"
                />
              </FormField>

              <FormField label="Quantity" required>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  min="0"
                  step="1"
                  required
                  className="input-field"
                />
              </FormField>

              <FormField label="Minimum Stock Level" required>
                <input
                  type="number"
                  name="minimumStockLevel"
                  value={form.minimumStockLevel}
                  onChange={handleFormChange}
                  min="0"
                  step="1"
                  required
                  className="input-field"
                />
              </FormField>

              <FormField label="Expiry Date" required>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleFormChange}
                  required
                  className="input-field"
                />
              </FormField>
            </div>

            <FormField label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                maxLength={1000}
                rows={3}
                className="input-field resize-none"
              />
            </FormField>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleFormChange}
                className="h-4 w-4"
              />
              Medicine is active
            </label>

            {error && <ModalError message={error} />}

            <ModalActions
              onCancel={() => setModal("")}
              saving={saving}
              submitLabel={selectedMedicine ? "Save Changes" : "Add Medicine"}
            />
          </form>
        </Modal>
      )}

      {/* Stock / Dispense Modal */}
      {(modal === "stock" || modal === "dispense") && (
        <Modal
          title={
            modal === "stock" ? "Update Medicine Stock" : "Dispense Medicine"
          }
          onClose={() => setModal("")}
        >
          <form onSubmit={handleQuantityAction} className="space-y-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-gray-900">
                {selectedMedicine?.medicineName}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Current stock: {selectedMedicine?.quantity}
              </p>
            </div>

            <FormField
              label={
                modal === "stock"
                  ? "New Total Quantity"
                  : "Quantity to Dispense"
              }
              required
            >
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="input-field"
              />
            </FormField>

            {modal === "stock" ? (
              <p className="text-xs text-gray-500">
                Enter the new total stock quantity, not the quantity to add.
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                This quantity will be deducted from the available stock.
              </p>
            )}

            {error && <ModalError message={error} />}

            <ModalActions
              onCancel={() => setModal("")}
              saving={saving}
              submitLabel={modal === "stock" ? "Update Stock" : "Dispense"}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">{value}</h2>
        </div>
        <div className={`rounded-xl p-3 ${styles[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
      <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FormField = ({ label, required, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const ModalError = ({ message }) => (
  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
    {message}
  </p>
);

const ModalActions = ({ onCancel, saving, submitLabel }) => (
  <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
    <button
      type="button"
      onClick={onCancel}
      className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={saving}
      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {saving ? "Processing..." : submitLabel}
    </button>
  </div>
);

export default PharmacyInventory;
