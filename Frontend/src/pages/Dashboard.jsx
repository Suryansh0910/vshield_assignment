import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2 } from 'lucide-react';
import AddCandidateModal from '../components/AddCandidateModal';
import { useCandidateStore } from '../store/candidateStore';

const COLUMNS = [
  {
    title: 'Not Reviewed',
    status: 'PENDING',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    dotClass: 'dot-pending',
  },
  {
    title: 'Partial',
    status: 'PARTIAL',
    color: '#D97706',
    bgColor: '#FFFBEB',
    dotClass: 'dot-partial',
  },
  {
    title: 'Accepted',
    status: 'VERIFIED',
    color: '#059669',
    bgColor: '#ECFDF5',
    dotClass: 'dot-verified',
  },
  {
    title: 'Rejected',
    status: 'FAILED',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    dotClass: 'dot-failed',
  },
];

const CandidateCard = ({ cand, accentColor, navigate }) => (
  <div
    className="card"
    style={{ padding: '1rem', cursor: 'pointer' }}
    onClick={() => navigate(`/candidate/${cand.id}`)}
  >
    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.375rem', fontSize: '0.9rem' }}>
      {cand.fullName}
    </div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
      {cand.email}
    </div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
      +91 {cand.phone}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>Added: {new Date(cand.createdAt).toLocaleDateString()}</span>
      <span style={{ color: accentColor, fontWeight: '600', fontSize: '0.8rem' }}>View &rarr;</span>
    </div>
  </div>
);

const Column = ({ title, status, color, bgColor, candidates, navigate }) => {
  const columnCandidates = candidates.filter(c => c.status === status);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '220px' }}>
      {/* Column header */}
      <div style={{
        backgroundColor: bgColor,
        border: `1px solid ${color}30`,
        color: color,
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        fontWeight: '700',
        fontSize: '0.85rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}>
        <span>{title}</span>
        <span style={{
          backgroundColor: color,
          color: '#fff',
          padding: '0.125rem 0.5rem',
          borderRadius: '999px',
          fontSize: '0.7rem',
          fontWeight: '700',
          minWidth: '20px',
          textAlign: 'center',
        }}>
          {columnCandidates.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flex: 1,
        backgroundColor: 'var(--bg-main)',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        minHeight: '200px',
      }}>
        {columnCandidates.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2rem', lineHeight: 1.5 }}>
            No candidates<br />in this pipeline.
          </div>
        ) : (
          columnCandidates.map((cand) => (
            <CandidateCard key={cand.id} cand={cand} accentColor={color} navigate={navigate} />
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

  const { candidates, loading, fetchCandidates } = useCandidateStore();

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates(searchTerm);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Candidate Pipeline</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Visualize and track verification status instantly.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="input"
                placeholder="Search candidates..."
                style={{ paddingLeft: '2.25rem', width: '220px', fontSize: '0.875rem' }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value === '') fetchCandidates('');
                }}
              />
            </div>
          </form>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Candidate
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', flex: 1 }}>
          <Loader2 className="spin" size={28} color="var(--brand-color)" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
          {COLUMNS.map((col) => (
            <Column
              key={col.status}
              title={col.title}
              status={col.status}
              color={col.color}
              bgColor={col.bgColor}
              candidates={candidates}
              navigate={navigate}
            />
          ))}
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
