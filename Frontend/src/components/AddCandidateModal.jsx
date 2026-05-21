import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { candidateSchema } from '../utils/validationSchemas';

const Field = ({ label, error, children }) => (
  <div className="input-group" style={{ marginBottom: 0 }}>
    <label>{label}</label>
    {children}
    {error && (
      <span style={{ color: 'var(--error-text)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
        {error}
      </span>
    )}
  </div>
);

const EMPTY = { fullName: '', email: '', phone: '', aadhaarNumber: '', panNumber: '', dob: '', address: '' };

const AddCandidateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Uppercase PAN as the user types — the actual stored value matches backend regex
    const transformed = name === 'panNumber' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: transformed }));
    // Clear the error for the field being edited
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setFieldErrors({});

    // Client-side Zod validation
    const result = candidateSchema.safeParse(formData);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/candidates', result.data);
      onSuccess();
      onClose();
      setFormData(EMPTY);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        // Backend Zod field-level errors
        setFieldErrors(data.errors);
      } else {
        setServerError(data?.message || 'Failed to add candidate.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Add New Candidate</h2>
          <button onClick={onClose} style={{ padding: '0.25rem', borderRadius: '4px', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {serverError && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Full Name" error={fieldErrors.fullName}>
              <input name="fullName" type="text" className="input" value={formData.fullName} onChange={handleChange} />
            </Field>
            <Field label="Email" error={fieldErrors.email}>
              <input name="email" type="email" className="input" value={formData.email} onChange={handleChange} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Phone Number (10 digits)" error={fieldErrors.phone}>
              <input name="phone" type="text" className="input" value={formData.phone} onChange={handleChange} maxLength={10} />
            </Field>
            <Field label="Date of Birth" error={fieldErrors.dob}>
              <input name="dob" type="date" className="input" value={formData.dob} onChange={handleChange} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Aadhaar Number (12 digits)" error={fieldErrors.aadhaarNumber}>
              <input name="aadhaarNumber" type="text" className="input" value={formData.aadhaarNumber} onChange={handleChange} maxLength={12} />
            </Field>
            <Field label="PAN Number (e.g. ABCDE1234F)" error={fieldErrors.panNumber}>
              <input name="panNumber" type="text" className="input" value={formData.panNumber} onChange={handleChange} maxLength={10} />
            </Field>
          </div>

          <Field label="Full Address" error={fieldErrors.address}>
            <textarea name="address" className="input" value={formData.address} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
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
