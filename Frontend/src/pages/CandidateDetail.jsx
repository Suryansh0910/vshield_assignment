import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, FileText, Loader2, Play } from 'lucide-react';
import api from '../api/axios';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candRes, logsRes] = await Promise.all([
        api.get(`/candidates/${id}`),
        api.get(`/verifications/${id}/logs`)
      ]);
      setCandidate(candRes.data.data);
      setLogs(logsRes.data.data.logs);
    } catch (err) {
      setError('Failed to fetch candidate details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startVerification = async () => {
    setVerifying(true);
    try {
      await api.post(`/verifications/${id}/start`);
      await fetchData(); // Refresh data to get new status and logs
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start verification');
    } finally {
      setVerifying(false);
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.post(`/reports/${id}/generate`, {}, { responseType: 'blob' });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `verification_report_${candidate.fullName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate/download report');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="spin" size={32} color="var(--brand-color)" /></div>;
  }

  if (error || !candidate) {
    return <div style={{ padding: '2rem', color: 'var(--error-text)' }}>{error || 'Candidate not found'}</div>;
  }

  return (
    <div>
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Candidate Details</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
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
            Download PDF Report
          </button>
        </div>
      </div>

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
              <strong>Overall Status:</strong> 
              <span className={`status-badge status-${candidate.status.toLowerCase()}`} style={{ marginLeft: '0.5rem' }}>
                {candidate.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Verification Logs</h3>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)' }}>No verification logs found. Click "Run Verification" to start.</div>
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
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {log.verificationStatus === 'VERIFIED' ? <CheckCircle size={14} color="var(--success-text)" /> : <AlertCircle size={14} color="var(--error-text)" />}
                        <span style={{ fontWeight: '500', color: log.verificationStatus === 'VERIFIED' ? 'var(--success-text)' : 'var(--error-text)' }}>
                          {log.verificationStatus}
                        </span>
                      </div>
                    </td>
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
