import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      eyebrow="Secure access"
      title="Chat instantly with your team."
      subtitle="Welcome back"
      description="Sign in to continue your conversations with a polished, modern workspace."
      features={[
        { icon: '✦', label: 'Real-time team rooms' },
        { icon: '⚡', label: 'Instant collaboration' },
        { icon: '✓', label: 'Private and secure' },
      ]}
      footerText="New here?"
      footerLinkText="Create an account"
      footerLinkTo="/signup"
      termsText="By continuing, you agree to our Terms and Privacy Policy."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <AuthInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon="✉"
          autoComplete="email"
        />

        <AuthInput
          id="password"
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon="◎"
          autoComplete="current-password"
        />

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? (
            <span className="btn__content">
              <span className="spinner spinner--small" />
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;