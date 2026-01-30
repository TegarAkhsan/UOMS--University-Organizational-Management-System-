import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import client from './src/api/client';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { NotificationProvider } from './components/ui/NotificationSystem';

// Dashboards
import { KahimaDashboard as KahimDashboard } from './pages/dashboards/kahim/Dashboard';
import { SekretarisDashboard } from './pages/dashboards/sekretaris/Dashboard';
import { BendaharaDashboard } from './pages/dashboards/bendahara/Dashboard';
import { KadepDashboard } from './pages/dashboards/kadep/Dashboard';
import { CoordinatorDashboard } from './pages/dashboards/coordinator/Dashboard';
import { StaffDashboard } from './pages/dashboards/staff/Dashboard';
import { ProjectLeaderView as KetupelDashboard } from './pages/dashboards/ketupel/Dashboard';

// Features
import { ProgramKerja } from './pages/ProgramKerja';
import { SDM } from './pages/SDM';
import { Departments } from './pages/Departments';
import { Keuangan } from './pages/Keuangan';
import { Asistensi } from './pages/Asistensi';
import { Calendar } from './pages/Calendar';
import { Meetings } from './pages/Meetings';
import { Surat } from './pages/Surat';
import { WorkDistribution } from './pages/WorkDistribution';
import { Chat } from './pages/Chat';
import { NotFound, Forbidden, ServerError } from './pages/ErrorPages';

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
      </Router>
    </NotificationProvider>
  );
}
