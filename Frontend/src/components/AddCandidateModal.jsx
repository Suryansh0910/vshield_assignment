import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../api/axios';

const AddCandidateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    panNumber: '',
    dob: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/candidates', formData);
      onSuccess(); // Refresh candidate list
      onClose(); // Close modal
      setFormData({
        fullName: '', email: '', phone: '', aadhaarNumber: '', panNumber: '', dob: '', address: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add candidate. Please check formatting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Add New Candidate</h2>
          <button onClick={onClose} style={{ padding: '0.25rem', borderRadius: '4px', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Full Name</label>
              <input name="fullName" type="text" className="input" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Email</label>
              <input name="email" type="email" className="input" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Phone Number (10 digits)</label>
              <input name="phone" type="text" className="input" value={formData.phone} onChange={handleChange} required pattern="\d{10}" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Date of Birth</label>
              <input name="dob" type="date" className="input" value={formData.dob} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Aadhaar Number (12 digits)</label>
              <input name="aadhaarNumber" type="text" className="input" value={formData.aadhaarNumber} onChange={handleChange} required pattern="\d{12}" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>PAN Number (e.g. ABCDE1234F)</label>
              <input name="panNumber" type="text" className="input" value={formData.panNumber} onChange={handleChange} required pattern="[A-Za-z]{5}\d{4}[A-Za-z]{1}" style={{ textTransform: 'uppercase' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Full Address</label>
            <textarea name="address" className="input" value={formData.address} onChange={handleChange} required rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : 'Create Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
