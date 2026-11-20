import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Droplets,
  MapPin,
  HeartPulse,
  ShieldCheck,
  Save,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get("/patients/profile");

      setProfile(response.data);

      setForm({
        dateOfBirth: response.data.dateOfBirth || "",
        gender: response.data.gender || "",
        bloodGroup: response.data.bloodGroup || "",
        address: response.data.address || "",
        emergencyContactName: response.data.emergencyContactName || "",
        emergencyContactPhone: response.data.emergencyContactPhone || "",
      });
    } catch (err) {
      console.error("Profile loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    api
      .get("/patients/profile")
      .then((response) => {
        if (cancelled) return;

        setProfile(response.data);
        setForm({
          dateOfBirth: response.data.dateOfBirth || "",
          gender: response.data.gender || "",
          bloodGroup: response.data.bloodGroup || "",
          address: response.data.address || "",
          emergencyContactName: response.data.emergencyContactName || "",
          emergencyContactPhone: response.data.emergencyContactPhone || "",
        });
      })
      .catch((err) => {
        if (cancelled) return;

        console.error("Profile loading error:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }

    if (new Date(form.dateOfBirth) > new Date()) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.emergencyContactPhone)) {
      setError("Emergency contact phone must contain exactly 10 digits.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/patients/profile", form);

      setProfile(response.data);

      setForm({
        dateOfBirth: response.data.dateOfBirth || "",
        gender: response.data.gender || "",
        bloodGroup: response.data.bloodGroup || "",
        address: response.data.address || "",
        emergencyContactName: response.data.emergencyContactName || "",
        emergencyContactPhone: response.data.emergencyContactPhone || "",
      });

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update your profile. Please check your information.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-3 text-red-500" size={35} />

        <h2 className="font-bold text-slate-800">Profile unavailable</h2>

        <p className="mt-2 text-sm text-slate-500">
          {error || "Unable to retrieve your profile."}
        </p>

        <button
          onClick={fetchProfile}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-600">
            Patient Portal
          </p>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your personal information and emergency contact details.
          </p>
        </div>

        <button
          onClick={fetchProfile}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Profile Banner */}
      <div className="overflow-hidden rounded-2xl bg-linear-to-r from-blue-700 to-cyan-600 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <UserRound size={34} />
          </div>

          <div>
            <h2 className="text-2xl font-bold">{profile.fullName}</h2>

            <p className="mt-1 text-sm text-blue-100">{profile.email}</p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
              <ShieldCheck size={14} />
              Patient Account
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          <ShieldCheck size={18} />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-800">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your registered account information.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className={labelClass}>Full Name</label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={profile.fullName || ""}
                  readOnly
                  className={`${inputClass} bg-slate-50 pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email Address</label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={profile.email || ""}
                  readOnly
                  className={`${inputClass} bg-slate-50 pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>

              <div className="relative">
                <Phone
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={profile.phoneNumber || "Not provided"}
                  readOnly
                  className={`${inputClass} bg-slate-50 pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Date of Birth *</label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Gender *</label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Blood Group *</label>

              <div className="relative">
                <Droplets
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Address *</label>

              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3 top-4 text-slate-400"
                />

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  maxLength={500}
                  rows={3}
                  required
                  placeholder="Enter your complete address"
                  className={`${inputClass} resize-none pl-10`}
                />
              </div>

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.address.length}/500 characters
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <HeartPulse size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Emergency Contact
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Contact information for emergencies.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className={labelClass}>Emergency Contact Name *</label>

              <input
                type="text"
                name="emergencyContactName"
                value={form.emergencyContactName}
                onChange={handleChange}
                required
                placeholder="Enter contact person's name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Emergency Contact Phone *</label>

              <input
                type="tel"
                name="emergencyContactPhone"
                value={form.emergencyContactPhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);

                  setForm((prev) => ({
                    ...prev,
                    emergencyContactPhone: value,
                  }));

                  setSuccess("");
                }}
                maxLength={10}
                required
                placeholder="Enter 10-digit phone number"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;
