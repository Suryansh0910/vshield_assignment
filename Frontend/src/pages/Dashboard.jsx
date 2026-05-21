import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, Users, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import AddCandidateModal from '../components/AddCandidateModal';
import { useCandidateStore } from '../store/candidateStore';


const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
    <div style={{
      width: 44, height: 44, borderRadius: 'var(--radius-sm)',
      backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: '300', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>{label}</div>
    </div>
  </div>
);


const Column = ({ title, status, accentColor, candidates, onClickCandidate }) => {
  const filtered = candidates.filter(c => c.status === status);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem', minWidth: '240px' }}>
      <div style={{
        backgroundColor: accentColor, color: '#fff', padding: '0.875rem 1rem',
        borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '0.875rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>{title}</span>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.22)', padding: '0.125rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem' }}>
          {filtered.length}
        </span>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1,
        backgroundColor: 'var(--bg-main)', padding: '0.875rem', borderRadius: 'var(--radius-md)',
        minHeight: '120px'
      }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
            No candidates here.
          </div>
        ) : (
          filtered.map(cand => (
            <div
              key={cand.id}
              className="card"
              style={{ padding: '0.875rem', cursor: 'pointer' }}
              onClick={() => onClickCandidate(cand.id)}
            >
              <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '0.925rem' }}>
                {cand.fullName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>{cand.email}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>+91 {cand.phone}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Added {new Date(cand.createdAt).toLocaleDateString('en-IN')}</span>
                <span style={{ color: accentColor, fontWeight: '600' }}>View →</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { candidates, loading, fetchCandidates, getStats } = useCandidateStore();
  const stats = getStats();

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates(searchTerm);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Candidate Pipeline</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track and manage background verification in real time.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search candidates..."
                style={{ paddingLeft: '2.25rem', width: '220px', padding: '0.625rem 0.875rem 0.625rem 2.25rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-outline" style={{ padding: '0.625rem 1rem' }}>Search</button>
          </form>
          <button className="btn btn-primary" style={{ padding: '0.625rem 1.25rem' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Candidate
          </button>
        </div>
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <StatCard icon={Users}         label="Total"    value={stats.total}   color="#6366f1" />
        <StatCard icon={CheckCircle}   label="Verified" value={stats.verified} color="#10b981" />
        <StatCard icon={AlertTriangle} label="Partial"  value={stats.partial}  color="#f59e0b" />
        <StatCard icon={XCircle}       label="Failed"   value={stats.failed}   color="#ef4444" />
      </div>

      {}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 className="spin" size={32} color="var(--accent-black)" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          <Column title="Verified"  status="VERIFIED" accentColor="#10b981" candidates={candidates} onClickCandidate={(id) => navigate(`/candidate/${id}`)} />
          <Column title="Partial"   status="PARTIAL"  accentColor="#f59e0b" candidates={candidates} onClickCandidate={(id) => navigate(`/candidate/${id}`)} />
          <Column title="Pending"   status="PENDING"  accentColor="#6366f1" candidates={candidates} onClickCandidate={(id) => navigate(`/candidate/${id}`)} />
          <Column title="Failed"    status="FAILED"   accentColor="#ef4444" candidates={candidates} onClickCandidate={(id) => navigate(`/candidate/${id}`)} />
        </div>
      )}

      <AddCandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchCandidates(searchTerm)}
      />
    </div>
  );
};

export default Dashboard;
