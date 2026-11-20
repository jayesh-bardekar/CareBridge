import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Search,
  RefreshCw,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  Pill,
  UserRound,
  Stethoscope,
  X,
  CalendarDays,
} from "lucide-react";

const PharmacyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get("/prescriptions/pharmacist");
      setPrescriptions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      setMessage(
        error.response?.data?.message || "Unable to load prescriptions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get("/prescriptions/pharmacist")
      .then((response) => {
        if (active) setPrescriptions(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to fetch prescriptions:", error);
        if (active) {
          setMessage(
            error.response?.data?.message || "Unable to load prescriptions.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        prescription.patientName,
        prescription.patientEmail,
        prescription.doctorName,
        prescription.diagnosis,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchText));

      const matchesFilter = filter === "ALL" || prescription.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [prescriptions, search, filter]);

  const pendingCount = prescriptions.filter(
    (item) => item.status === "ACTIVE",
  ).length;

  const handleVerify = async (prescriptionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to verify this prescription?",
    );

    if (!confirmed) return;

    try {
      setVerifyingId(prescriptionId);
      await api.patch(`/prescriptions/${prescriptionId}/verify`);

      setMessage("Prescription verified successfully.");
      setSelectedPrescription(null);

      await fetchPrescriptions();
    } catch (error) {
      console.error("Prescription verification failed:", error);
      setMessage(
        error.response?.data?.message || "Failed to verify prescription.",
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700";
      case "EXPIRED":
        return "bg-red-50 text-red-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Prescription Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and verify patient prescriptions.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchPrescriptions();
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Prescriptions</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {prescriptions.length}
              </h2>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileText size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Prescriptions</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {pendingCount}
              </h2>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search patient, doctor or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Prescription List */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Prescriptions ({filteredPrescriptions.length})
          </h2>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-3 font-semibold text-gray-800">
              No prescriptions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Prescriptions will appear here when available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Doctor</th>
                  <th className="px-5 py-4">Diagnosis</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {prescription.patientName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {prescription.patientEmail}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {prescription.doctorName}
                    </td>

                    <td className="max-w-48 truncate px-5 py-4 text-gray-600">
                      {prescription.diagnosis}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {prescription.prescriptionDate || "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          prescription.status,
                        )}`}
                      >
                        {prescription.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedPrescription(prescription)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                          title="View Details"
                        >
                          <Eye size={17} />
                        </button>

                        {prescription.status === "ACTIVE" && (
                          <button
                            onClick={() => handleVerify(prescription.id)}
                            disabled={verifyingId === prescription.id}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <CheckCircle size={15} />
                            {verifyingId === prescription.id
                              ? "Verifying..."
                              : "Verify"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Prescription Details
                </h2>
                <p className="text-xs text-gray-500">
                  Prescription #{selectedPrescription.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedPrescription(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Patient and Doctor */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <UserRound size={18} />
                    <span className="text-sm font-semibold">Patient</span>
                  </div>
                  <p className="mt-3 font-semibold text-gray-900">
                    {selectedPrescription.patientName}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedPrescription.patientEmail}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Stethoscope size={18} />
                    <span className="text-sm font-semibold">Doctor</span>
                  </div>
                  <p className="mt-3 font-semibold text-gray-900">
                    {selectedPrescription.doctorName}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedPrescription.doctorEmail}
                  </p>
                </div>
              </div>

              {/* Prescription Information */}
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Prescription Information
                </h3>

                <div className="grid gap-4 rounded-xl border border-gray-100 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Diagnosis</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {selectedPrescription.diagnosis}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Prescription Date</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-800">
                      <CalendarDays size={15} />
                      {selectedPrescription.prescriptionDate || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Valid Until</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {selectedPrescription.validUntil || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                        selectedPrescription.status,
                      )}`}
                    >
                      {selectedPrescription.status}
                    </span>
                  </div>
                </div>

                {selectedPrescription.instructions && (
                  <div className="mt-3 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-500">
                      General Instructions
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      {selectedPrescription.instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Medicines */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <Pill size={18} className="text-blue-600" />
                  Prescribed Medicines
                </h3>

                <div className="space-y-3">
                  {(selectedPrescription.medicines || []).map((medicine) => (
                    <div
                      key={medicine.id}
                      className="rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {medicine.medicineName}
                        </h4>
                        <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          Qty: {medicine.quantity}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-gray-500">Dosage</p>
                          <p className="mt-1 text-gray-800">
                            {medicine.dosage}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Frequency</p>
                          <p className="mt-1 text-gray-800">
                            {medicine.frequency}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="mt-1 text-gray-800">
                            {medicine.durationDays} days
                          </p>
                        </div>
                      </div>

                      {medicine.instructions && (
                        <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                          {medicine.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              {selectedPrescription.status === "ACTIVE" && (
                <button
                  onClick={() => handleVerify(selectedPrescription.id)}
                  disabled={verifyingId === selectedPrescription.id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {verifyingId === selectedPrescription.id
                    ? "Verifying..."
                    : "Verify Prescription"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyPrescriptions;
