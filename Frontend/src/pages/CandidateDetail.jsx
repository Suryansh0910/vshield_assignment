import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, Play, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useCandidateStore } from '../store/candidateStore';

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-${status.toLowerCase()}`}>
    <span className={`status-dot dot-${status.toLowerCase()}`} />
    {status}
  </span>
);

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteCandidate, fetchStats, updateCandidateStatus } = useCandidateStore();

  const [candidate, setCandidate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candRes, logsRes] = await Promise.all([
        api.get(`/candidates/${id}`),
        api.get(`/verifications/${id}/logs`),
      ]);
      setCandidate(candRes.data.data);
      setLogs(logsRes.data.data.logs);
    } catch (err) {
      setError('Failed to fetch candidate details.');
    } finally {
      setLoading(false);
    }
  };

  const startVerification = async () => {
    setVerifying(true);
    try {
      await api.post(`/verifications/${id}/start`);
      const candRes = await api.get(`/candidates/${id}`);
      const updated = candRes.data.data;
      setCandidate(updated);
      // Sync updated status into Zustand store so Dashboard columns reflect it immediately
      updateCandidateStatus(id, updated.status);
      const logsRes = await api.get(`/verifications/${id}/logs`);
      setLogs(logsRes.data.data.logs);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start verification');
    } finally {
      setVerifying(false);
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.post(`/reports/${id}/generate`, {}, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      });

      if (!res.data || res.data.size === 0) throw new Error('Empty PDF response');

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `verification_report_${candidate.fullName}.pdf`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { window.URL.revokeObjectURL(url); link.remove(); }, 100);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${candidate.fullName}? This cannot be undone.`)) return;
    setDeleting(true);
    const result = await deleteCandidate(id);
    if (result.success) {
      fetchStats();
      navigate('/');
    } else {
      alert(result.message);
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <Loader2 className="spin" size={32} color="var(--brand-color)" />
    </div>
  );

  if (error || !candidate) return (
    <div style={{ padding: '2rem', color: 'var(--error-text)' }}>{error || 'Candidate not found'}</div>
  );

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Candidate Details</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            onClick={startVerification}
            disabled={verifying || candidate.status !== 'PENDING'}
            style={{ opacity: candidate.status !== 'PENDING' ? 0.5 : 1 }}
          >
            {verifying ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
            Run Verification
          </button>

          <button
            className="btn btn-outline"
            onClick={downloadReport}
            disabled={downloading || candidate.status === 'PENDING'}
            style={{ opacity: candidate.status === 'PENDING' ? 0.5 : 1 }}
          >
            {downloading ? <Loader2 size={18} className="spin" /> : <FileText size={18} />}
            Download PDF
          </button>

          <button
            className="btn btn-outline"
            onClick={handleDelete}
            disabled={deleting}
            style={{ color: 'var(--error-text)', borderColor: 'var(--error-text)' }}
          >
            {deleting ? <Loader2 size={18} className="spin" /> : <Trash2 size={18} />}
            Delete
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Personal Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div><strong>Full Name:</strong> {candidate.fullName}</div>
            <div><strong>Email:</strong> {candidate.email}</div>
            <div><strong>Phone:</strong> {candidate.phone}</div>
            <div><strong>Date of Birth:</strong> {new Date(candidate.dob).toLocaleDateString()}</div>
            <div><strong>Address:</strong> {candidate.address}</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Identity Documents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div><strong>Aadhaar Number:</strong> {candidate.aadhaarNumber}</div>
            <div><strong>PAN Number:</strong> {candidate.panNumber}</div>
            <div style={{ marginTop: '1rem' }}>
              <strong>Overall Status:</strong>{' '}
              <StatusBadge status={candidate.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Verification logs */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Verification Logs</h3>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)' }}>
            No verification logs yet. Click "Run Verification" to start.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.verifiedAt).toLocaleString()}</td>
                    <td>{log.verificationType}</td>
                    <td><StatusBadge status={log.verificationStatus} /></td>
                    <td>
                      <pre style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', overflowX: 'auto', margin: 0 }}>
                        {JSON.stringify(log.responsePayload, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetail;
