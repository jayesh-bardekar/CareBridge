import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  X,
  Pencil,
  ClipboardList,
  UserRound,
  CalendarDays,
} from "lucide-react";
import api from "../../services/api";

const initialForm = {
  patientId: "",
  title: "",
  diagnosis: "",
  symptoms: "",
  treatment: "",
  notes: "",
  recordDate: new Date().toISOString().split("T")[0],
};

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [recordsResponse, appointmentsResponse] = await Promise.all([
        api.get("/medical-records/doctor"),
        api.get("/appointments/doctor"),
      ]);

      setRecords(recordsResponse.data || []);

      const uniquePatients = new Map();

      (appointmentsResponse.data || []).forEach((appointment) => {
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
          "Unable to load medical records. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase();

    return records.filter(
      (record) =>
        record.patientName?.toLowerCase().includes(value) ||
        record.patientEmail?.toLowerCase().includes(value) ||
        record.title?.toLowerCase().includes(value) ||
        record.diagnosis?.toLowerCase().includes(value),
    );
  }, [records, search]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingId(record.id);

    setForm({
      patientId: record.patientId || "",
      title: record.title || "",
      diagnosis: record.diagnosis || "",
      symptoms: record.symptoms || "",
      treatment: record.treatment || "",
      notes: record.notes || "",
      recordDate: record.recordDate || new Date().toISOString().split("T")[0],
    });

    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        patientId: Number(form.patientId),
      };

      if (editingId) {
        await api.put(`/medical-records/${editingId}`, payload);
      } else {
        await api.post("/medical-records", payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save medical record. Please check the form.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and review your patients' medical records.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Record
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Records</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {records.length}
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
                {new Set(records.map((record) => record.patientId)).size}
              </h2>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserRound size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="medicalRecordSearch"
            name="medicalRecordSearch"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, title or diagnosis..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          onClick={fetchData}
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

      {/* Records */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-800">
            Medical Record History
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading medical records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-400">
              <ClipboardList size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-700">
              No medical records found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create a medical record for your patient to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Record Title</th>
                  <th className="px-5 py-4">Diagnosis</th>
                  <th className="px-5 py-4">Record Date</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {record.patientName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {record.patientEmail}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {record.title}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                      <p className="truncate">{record.diagnosis}</p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {record.recordDate || "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEditForm(record)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? "Edit Medical Record" : "Create Medical Record"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter accurate patient medical information.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                  onChange={handleChange}
                  required
                  disabled={Boolean(editingId)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
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
                    No patients found in your appointments. You need an
                    appointment with a patient before creating their record.
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Record Title *
                </label>

                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={150}
                  required
                  placeholder="e.g. General Health Checkup"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
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
                  onChange={handleChange}
                  maxLength={1000}
                  required
                  rows={3}
                  placeholder="Enter diagnosis..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Symptoms */}
              <div>
                <label
                  htmlFor="symptoms"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Symptoms
                </label>

                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={form.symptoms}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={2}
                  placeholder="Enter patient symptoms..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Treatment */}
              <div>
                <label
                  htmlFor="treatment"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Treatment
                </label>

                <textarea
                  id="treatment"
                  name="treatment"
                  value={form.treatment}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={3}
                  placeholder="Enter prescribed treatment..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Additional Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={2}
                  placeholder="Additional medical notes..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="recordDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Record Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="recordDate"
                    name="recordDate"
                    type="date"
                    value={form.recordDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || (!editingId && patients.length === 0)}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Record"
                      : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;
