import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import client from './src/api/client';
import { Layout } from './components/Layout';
import { NotificationProvider } from './components/ui/NotificationSystem';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Memuat...</p>
    </div>
  </div>
);

// Public pages (keep static for fast initial load)
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { NotFound, Forbidden, ServerError } from './pages/ErrorPages';

// Lazy-loaded Dashboards
const KahimDashboard = React.lazy(() => import('./pages/dashboards/kahim/Dashboard').then(m => ({ default: m.KahimaDashboard })));
const SekretarisDashboard = React.lazy(() => import('./pages/dashboards/sekretaris/Dashboard').then(m => ({ default: m.SekretarisDashboard })));
const BendaharaDashboard = React.lazy(() => import('./pages/dashboards/bendahara/Dashboard').then(m => ({ default: m.BendaharaDashboard })));
const KadepDashboard = React.lazy(() => import('./pages/dashboards/kadep/Dashboard').then(m => ({ default: m.KadepDashboard })));
const StaffDashboard = React.lazy(() => import('./pages/dashboards/staff/Dashboard').then(m => ({ default: m.StaffDashboard })));

// Lazy-loaded Features
const ProgramKerja = React.lazy(() => import('./pages/ProgramKerja').then(m => ({ default: m.ProgramKerja })));
const SDM = React.lazy(() => import('./pages/SDM').then(m => ({ default: m.SDM })));
const Departments = React.lazy(() => import('./pages/Departments').then(m => ({ default: m.Departments })));
const Keuangan = React.lazy(() => import('./pages/Keuangan').then(m => ({ default: m.Keuangan })));
const Asistensi = React.lazy(() => import('./pages/Asistensi').then(m => ({ default: m.Asistensi })));
const Calendar = React.lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const Meetings = React.lazy(() => import('./pages/Meetings').then(m => ({ default: m.Meetings })));
const Surat = React.lazy(() => import('./pages/Surat').then(m => ({ default: m.Surat })));
const WorkDistribution = React.lazy(() => import('./pages/WorkDistribution').then(m => ({ default: m.WorkDistribution })));
const Chat = React.lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [members, setMembers] = useState([]);
  const [prokers, setProkers] = useState([]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const refreshData = () => {
    client.get('/users')
      .then(res => setMembers(res.data))
      .catch(err => {
        console.error('Error fetching members:', err);
      });
    client.get('/programs')
      .then(res => setProkers(res.data))
      .catch(err => {
        console.error('Error fetching programs:', err);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      client.get('/user')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('auth_token'));
    }
    refreshData();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };



  // Protected Route Wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };

  return (
    <NotificationProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} onBack={() => { }} /> : <Navigate to="/dashboard" />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
              <Route path="/dashboard" element={
                user?.status === 'superadmin' ? <KahimDashboard user={user} onLogout={handleLogout} setView={() => { }} /> :
                  user?.status === 'sub_super_admin_1' ? <BendaharaDashboard user={user} onLogout={handleLogout} prokers={prokers} /> :
                    user?.status === 'sub_super_admin_2' ? <SekretarisDashboard user={user} onLogout={handleLogout} /> :
                      user?.status === 'admin' ? <KadepDashboard user={user} onLogout={handleLogout} members={members} setMembers={setMembers} prokers={prokers} setProkers={setProkers} refreshData={refreshData} /> :
                        user?.role === 'ketupel' ? <StaffDashboard user={user} onLogout={handleLogout} members={members} prokers={prokers} setProkers={setProkers} refreshData={refreshData} /> :
                          <StaffDashboard user={user} onLogout={handleLogout} members={members} prokers={prokers} setProkers={setProkers} refreshData={refreshData} />
              } />

              {/* Specific Dashboard Routes (Optional, can be used for direct access if needed) */}
              <Route path="/dashboard/kahim" element={<KahimDashboard user={user} onLogout={handleLogout} setView={() => { }} />} />
              <Route path="/dashboard/sekretaris" element={<SekretarisDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/dashboard/bendahara" element={<BendaharaDashboard user={user} onLogout={handleLogout} prokers={prokers} />} />
              <Route path="/dashboard/kadep" element={<KadepDashboard user={user} onLogout={handleLogout} members={members} setMembers={setMembers} prokers={prokers} setProkers={setProkers} refreshData={refreshData} />} />

              {/* Feature Routes */}
              <Route path="/proker" element={<ProgramKerja prokers={prokers} setProkers={setProkers} members={members} />} />
              <Route path="/sdm" element={<SDM members={members} setMembers={setMembers} prokers={prokers} user={user} />} />
              <Route path="/departments" element={<Departments members={members} prokers={prokers} setProkers={setProkers} />} />
              <Route path="/keuangan" element={<Keuangan />} />
              <Route path="/surat" element={<Surat />} />
              <Route path="/asistensi" element={<Asistensi />} />
              <Route path="/calendar" element={<Calendar prokers={prokers} setProkers={setProkers} members={members} />} />
              <Route path="/meetings" element={<Meetings user={user} prokers={prokers} />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/work-distribution" element={<WorkDistribution user={user} members={members} prokers={prokers} />} />
            </Route>

            {/* Error Routes */}
            <Route path="/403" element={<Forbidden />} />
            <Route path="/500" element={<ServerError />} />

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </NotificationProvider>
  );
}
