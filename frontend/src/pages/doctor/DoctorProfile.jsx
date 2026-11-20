import { useCallback, useEffect, useState } from "react";
import {
  UserRound,
  Stethoscope,
  GraduationCap,
  BriefcaseMedical,
  IndianRupee,
  MapPin,
  CalendarDays,
  Clock,
  ShieldCheck,
  Save,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const specializations = [
  "GENERAL_PHYSICIAN",
  "CARDIOLOGIST",
  "DERMATOLOGIST",
  "NEUROLOGIST",
  "ORTHOPEDIC",
  "PEDIATRICIAN",
  "GYNECOLOGIST",
  "DENTIST",
  "OPHTHALMOLOGIST",
  "PSYCHIATRIST",
  "ENT_SPECIALIST",
  "UROLOGIST",
  "ONCOLOGIST",
  "OTHER",
];

const emptyForm = {
  specialization: "",
  qualification: "",
  experienceYears: "",
  consultationFee: "",
  about: "",
  clinicAddress: "",
  availableDays: "",
  startTime: "",
  endTime: "",
};

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 hover:border-teal-400 hover:bg-white focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-500/15";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500";

const formatLabel = (value = "") =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateForm = (data) => {
    setForm({
      specialization: data.specialization || "",
      qualification: data.qualification || "",
      experienceYears: data.experienceYears ?? "",
      consultationFee: data.consultationFee ?? "",
      about: data.about || "",
      clinicAddress: data.clinicAddress || "",
      availableDays: data.availableDays || "",
      startTime: data.startTime?.slice(0, 5) || "",
      endTime: data.endTime?.slice(0, 5) || "",
    });
  };

  const fetchProfile = useCallback(() => api.get("/doctors/profile"), []);

  const handleProfileResponse = useCallback((response) => {
    setError("");
    setSuccess("");
    setProfile(response.data);
    updateForm(response.data);
  }, []);

  const handleProfileError = useCallback((err) => {
    setError(
      err.response?.data?.message ||
        "Unable to load your doctor profile. Please try again.",
    );
  }, []);

  const reloadProfile = () => {
    setLoading(true);
    setError("");
    setSuccess("");
    fetchProfile()
      .then(handleProfileResponse)
      .catch(handleProfileError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;

    fetchProfile()
      .then((response) => {
        if (active) handleProfileResponse(response);
      })
      .catch((err) => {
        if (active) handleProfileError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchProfile, handleProfileError, handleProfileResponse]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (Number(form.experienceYears) < 0) {
      setError("Experience cannot be negative.");
      return;
    }

    if (Number(form.consultationFee) < 0) {
      setError("Consultation fee cannot be negative.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("End time must be later than start time.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        specialization: form.specialization,
        qualification: form.qualification.trim(),
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
        about: form.about.trim(),
        clinicAddress: form.clinicAddress.trim(),
        availableDays: form.availableDays.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
      };

      const response = await api.put("/doctors/profile", payload);

      setProfile(response.data);
      updateForm(response.data);

      setSuccess("Doctor profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update your profile. Please check your details.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getApprovalStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
      case "PENDING":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
      case "REJECTED":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      default:
        return "bg-slate-100 text-slate-600 ring-1 ring-slate-600/20";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-teal-600">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading doctor profile...
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50/90 p-8 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-4 text-red-600">
          <div className="rounded-2xl bg-red-100 p-3">
            <AlertCircle size={26} />
          </div>
          <div>
            <h4 className="text-base font-bold">Profile not found</h4>
            <p className="mt-0.5 text-sm font-medium text-red-500">
              {error || "Unable to retrieve profile information."}
            </p>
          </div>
        </div>

        <button
          onClick={reloadProfile}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-800 via-teal-700 to-emerald-700 p-8 text-white shadow-2xl shadow-teal-950/20 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-widest text-teal-100 uppercase backdrop-blur-md">
              <Sparkles size={13} className="text-emerald-400 animate-pulse" />
              <span>Doctor Portal</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-teal-50 sm:text-base">
              Manage your professional information and consultation details.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${getApprovalStyle(profile.approvalStatus)}`}
          >
            <ShieldCheck size={16} />
            {formatLabel(profile.approvalStatus)}
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="bg-linear-to-r from-teal-700 via-teal-600 to-emerald-600 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-md">
              <UserRound size={38} />
            </div>

            <div className="text-white">
              <h2 className="text-xl font-extrabold sm:text-2xl">
                {profile.fullName}
              </h2>

              <p className="mt-1 text-sm font-semibold text-teal-100">
                {formatLabel(profile.specialization)}
              </p>

              <p className="mt-1.5 text-xs text-teal-200">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-3 sm:p-8">
          <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition-all hover:bg-slate-50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Experience
            </p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              {profile.experienceYears ?? 0} Years
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition-all hover:bg-slate-50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Consultation Fee
            </p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              ₹{profile.consultationFee ?? 0}
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition-all hover:bg-slate-50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Qualification
            </p>
            <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-900">
              {profile.qualification || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-emerald-500"
          />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-2xs">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Your registered account details
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                value={profile.fullName || ""}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-slate-100/70`}
              />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                value={profile.email || ""}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-slate-100/70`}
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                value={profile.phoneNumber || "Not provided"}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-slate-100/70`}
              />
            </div>

            <div>
              <label className={labelClass}>Doctor ID</label>
              <input
                value={profile.id || ""}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-slate-100/70`}
              />
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
              <Stethoscope size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Professional Information
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Update your medical qualifications and experience
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Specialization *</label>
              <select
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select specialization</option>
                {specializations.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Qualification *</label>
              <div className="relative">
                <GraduationCap
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="e.g. MBBS, MD"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Experience (Years) *</label>
              <div className="relative">
                <BriefcaseMedical
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Consultation Fee (₹) *</label>
              <div className="relative">
                <IndianRupee
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  name="consultationFee"
                  value={form.consultationFee}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass}>About</label>
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              placeholder="Write a short professional introduction..."
              className={inputClass}
            />
            <p className="mt-1.5 text-right text-xs font-medium text-slate-400">
              {form.about.length}/1000
            </p>
          </div>
        </section>

        {/* Clinic Information */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-2xs">
              <MapPin size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Clinic & Availability
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Manage your clinic address and consultation schedule
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Clinic Address *</label>
            <textarea
              name="clinicAddress"
              value={form.clinicAddress}
              onChange={handleChange}
              required
              rows={3}
              maxLength={500}
              placeholder="Enter your clinic address"
              className={inputClass}
            />
          </div>

          <div className="mt-5">
            <label className={labelClass}>Available Days *</label>
            <div className="relative">
              <CalendarDays
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                name="availableDays"
                value={form.availableDays}
                onChange={handleChange}
                required
                maxLength={150}
                placeholder="e.g. Monday, Tuesday, Wednesday, Friday"
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Start Time *</label>
              <div className="relative">
                <Clock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>End Time *</label>
              <div className="relative">
                <Clock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse justify-end gap-3.5 sm:flex-row">
          <button
            type="button"
            onClick={reloadProfile}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            <span>Reset Changes</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
