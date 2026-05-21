import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { registerSchema } from '../utils/validationSchemas';

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      
      const res = await api.post('/auth/login', { email: data.email, password: data.password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/');
    } catch (err) {
      setError('root', {
        message: err.response?.data?.message || 'Failed to create account. Please try again.',
      });
    }
  };

  return (
    <div className="dot-bg" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Shield size={40} color="var(--accent-black)" />
        </div>

        <div className="glass-card">
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '600', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
              Create your account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Start verifying instantly.
            </p>
          </div>

          {errors.root && (
            <div style={{ padding: '0.875rem', border: '1px solid var(--status-error)', color: 'var(--status-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Jane Doe"
                {...register('name')}
              />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="email">Work Email</label>
              <input
                id="email"
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="jane@company.com"
                {...register('email')}
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>

            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 6 characters"
                {...register('password')}
              />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 size={20} className="spin" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: '500' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
