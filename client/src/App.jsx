import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import ScannerPage from './pages/ScannerPage';
import PaymentsPage from './pages/PaymentsPage';
import WardenAllocation from './pages/WardenAllocation';
import ProfilePage from './pages/ProfilePage';
import WardenOverview from './pages/WardenOverview';
import PassPage from './pages/PassPage';
import MaintenancePage from './pages/MaintenancePage';
import WardenMaintenance from './pages/WardenMaintenance';
import AdminStaffPage from './pages/AdminStaffPage';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin/staff" element={<ProtectedRoute roles={['ADMIN']}><AdminStaffPage /></ProtectedRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute roles={['STUDENT']}>< ProfilePage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute roles={['STUDENT']}><PaymentsPage /></ProtectedRoute>} />
      <Route path="/pass" element={<ProtectedRoute roles={['STUDENT']}><PassPage /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute roles={['STUDENT']}><MaintenancePage /></ProtectedRoute>} />

      <Route path="/warden/dashboard" element={<ProtectedRoute roles={['WARDEN']}><WardenOverview /></ProtectedRoute>} />
      <Route path="/warden/verify" element={<ProtectedRoute roles={['WARDEN']}><WardenDashboard /></ProtectedRoute>} />
      <Route path="/warden/allocation" element={<ProtectedRoute roles={['WARDEN']}><WardenAllocation /></ProtectedRoute>} />
      <Route path="/warden/maintenance" element={<ProtectedRoute roles={['WARDEN']}><WardenMaintenance /></ProtectedRoute>} />

      <Route path="/scanner" element={<ProtectedRoute roles={['GATE_STAFF']}><ScannerPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}