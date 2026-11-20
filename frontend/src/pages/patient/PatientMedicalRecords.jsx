import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  CalendarDays,
  UserRound,
  Activity,
  ClipboardList,
  Stethoscope,
  X,
  Loader2,
  AlertCircle,
  Eye,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const PatientMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/medical-records/patient");
      setRecords(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load medical records.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase();

    return records.filter((record) =>
      [
        record.title,
        record.diagnosis,
        record.doctorName,
        record.symptoms,
        record.treatment,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value)),
    );
  }, [records, search]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const uniqueDoctorsCount = useMemo(
    () => new Set(records.map((record) => record.doctorId)).size,
    [records],
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-800 via-teal-700 to-emerald-700 p-8 text-white shadow-2xl shadow-teal-950/20 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-widest text-teal-100 uppercase backdrop-blur-md">
              <Sparkles size={13} className="animate-pulse text-emerald-400" />
              <span>Patient Health Vault</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Medical Records
            </h1>

            <p className="mt-2 text-sm text-teal-50 sm:text-base">
              View your medical history, diagnoses and treatment information.
            </p>
          </div>

          <button
            onClick={fetchRecords}
            disabled={loading}
            className="group inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-teal-800 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={`transition-transform duration-500 ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Total Medical Records
              </p>
              <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-slate-900">
                {records.length}
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Documented clinical reports
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <FileText size={25} />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Doctors Consulted
              </p>
              <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-slate-900">
                {uniqueDoctorsCount}
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Attending healthcare specialists
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Stethoscope size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="group relative flex items-center">
          <Search
            size={19}
            className="absolute left-4 text-slate-400 transition-colors group-focus-within:text-teal-600"
          />
          <input
            type="text"
            placeholder="Search by diagnosis, doctor or treatment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 py-3.5 pr-4 pl-11 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/95 py-20 shadow-sm backdrop-blur-xl">
          <Loader2 className="animate-spin text-teal-600" size={34} />
          <p className="mt-3 text-sm font-semibold text-slate-500 animate-pulse">
            Loading medical records...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/95 p-4 text-sm font-medium text-red-700 shadow-sm backdrop-blur-xl">
          <AlertCircle size={20} className="shrink-0 text-red-600" />
          <span>{error}</span>
          <button
            onClick={fetchRecords}
            className="ml-auto rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Records */}
      {!loading && !error && (
        <>
          {filteredRecords.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/95 py-16 px-6 text-center shadow-sm backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText size={32} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800">
                {search
                  ? "No matching records found"
                  : "No medical records yet"}
              </h3>
              <p className="mt-1.5 text-sm text-slate-400">
                {search
                  ? "Try searching with another keyword."
                  : "Your medical records will appear here when a doctor creates them."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-2xs transition-transform duration-300 group-hover:scale-105">
                          <FileText size={22} />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {record.title}
                          </h3>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            Record #{record.id}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    </div>

                    <div className="mt-5 space-y-3.5 border-t border-slate-100 pt-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-slate-100/80 p-1.5 text-teal-600">
                          <Activity size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Diagnosis
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-800">
                            {record.diagnosis || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-slate-100/80 p-1.5 text-slate-500">
                          <UserRound size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Doctor
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-800">
                            {record.doctorName || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-slate-100/80 p-1.5 text-slate-500">
                          <CalendarDays size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Record Date
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-800">
                            {formatDate(record.recordDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50/50 py-3 text-sm font-bold text-teal-700 transition-all hover:border-teal-300 hover:bg-teal-50"
                  >
                    <Eye size={17} />
                    <span>View Full Record</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-linear-to-r from-teal-800 to-emerald-700 px-6 py-6 text-white sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold">
                    Medical Record Details
                  </h2>
                  <p className="mt-1 text-xs font-semibold tracking-wider text-teal-100 uppercase">
                    Record #{selectedRecord.id}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6 sm:p-7">
              <DetailItem
                icon={<FileText size={18} />}
                label="Title"
                value={selectedRecord.title}
              />

              <DetailItem
                icon={<Activity size={18} />}
                label="Diagnosis"
                value={selectedRecord.diagnosis}
              />

              <DetailItem
                icon={<ClipboardList size={18} />}
                label="Symptoms"
                value={selectedRecord.symptoms}
              />

              <DetailItem
                icon={<Stethoscope size={18} />}
                label="Treatment"
                value={selectedRecord.treatment}
              />

              <DetailItem
                icon={<UserRound size={18} />}
                label="Doctor"
                value={selectedRecord.doctorName}
              />

              <DetailItem
                icon={<CalendarDays size={18} />}
                label="Record Date"
                value={formatDate(selectedRecord.recordDate)}
              />

              <DetailItem
                icon={<FileText size={18} />}
                label="Medical Notes"
                value={selectedRecord.notes}
              />

              <button
                onClick={() => setSelectedRecord(null)}
                className="mt-4 w-full rounded-2xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
    <div className="mt-0.5 rounded-xl bg-teal-50 p-2 text-teal-600 shadow-2xs">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-1 wrap-break-word whitespace-pre-wrap text-sm font-semibold text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

export default PatientMedicalRecords;
