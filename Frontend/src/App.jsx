import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useCandidateStore } from './store/candidateStore';
import api from './api/axios';
import { Shield, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CandidateDetail from './pages/CandidateDetail';

const SidebarStats = () => {
  const { getStats } = useCandidateStore();
  const stats = getStats();

  return (
    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.5rem' }}>
        Live Overview
      </h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.875rem' }}>
          <Users size={16} color="var(--text-muted)" /> Total
        </div>
        <div style={{ fontWeight: '600' }}>{stats.total}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.875rem' }}>
          <CheckCircle size={16} color="var(--status-success)" /> Accepted
        </div>
        <div style={{ fontWeight: '600' }}>{stats.verified}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.875rem' }}>
          <Clock size={16} color="var(--status-pending)" /> Partial
        </div>
        <div style={{ fontWeight: '600' }}>{stats.pending}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.875rem' }}>
          <AlertCircle size={16} color="var(--status-error)" /> Rejected
        </div>
        <div style={{ fontWeight: '600' }}>{stats.failed}</div>
      </div>
    </div>
  );
};

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { fetchCandidates } = useCandidateStore();

  // Fetch globally so sidebar stats populate immediately
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <Shield size={24} color="var(--accent-black)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.04em' }}>vShield</h2>
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
  const { setAuth, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setAuth(res.data.data.user, null);
      } catch (error) {
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
