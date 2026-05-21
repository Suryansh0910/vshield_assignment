import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useCandidateStore } from './store/candidateStore';

import api from './api/axios';
import { Shield, CheckCircle, Clock, AlertCircle, Users, MinusCircle } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CandidateDetail from './pages/CandidateDetail';

const StatRow = ({ icon, label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
      {icon}
      {label}
    </div>
    <span style={{
      fontWeight: '700',
      fontSize: '0.85rem',
      color: value > 0 ? color : 'var(--text-muted)',
      minWidth: '20px',
      textAlign: 'right',
    }}>
      {value}
    </span>
  </div>
);

const SidebarStats = () => {
  const { stats } = useCandidateStore();

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>
        Live Overview
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        <StatRow icon={<Users size={14} />} label="Total" value={stats.total} color="var(--text-main)" />
        <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.375rem 0' }} />
        <StatRow icon={<MinusCircle size={14} color="var(--status-pending)" />} label="Not Reviewed" value={stats.pending} color="var(--status-pending)" />
        <StatRow icon={<Clock size={14} color="var(--status-partial)" />} label="Partial" value={stats.partial} color="var(--status-partial)" />
        <StatRow icon={<CheckCircle size={14} color="var(--status-success)" />} label="Accepted" value={stats.verified} color="var(--status-success)" />
        <StatRow icon={<AlertCircle size={14} color="var(--status-error)" />} label="Rejected" value={stats.failed} color="var(--status-error)" />
      </div>
    </div>
  );
};

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { fetchCandidates, fetchStats } = useCandidateStore();

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, [fetchCandidates, fetchStats]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--brand-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', letterSpacing: '-0.03em' }}>vShield</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <a href="/" className="nav-link active">
            Dashboard
          </a>

          <SidebarStats />
        </nav>
        
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            Logged in as:<br/>
            <strong style={{ color: 'var(--text-main)' }}>{user?.name}</strong>
          </div>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleLogout}>
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
  if (isLoading) return <div style={{ padding: '2rem' }}>Loading application...</div>;
  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div style={{ padding: '2rem' }}>Loading application...</div>;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        // setUser preserves whatever access token is already in the store
        // (set by the refresh interceptor during the 401 retry)
        setUser(res.data.data.user);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [setUser, setLoading, logout]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidate/:id" element={<CandidateDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
