import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Stethoscope,
  MapPin,
  GraduationCap,
  Clock,
  IndianRupee,
  CalendarDays,
  UserRound,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const formatText = (value) =>
  value
    ? value
        .toString()
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Not specified";

const PatientFindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctors");
      setDoctors(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load doctors. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchDoctors);
  }, [fetchDoctors]);

  const specializations = useMemo(() => {
    return [
      "ALL",
      ...new Set(
        doctors.map((doctor) => doctor.specialization).filter(Boolean),
      ),
    ];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        doctor.fullName?.toLowerCase().includes(searchText) ||
        doctor.specialization?.toLowerCase().includes(searchText) ||
        doctor.qualification?.toLowerCase().includes(searchText);

      const matchesSpecialization =
        selectedSpecialization === "ALL" ||
        doctor.specialization === selectedSpecialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, search, selectedSpecialization]);

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
              <span>Healthcare Services</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Find Doctors
            </h1>

            <p className="mt-2 text-sm text-teal-50 sm:text-base">
              Find experienced specialists and explore their professional
              profiles.
            </p>
          </div>

          <button
            onClick={fetchDoctors}
            disabled={loading}
            className="group inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-teal-800 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={`transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
            />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="group relative flex-1">
            <Search
              size={19}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-600"
            />

            <input
              type="text"
              placeholder="Search doctor, specialization or qualification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 py-3.5 pr-4 pl-11 text-sm font-medium text-slate-800 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15"
            />
          </div>

          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15 lg:min-w-60"
          >
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization === "ALL"
                  ? "All Specializations"
                  : formatText(specialization)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Available Specialists
          </p>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-600/15">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            {filteredDoctors.length}{" "}
            {filteredDoctors.length === 1 ? "Doctor" : "Doctors"}
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/95 py-20 shadow-sm backdrop-blur-xl">
          <Loader2 className="animate-spin text-teal-600" size={36} />
          <p className="mt-3 text-sm font-semibold text-slate-500 animate-pulse">
            Loading doctors...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50/90 p-8 text-center shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle size={28} />
          </div>

          <p className="mt-4 text-base font-bold text-red-700">{error}</p>

          <button
            onClick={fetchDoctors}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* Doctors Grid */}
      {!loading && !error && filteredDoctors.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5"
            >
              {/* Top Accent Bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div>
                <div className="flex items-start gap-4">
                  <div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-600/20 transition-transform duration-300 group-hover:scale-105">
                    <Stethoscope size={28} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-extrabold text-slate-900">
                      Dr. {doctor.fullName}
                    </h2>

                    <p className="mt-0.5 text-sm font-semibold text-teal-600">
                      {formatText(doctor.specialization)}
                    </p>

                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <div className="rounded-lg bg-slate-100/80 p-1.5 text-slate-500">
                      <GraduationCap size={16} />
                    </div>
                    <span className="truncate">
                      {doctor.qualification || "Qualification not specified"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <div className="rounded-lg bg-slate-100/80 p-1.5 text-slate-500">
                      <Clock size={16} />
                    </div>
                    <span>{doctor.experienceYears ?? 0} years experience</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <div className="rounded-lg bg-slate-100/80 p-1.5 text-slate-500">
                      <MapPin size={16} />
                    </div>
                    <span className="truncate">
                      {doctor.clinicAddress || "Address not specified"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                    <div className="rounded-lg bg-teal-50 p-1.5 text-teal-600">
                      <IndianRupee size={16} />
                    </div>
                    <span>
                      {doctor.consultationFee ?? "Not specified"}
                      {doctor.consultationFee != null && (
                        <span className="text-xs font-medium text-slate-400">
                          {" "}
                          / Consultation
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoctor(doctor)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 hover:shadow-lg active:scale-99"
              >
                <UserRound size={17} />
                <span>View Profile</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDoctors.length === 0 && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 py-16 text-center shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Stethoscope size={32} />
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-800">
            No Doctors Found
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Try changing your search or specialization filter.
          </p>
        </div>
      )}

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div className="relative overflow-hidden bg-linear-to-r from-teal-800 to-emerald-700 px-6 py-7 text-white">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-5 right-5 rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white shadow-md backdrop-blur-md">
                  <Stethoscope size={32} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold">
                    Dr. {selectedDoctor.fullName}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-teal-100">
                    {formatText(selectedDoctor.specialization)}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Available for Consultation
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-7">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Detail
                  label="Qualification"
                  value={selectedDoctor.qualification}
                />

                <Detail
                  label="Experience"
                  value={`${selectedDoctor.experienceYears ?? 0} years`}
                />

                <Detail
                  label="Consultation Fee"
                  value={
                    selectedDoctor.consultationFee != null
                      ? `₹${selectedDoctor.consultationFee}`
                      : "Not specified"
                  }
                />

                <Detail label="Email" value={selectedDoctor.email} />

                <Detail label="Phone" value={selectedDoctor.phoneNumber} />

                <Detail
                  label="Clinic Address"
                  value={selectedDoctor.clinicAddress}
                />
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <h4 className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <CalendarDays size={15} className="text-teal-600" />
                  Available Days
                </h4>

                <p className="text-sm font-semibold text-slate-800">
                  {Array.isArray(selectedDoctor.availableDays)
                    ? selectedDoctor.availableDays.map(formatText).join(", ")
                    : selectedDoctor.availableDays || "Not specified"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <h4 className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <Clock size={15} className="text-teal-600" />
                  Consultation Timings
                </h4>

                <p className="text-sm font-semibold text-slate-800">
                  {selectedDoctor.startTime || "--:--"} -{" "}
                  {selectedDoctor.endTime || "--:--"}
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  About Doctor
                </h4>

                <p className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-600">
                  {selectedDoctor.about || "No description available."}
                </p>
              </div>

              <button
                onClick={() => setSelectedDoctor(null)}
                className="w-full rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-50">
    <p className="text-xs font-semibold text-slate-400">{label}</p>

    <p className="mt-1 wrap-break-word text-sm font-bold text-slate-800">
      {value || "Not specified"}
    </p>
  </div>
);

export default PatientFindDoctors;
