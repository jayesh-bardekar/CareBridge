import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const HOSPITAL_BG_URL =
  "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=1920";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(formData);

      const roleRoutes = {
        ADMIN: "/admin/dashboard",
        DOCTOR: "/doctor/dashboard",
        PATIENT: "/patient/dashboard",
        LAB_STAFF: "/lab/dashboard",
        PHARMACIST: "/pharmacy/dashboard",
      };

      navigate(roleRoutes[user.role] || "/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-10">
      {/* Hospital Building Exterior Background */}
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat transition-transform duration-700"
        style={{
          backgroundImage: `url('${HOSPITAL_BG_URL}')`,
        }}
      />

      {/* Crisp Teal-Slate Glass Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-950/75 via-teal-950/60 to-slate-900/80 backdrop-blur-[2px]" />

      {/* Ambient Accent Glows */}
      <div className="pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -bottom-28 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

      {/* Main Frosted Glass Card (Top Line Removed + Enhanced Multi-Layer Shadow) */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/50 bg-white/95 p-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65),0_0_40px_-10px_rgba(20,184,166,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_32px_80px_-15px_rgba(0,0,0,0.75),0_0_50px_-8px_rgba(20,184,166,0.4)] sm:p-10">
        {/* Header & Branding */}
        <div className="mb-8 text-center">
          <div className="group mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:shadow-teal-500/40">
            <HeartPulse
              size={32}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          <h1 className="bg-linear-to-r from-slate-900 via-slate-800 to-teal-900 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            CareBridge
          </h1>

          <p className="mt-1 text-xs font-semibold tracking-wider text-teal-600 uppercase">
            Multi-Specialty Hospital Network
          </p>

          <div className="mt-6">
            <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to access your clinical portal
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 transition-all duration-200 hover:border-teal-400 hover:bg-white focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/15">
              <Mail
                size={18}
                className="text-slate-400 transition-colors duration-200 group-focus-within:text-teal-600"
              />

              <input
                type="email"
                name="email"
                placeholder="name@hospital.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>
            </div>

            <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 transition-all duration-200 hover:border-teal-400 hover:bg-white focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/15">
              <Lock
                size={18}
                className="text-slate-400 transition-colors duration-200 group-focus-within:text-teal-600"
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-teal-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm font-medium text-red-600 shadow-sm">
              <AlertCircle size={18} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-teal-500 hover:to-emerald-500 hover:shadow-xl hover:shadow-teal-600/40 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </form>

        {/* Footer / Register Link */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-teal-600 underline-offset-4 transition-colors duration-200 hover:text-teal-700 hover:underline"
            >
              Create Account
            </Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>Secure Healthcare Access Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
