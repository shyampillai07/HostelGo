import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import './MaintenancePage.css';

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/tickets/me');
      setTickets(res.data.tickets || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load maintenance requests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!description.trim()) {
      setError('Please describe the issue before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/maintenance/tickets', { description: description.trim() });
      setDescription('');
      setSuccess('Your maintenance request has been submitted.');
      await load();
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const badgeClass = (status) => String(status || '').toLowerCase().replace(/_/g, '-');

  return (
    <Layout>
      <div className="cp-maint">
        <header className="cp-page-header cp-page-header--compact">
          <div>
            <span className="cp-kicker">Support</span>
            <h1>Maintenance requests</h1>
          </div>
        </header>

        <form className="cp-maint-form" onSubmit={handleSubmit}>
          {error && <div className="cp-maint-error">{error}</div>}
          {success && <div className="cp-maint-success">{success}</div>}

          <label htmlFor="maintenance-description">Describe the issue</label>
          <textarea
            id="maintenance-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Example: The geyser in Room 204 is leaking and not heating properly."
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
        </form>

        <div className="cp-maint-list">
          {loading ? (
            <div className="cp-maint-state">Loading your requests…</div>
          ) : tickets.length === 0 ? (
            <div className="cp-maint-state cp-maint-state--empty">No maintenance requests yet. Report an issue and the hostel team will review it.</div>
          ) : (
            tickets.map((ticket) => (
              <article key={ticket._id} className="cp-maint-ticket">
                <div className="cp-maint-row">
                  <span className={`cp-maint-badge cp-maint-badge--${badgeClass(ticket.status)}`}>{ticket.status}</span>
                  <span className="cp-maint-date">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="cp-maint-description">{ticket.description}</p>
                {ticket.resolutionNote ? <p className="cp-maint-note">Warden note: {ticket.resolutionNote}</p> : null}
              </article>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}