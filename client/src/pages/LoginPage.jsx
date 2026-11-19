import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import './Auth.css';

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'WARDEN', label: 'Warden' },
  { value: 'GATE_STAFF', label: 'Gate staff' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function selectRole(role) {
    setSelectedRole(role);
    setIdentifier('');
    setPassword('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(identifier, password, selectedRole);
      if (user.role === 'WARDEN') navigate('/warden/dashboard');
      else if (user.role === 'GATE_STAFF') navigate('/scanner');
      else if (user.role === 'ADMIN') navigate('/admin/staff');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const isStudent = selectedRole === 'STUDENT';
  const selectedLabel = ROLE_OPTIONS.find((role) => role.value === selectedRole)?.label || 'Account';

  return (
    <Layout>
      <main className="cp-auth-wrap">
        <section className="cp-auth-card" aria-labelledby="login-heading">
          <div className="cp-auth-heading">
            <span className="cp-auth-kicker">HostelGo access</span>
            <h1 id="login-heading" className="cp-auth-title">Sign in</h1>
            <p>Choose your account type to continue.</p>
          </div>

          <div className="cp-role-tabs" role="tablist" aria-label="Account type">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.value}
                type="button"
                role="tab"
                aria-selected={selectedRole === role.value}
                className={`cp-role-tab ${selectedRole === role.value ? 'is-active' : ''}`}
                onClick={() => selectRole(role.value)}
              >
                {role.label}
              </button>
            ))}
          </div>

          <form className="cp-auth-form" onSubmit={handleSubmit}>
            {error && <div className="cp-auth-error" role="alert">{error}</div>}

            <label className="cp-auth-label" htmlFor="login-identifier">
              {isStudent ? 'USN or Email' : 'Staff ID or Email'}
            </label>
            <input
              id="login-identifier"
              className="cp-auth-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isStudent ? 'Enter your USN or email' : 'Enter your staff ID or email'}
              autoComplete="username"
              required
            />

            <label className="cp-auth-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="cp-auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button className="cp-auth-submit" type="submit" disabled={submitting}>
              {submitting ? `Signing in as ${selectedLabel}...` : `Sign in as ${selectedLabel}`}
            </button>

            {isStudent ? (
              <p className="cp-auth-switch">New student? <Link to="/register">Register here</Link></p>
            ) : (
              <p className="cp-auth-switch">{selectedLabel} accounts are created by the administrator.</p>
            )}
          </form>
        </section>
      </main>
    </Layout>
  );
}