import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { loginSchema } from '../utils/validationSchemas';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/');
    } catch (err) {
      setError('root', {
        message: err.response?.data?.message || 'Authentication failed. Please check your credentials.',
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
              Sign in to vShield
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Enter your details to proceed.
            </p>
          </div>

          {errors.root && (
            <div style={{ padding: '0.875rem', border: '1px solid var(--status-error)', color: 'var(--status-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="name@company.com"
                {...register('email')}
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>

            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="password">Password</label>
                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Forgot?</a>
              </div>
              <input
                id="password"
                type="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
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
              {isSubmitting ? <Loader2 size={20} className="spin" /> : 'Continue'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--text-main)', fontWeight: '500' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
