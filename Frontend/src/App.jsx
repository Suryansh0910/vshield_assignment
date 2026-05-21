import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useCandidateStore } from './store/candidateStore';
import api from './api/axios';
import { Shield, CheckCircle, Clock, AlertCircle, Users, AlertTriangle } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CandidateDetail from './pages/CandidateDetail';

const SidebarStats = () => {
  const { getStats } = useCandidateStore();
  const stats = getStats();

  const rows = [
    { icon: Users,         color: '#6366f1', label: 'Total',    value: stats.total },
    { icon: CheckCircle,   color: '#10b981', label: 'Verified', value: stats.verified },
    { icon: AlertTriangle, color: '#f59e0b', label: 'Partial',  value: stats.partial },
    { icon: Clock,         color: '#6366f1', label: 'Pending',  value: stats.pending },
    { icon: AlertCircle,   color: '#ef4444', label: 'Failed',   value: stats.failed },
  ];

  return (
    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>
        Live Overview
      </h3>
      {rows.map(({ icon: Icon, color, label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.875rem' }}>
            <Icon size={15} color={color} /> {label}
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{value}</div>
        </div>
      ))}
    </div>
  );
};

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { fetchCandidates } = useCandidateStore();

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    logout();
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <Shield size={24} color="var(--accent-black)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.04em' }}>vShield</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <a href="/" className="nav-link active">Dashboard</a>
          <SidebarStats />
        </nav>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '0.8rem', marginBottom: '0.875rem', color: 'var(--text-muted)' }}>
            Logged in as:<br />
            <strong style={{ color: 'var(--text-main)' }}>{user?.name}</strong>
          </div>
          <button className="btn btn-outline" style={{ width: '100%', padding: '0.625rem' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  const { setAuth, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setAuth(res.data.data.user, null);
      } catch (_) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [setAuth, setLoading, logout]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/"               element={<Dashboard />} />
        <Route path="/candidate/:id"  element={<CandidateDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
