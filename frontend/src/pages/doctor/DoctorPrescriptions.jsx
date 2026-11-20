import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  X,
  Eye,
  Trash2,
  Pill,
  CalendarDays,
  UserRound,
} from "lucide-react";
import api from "../../services/api";

const initialMedicine = {
  medicineName: "",
  dosage: "",
  frequency: "",
  durationDays: 1,
  quantity: 1,
  instructions: "",
};

const initialForm = {
  patientId: "",
  diagnosis: "",
  instructions: "",
  validUntil: "",
  medicines: [{ ...initialMedicine }],
};

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      const [prescriptionResponse, appointmentResponse] = await Promise.all([
        api.get("/prescriptions/doctor"),
        api.get("/appointments/doctor"),
      ]);

      setError("");
      setPrescriptions(prescriptionResponse.data || []);

      const uniquePatients = new Map();

      (appointmentResponse.data || []).forEach((appointment) => {
        if (appointment.patientId) {
          uniquePatients.set(appointment.patientId, {
            id: appointment.patientId,
            name: appointment.patientName,
            email: appointment.patientEmail,
          });
        }
      });

      setPatients(Array.from(uniquePatients.values()));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load prescriptions. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    setError("");
    fetchData();
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const filteredPrescriptions = useMemo(() => {
    const value = search.toLowerCase();

    return prescriptions.filter(
      (prescription) =>
        prescription.patientName?.toLowerCase().includes(value) ||
        prescription.patientEmail?.toLowerCase().includes(value) ||
        prescription.diagnosis?.toLowerCase().includes(value) ||
        prescription.status?.toLowerCase().includes(value),
    );
  }, [prescriptions, search]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      medicines: [{ ...initialMedicine }],
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleMedicineChange = (index, e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      medicines: previous.medicines.map((medicine, medicineIndex) =>
        medicineIndex === index ? { ...medicine, [name]: value } : medicine,
      ),
    }));
  };

  const addMedicine = () => {
    setForm((previous) => ({
      ...previous,
      medicines: [...previous.medicines, { ...initialMedicine }],
    }));
  };

  const removeMedicine = (index) => {
    setForm((previous) => ({
      ...previous,
      medicines: previous.medicines.filter(
        (_, medicineIndex) => medicineIndex !== index,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        patientId: Number(form.patientId),
        diagnosis: form.diagnosis.trim(),
        instructions: form.instructions.trim(),
        validUntil: form.validUntil,
        medicines: form.medicines.map((medicine) => ({
          medicineName: medicine.medicineName.trim(),
          dosage: medicine.dosage.trim(),
          frequency: medicine.frequency.trim(),
          durationDays: Number(medicine.durationDays),
          quantity: Number(medicine.quantity),
          instructions: medicine.instructions.trim(),
        })),
      };

      await api.post("/prescriptions", payload);

      setShowForm(false);
      resetForm();

      setLoading(true);
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create prescription. Please check the form.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      ACTIVE: "bg-emerald-50 text-emerald-700",
      VERIFIED: "bg-blue-50 text-blue-700",
      PENDING: "bg-amber-50 text-amber-700",
      EXPIRED: "bg-red-50 text-red-700",
      CANCELLED: "bg-slate-100 text-slate-600",
    };

    return styles[status] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage patient prescriptions.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Prescription
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Prescriptions</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {prescriptions.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Unique Patients</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {
                  new Set(
                    prescriptions.map((prescription) => prescription.patientId),
                  ).size
                }
              </h2>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserRound size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="prescriptionSearch"
            name="prescriptionSearch"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, diagnosis or status..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          onClick={refreshData}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Prescription Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Prescription History</h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading prescriptions...
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-400">
              <FileText size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-700">
              No prescriptions found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create a prescription for your patient to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Diagnosis</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Valid Until</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPrescriptions.map((prescription) => (
                  <tr
                    key={prescription.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {prescription.patientName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {prescription.patientEmail}
                      </p>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                      <p className="truncate">{prescription.diagnosis}</p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {prescription.prescriptionDate || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {prescription.validUntil || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(prescription.status)}`}
                      >
                        {prescription.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedPrescription(prescription)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Create Prescription
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter diagnosis and prescribed medicines.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Patient */}
              <div>
                <label
                  htmlFor="patientId"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Select Patient *
                </label>

                <select
                  id="patientId"
                  name="patientId"
                  value={form.patientId}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Choose a patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>

                {patients.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No patients found in your appointments.
                  </p>
                )}
              </div>

              {/* Diagnosis */}
              <div>
                <label
                  htmlFor="diagnosis"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Diagnosis *
                </label>

                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleFormChange}
                  maxLength={1000}
                  required
                  rows={3}
                  placeholder="Enter diagnosis..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* General Instructions */}
              <div>
                <label
                  htmlFor="instructions"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  General Instructions
                </label>

                <textarea
                  id="instructions"
                  name="instructions"
                  value={form.instructions}
                  onChange={handleFormChange}
                  maxLength={2000}
                  rows={2}
                  placeholder="General prescription instructions..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Valid Until */}
              <div>
                <label
                  htmlFor="validUntil"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Prescription Valid Until *
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="validUntil"
                    name="validUntil"
                    type="date"
                    value={form.validUntil}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Medicines */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Prescribed Medicines
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Add one or more medicines.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                  >
                    <Plus size={16} />
                    Add Medicine
                  </button>
                </div>

                {form.medicines.map((medicine, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                          <Pill size={17} />
                        </div>

                        <h4 className="text-sm font-semibold text-slate-700">
                          Medicine {index + 1}
                        </h4>
                      </div>

                      {form.medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="Remove medicine"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`medicineName-${index}`}
                          className="mb-2 block text-xs font-medium text-slate-600"
                        >
                          Medicine Name *
                        </label>

                        <input
                          id={`medicineName-${index}`}
                          name="medicineName"
                          value={medicine.medicineName}
                          onChange={(e) => handleMedicineChange(index, e)}
                          maxLength={150}
                          required
                          placeholder="Medicine name"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`dosage-${index}`}
                          className="mb-2 block text-xs font-medium text-slate-600"
                        >
                          Dosage *
                        </label>

                        <input
                          id={`dosage-${index}`}
                          name="dosage"
                          value={medicine.dosage}
                          onChange={(e) => handleMedicineChange(index, e)}
                          maxLength={100}
                          required
                          placeholder="e.g. 500 mg"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`frequency-${index}`}
                          className="mb-2 block text-xs font-medium text-slate-600"
                        >
                          Frequency *
                        </label>

                        <input
                          id={`frequency-${index}`}
                          name="frequency"
                          value={medicine.frequency}
                          onChange={(e) => handleMedicineChange(index, e)}
                          maxLength={150}
                          required
                          placeholder="e.g. Twice daily"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`durationDays-${index}`}
                          className="mb-2 block text-xs font-medium text-slate-600"
                        >
                          Duration (Days) *
                        </label>

                        <input
                          id={`durationDays-${index}`}
                          name="durationDays"
                          type="number"
                          min="1"
                          value={medicine.durationDays}
                          onChange={(e) => handleMedicineChange(index, e)}
                          required
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`quantity-${index}`}
                          className="mb-2 block text-xs font-medium text-slate-600"
                        >
                          Quantity *
                        </label>

                        <input
                          id={`quantity-${index}`}
                          name="quantity"
                          type="number"
                          min="1"
                          value={medicine.quantity}
                          onChange={(e) => handleMedicineChange(index, e)}
                          required
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`medicineInstructions-${index}`}
                          className="mb-2 block text-xs font-medium text-slate-600"
                        >
                          Medicine Instructions
                        </label>

                        <input
                          id={`medicineInstructions-${index}`}
                          name="instructions"
                          value={medicine.instructions}
                          onChange={(e) => handleMedicineChange(index, e)}
                          maxLength={500}
                          placeholder="e.g. Take after meals"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || patients.length === 0}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Prescription Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Prescription #{selectedPrescription.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedPrescription(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">
                  {selectedPrescription.patientName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedPrescription.patientEmail}
                </p>

                <p className="mt-3 text-sm text-slate-600">
                  Diagnosis: {selectedPrescription.diagnosis}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Prescription Date</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {selectedPrescription.prescriptionDate || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Valid Until</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {selectedPrescription.validUntil || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Status</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedPrescription.status)}`}
                  >
                    {selectedPrescription.status}
                  </span>
                </div>
              </div>

              {selectedPrescription.instructions && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-800">
                    General Instructions
                  </h3>
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    {selectedPrescription.instructions}
                  </p>
                </div>
              )}

              <div>
                <h3 className="mb-3 font-semibold text-slate-800">
                  Prescribed Medicines
                </h3>

                <div className="space-y-3">
                  {(selectedPrescription.medicines || []).map(
                    (medicine, index) => (
                      <div
                        key={medicine.id || index}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <Pill size={18} className="text-purple-600" />
                          <h4 className="font-semibold text-slate-800">
                            {medicine.medicineName}
                          </h4>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <p className="text-slate-600">
                            Dosage: {medicine.dosage}
                          </p>

                          <p className="text-slate-600">
                            Frequency: {medicine.frequency}
                          </p>

                          <p className="text-slate-600">
                            Duration: {medicine.durationDays} days
                          </p>

                          <p className="text-slate-600">
                            Quantity: {medicine.quantity}
                          </p>
                        </div>

                        {medicine.instructions && (
                          <p className="mt-3 text-sm text-slate-500">
                            Instructions: {medicine.instructions}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
