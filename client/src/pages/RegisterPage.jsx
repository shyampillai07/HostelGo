import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import './Auth.css';

const initialForm = { usn: '', name: '', email: '', password: '', phone: '', branch: '', category: 'PG', gender: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? errors.join(', ') : err.response?.data?.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <main className="cp-register-wrap">
        <section className="cp-register-card" aria-labelledby="register-heading">
          <aside className="cp-register-intro">
            <span className="cp-register-kicker">Student registration</span>
            <h1 id="register-heading">Create your HostelGo account</h1>
            <p>Submit your academic details once to start payments, room allocation, and digital pass access.</p>
            <div className="cp-register-steps" aria-label="Registration benefits">
              <span><strong>1</strong> Student profile</span>
              <span><strong>2</strong> Payment verification</span>
              <span><strong>3</strong> Room and pass</span>
            </div>
          </aside>

          <form className="cp-register-form" onSubmit={handleSubmit}>
            <div className="cp-register-form-heading">
              <div>
                <span>Student details</span>
                <h2>Account information</h2>
              </div>
              <span className="cp-register-required">* Required</span>
            </div>

            {error && <div className="cp-auth-error" role="alert">{error}</div>}

            <div className="cp-register-grid">
              <label>USN *
                <input className="cp-auth-input" value={form.usn} onChange={update('usn')} required placeholder="Example: 1MP24CS001" />
              </label>
              <label>Full name *
                <input className="cp-auth-input" value={form.name} onChange={update('name')} required placeholder="Enter your full name" />
              </label>
              <label>Email *
                <input className="cp-auth-input" type="email" value={form.email} onChange={update('email')} required placeholder="student@example.com" />
              </label>
              <label>Password *
                <input className="cp-auth-input" type="password" value={form.password} onChange={update('password')} required minLength={8} placeholder="Minimum 8 characters" />
              </label>
              <label>Phone *
                <input className="cp-auth-input" value={form.phone} onChange={update('phone')} required minLength={10} maxLength={10} inputMode="numeric" placeholder="10-digit mobile number" />
              </label>
              <label>Branch *
                <select className="cp-auth-input" value={form.branch} onChange={update('branch')} required>
                  <option value="">Select branch</option>
                  <option value="CSE">Computer Science and Engineering</option>
                  <option value="ECE">Electronics and Communication Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="Mtech(CSE)">M.Tech Computer Science and Engineering</option>
                  <option value="Mtech(civil)">M.Tech Civil Engineering</option>
                  <option value="Mtech(ME)">M.Tech Mechanical Engineering</option>
                  <option value="MCA">Master of Computer Applications</option>
                  <option value="MBA">Master of Business Administration</option>
                </select>
              </label>
              <label>Category *
                <select className="cp-auth-input" value={form.category} onChange={update('category')} required>
                  <option value="PG">PG</option>
                  <option value="UG">UG</option>
                </select>
              </label>
              <label>Gender *
                <select className="cp-auth-input" value={form.gender} onChange={update('gender')} required>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div className="cp-register-actions">
              <button className="cp-auth-submit" type="submit" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Create student account'}
              </button>
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          </form>
        </section>
      </main>
    </Layout>
  );
}