import { useEffect, useState } from "react";

import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings,
  CalendarDays,
} from "lucide-react";

import api from "../../services/api";

const AdminSettings = () => {
  const [profile, setProfile] = useState({
    id: null,
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    enabled: true,
    createdAt: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/admin/profile");

        if (!active) return;

        setProfile(response.data);
        setFormData({
          fullName: response.data.fullName || "",
          phoneNumber: response.data.phoneNumber || "",
        });
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load admin profile.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // HANDLE INPUT CHANGE

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // UPDATE ADMIN PROFILE

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.fullName.trim().length < 3) {
      setError("Full name must contain at least 3 characters.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put("/admin/profile", {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      setProfile(response.data);

      setFormData({
        fullName: response.data.fullName,
        phoneNumber: response.data.phoneNumber,
      });

      setSuccess("Admin profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update admin profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  // FORMAT DATE

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-teal-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading admin settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10">
      {/* PAGE HEADER */}

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-600">
          <Settings size={16} />
          Administration
          <span className="text-slate-300">/</span>
          Settings
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Admin Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your account information and preferences.
        </p>
      </div>

      {/* PROFILE OVERVIEW */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-linear-to-r from-teal-600 to-cyan-600 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg">
              <UserRound size={38} />
            </div>

            <div className="text-white">
              <h2 className="text-2xl font-bold">{profile.fullName}</h2>

              <p className="mt-1 text-sm text-teal-50">{profile.email}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold">
                  {profile.role}
                </span>

                <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold">
                  <CheckCircle2 size={13} />
                  {profile.enabled ? "Active Account" : "Inactive Account"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ACCOUNT DETAILS */}

        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Mail size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Email Address
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CalendarDays size={21} />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Account Created
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE FORM */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-bold text-slate-800">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update your personal account information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          {/* ERROR MESSAGE */}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* SUCCESS MESSAGE */}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* FULL NAME */}

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
            </div>

            {/* PHONE NUMBER */}

            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3 pr-4 pl-11 text-sm text-slate-500 outline-none"
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Email address cannot be changed here.
              </p>
            </div>

            {/* ROLE */}

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Account Role
              </label>

              <div className="relative">
                <ShieldCheck
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="role"
                  name="role"
                  type="text"
                  value={profile.role}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3 pr-4 pl-11 text-sm text-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  fullName: profile.fullName,
                  phoneNumber: profile.phoneNumber,
                });
                setError("");
                setSuccess("");
              }}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Reset Changes
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
