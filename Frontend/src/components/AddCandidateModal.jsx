import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/axios';
import { candidateSchema } from '../utils/validationSchemas';

const FieldError = ({ error }) =>
  error ? <span className="field-error">{error.message}</span> : null;

const AddCandidateModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(candidateSchema),
  });

  
  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await api.post('/candidates', data);
      onSuccess();
      onClose();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        
        Object.entries(apiErrors).forEach(([field, message]) => {
          setError(field, { message });
        });
      } else {
        setError('root', {
          message: err.response?.data?.message || 'Failed to add candidate.',
        });
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto' }}>
        {}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Add New Candidate</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Fill in the details below to start a verification.
            </p>
          </div>
          <button onClick={onClose} style={{ padding: '0.25rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {errors.root && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: 'var(--status-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Full Name *</label>
              <input
                type="text"
                className={`input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Rahul Sharma"
                {...register('fullName')}
              />
              <FieldError error={errors.fullName} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Email Address *</label>
              <input
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="rahul@company.com"
                {...register('email')}
              />
              <FieldError error={errors.email} />
            </div>
          </div>

          {}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Phone Number * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(10 digits)</span></label>
              <input
                type="text"
                className={`input ${errors.phone ? 'input-error' : ''}`}
                placeholder="9876543210"
                maxLength={10}
                {...register('phone')}
              />
              <FieldError error={errors.phone} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Date of Birth *</label>
              <input
                type="date"
                className={`input ${errors.dob ? 'input-error' : ''}`}
                {...register('dob')}
              />
              <FieldError error={errors.dob} />
            </div>
          </div>

          {}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Identity Documents
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Aadhaar Number * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(12 digits)</span></label>
                <input
                  type="text"
                  className={`input ${errors.aadhaarNumber ? 'input-error' : ''}`}
                  placeholder="123456789012"
                  maxLength={12}
                  {...register('aadhaarNumber')}
                />
                <FieldError error={errors.aadhaarNumber} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>PAN Number * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(e.g. ABCDE1234F)</span></label>
                <input
                  type="text"
                  className={`input ${errors.panNumber ? 'input-error' : ''}`}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                  {...register('panNumber')}
                />
                <FieldError error={errors.panNumber} />
              </div>
            </div>
          </div>

          {}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Full Address *</label>
            <textarea
              className={`input ${errors.address ? 'input-error' : ''}`}
              placeholder="Flat 101, MG Road, Mumbai, Maharashtra – 400001"
              rows={3}
              style={{ resize: 'vertical' }}
              {...register('address')}
            />
            <FieldError error={errors.address} />
          </div>

          {}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={18} className="spin" /> : 'Create Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
