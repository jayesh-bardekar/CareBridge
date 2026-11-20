import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminLaboratory from "./pages/admin/AdminLaboratory";
import AdminPharmacies from "./pages/admin/AdminPharmacies";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorMedicalRecords from "./pages/doctor/DoctorMedicalRecords";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";
import DoctorProfile from "./pages/doctor/DoctorProfile";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientFindDoctors from "./pages/patient/PatientFindDoctors";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientMedicalRecords from "./pages/patient/PatientMedicalRecords";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientLabReports from "./pages/patient/PatientLabReports";
import PatientNotifications from "./pages/patient/PatientNotifications";
import PatientProfile from "./pages/patient/PatientProfile";

// Lab Staff Pages
import LabDashboard from "./pages/lab/LabDashboard";
import LabOrders from "./pages/lab/LabOrders";
import LabReports from "./pages/lab/LabReports";
import LabNotifications from "./pages/lab/LabNotifications";

// Pharmacist Pages
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions";
import PharmacyInventory from "./pages/pharmacy/PharmacyInventory";
import PharmacyNotifications from "./pages/pharmacy/PharmacyNotifications";

import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/laboratory" element={<AdminLaboratory />} />
            <Route path="/admin/pharmacies" element={<AdminPharmacies />} />
            <Route
              path="/admin/notifications"
              element={<AdminNotifications />}
            />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Doctor Routes */}
        <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route
              path="/doctor/appointments"
              element={<DoctorAppointments />}
            />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route
              path="/doctor/medical-records"
              element={<DoctorMedicalRecords />}
            />
            <Route
              path="/doctor/prescriptions"
              element={<DoctorPrescriptions />}
            />
            <Route
              path="/doctor/notifications"
              element={<DoctorNotifications />}
            />
            <Route path="/doctor/settings" element={<DoctorProfile />} />
          </Route>
        </Route>

        {/* Patient Routes */}
        <Route element={<ProtectedRoute allowedRoles={["PATIENT"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/doctors" element={<PatientFindDoctors />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/medical-records" element={<PatientMedicalRecords />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/lab-reports" element={<PatientLabReports />} />
            <Route path="/patient/notifications" element={<PatientNotifications />} />
            <Route path="/patient/settings" element={<PatientProfile />} />
          </Route>
        </Route>

        {/* Lab Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={["LAB_STAFF"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/lab/dashboard" element={<LabDashboard />} />
            <Route path="/lab/orders" element={<LabOrders />} />
            <Route path="/lab/reports" element={<LabReports />} />
            <Route path="/lab/notifications" element={<LabNotifications />} />
          </Route>
        </Route>

        {/* Pharmacist Routes */}
        <Route element={<ProtectedRoute allowedRoles={["PHARMACIST"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/prescriptions" element={<PharmacyPrescriptions />} />
            <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
            <Route path="/pharmacy/notifications" element={<PharmacyNotifications />} />
          </Route>
        </Route>

        {/* Other Routes */}
        <Route path="/unauthorized" element={<h1>403 - Access Denied</h1>} />

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
