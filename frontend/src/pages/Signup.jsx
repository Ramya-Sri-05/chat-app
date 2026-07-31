import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signup(username, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      eyebrow="New workspace"
      title="Chat instantly with your team."
      subtitle="Create your account"
      description="Join your team in a refined, distraction-free messaging experience."
      features={[
        { icon: '✦', label: 'Organized conversations' },
        { icon: '⚡', label: 'Real-time collaboration' },
        { icon: '✓', label: 'Secure by default' },
      ]}
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
      termsText="By creating an account, you agree to our Terms and Privacy Policy."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <AuthInput
          id="username"
          name="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          icon="◌"
          minLength={3}
          maxLength={30}
          autoComplete="username"
        />

        <AuthInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
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
          placeholder="Create a password"
          icon="◎"
          minLength={6}
          autoComplete="new-password"
        />

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? (
            <span className="btn__content">
              <span className="spinner spinner--small" />
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;