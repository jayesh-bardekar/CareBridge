import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { HeartPulse, LogOut, UserCircle } from "lucide-react";

const RoleDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-600 p-2 text-white">
            <HeartPulse size={25} />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">CareBridge</h1>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={17} />
          Logout
        </button>
      </header>

      {/* Dashboard Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <UserCircle size={42} className="text-teal-600" />

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Welcome to CareBridge
              </h2>

              <p className="text-sm text-slate-500">
                Your healthcare management portal
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-teal-50 p-5">
            <p className="text-sm text-slate-500">Logged-in User</p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
              {user?.email}
            </p>

            <p className="mt-2 inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">
              {user?.role}
            </p>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Your personalized {user?.role?.toLowerCase()} dashboard will be
            developed in the upcoming steps.
          </p>
        </div>
      </main>
    </div>
  );
};

export default RoleDashboard;
