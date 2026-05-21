import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2 } from 'lucide-react';
import AddCandidateModal from '../components/AddCandidateModal';
import { useCandidateStore } from '../store/candidateStore';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { candidates, loading, fetchCandidates } = useCandidateStore();

  // On mount, candidates are already fetched by App.jsx, but we can refetch if needed
  // We'll just rely on the global state and a local refetch when searching
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates(searchTerm);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED': return 'var(--status-success)';
      case 'FAILED': return 'var(--status-error)';
      default: return 'var(--status-pending)';
    }
  };

  const Column = ({ title, status, accentColor }) => {
    const columnCandidates = candidates.filter(c => c.status === status);
    
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '300px' }}>
        {/* Solid Color Header per requirement */}
        <div style={{ 
          backgroundColor: accentColor, 
          color: '#fff', 
          padding: '1rem', 
          borderRadius: 'var(--radius-sm)',
          fontWeight: '600',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{title}</span>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem' }}>
            {columnCandidates.length}
          </span>
        </div>

        {/* Candidate Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {columnCandidates.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2rem' }}>
              No candidates in this pipeline.
            </div>
          ) : (
            columnCandidates.map((cand) => (
              <div 
                key={cand.id} 
                className="card" 
                style={{ padding: '1rem', cursor: 'pointer' }}
                onClick={() => navigate(`/candidate/${cand.id}`)}
              >
                <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {cand.fullName}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {cand.email}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  +91 {cand.phone}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Added: {new Date(cand.createdAt).toLocaleDateString()}</span>
                  <span style={{ color: accentColor, fontWeight: '600' }}>View &rarr;</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Candidate Pipeline</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visualize and track verification status instantly.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', width: '250px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search..."
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Candidate
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', flex: 1 }}>
          <Loader2 className="spin" size={32} color="var(--accent-black)" />
        </div>
      ) : (
        /* 3-Column Kanban Layout */
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
          <Column title="Accepted" status="VERIFIED" accentColor="var(--status-success)" />
          <Column title="Partial" status="PENDING" accentColor="var(--status-pending)" />
          <Column title="Rejected" status="FAILED" accentColor="var(--status-error)" />
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
