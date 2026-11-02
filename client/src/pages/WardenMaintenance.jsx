import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import './MaintenancePage.css';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export default function WardenMaintenance() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/tickets', { params: statusFilter === 'ALL' ? {} : { status: statusFilter } });
      setTickets(res.data.tickets || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load maintenance tickets.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id, status, resolutionNote = '') {
    setSavingId(id);
    try {
      await api.patch(`/maintenance/tickets/${id}`, { status, resolutionNote });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update the maintenance ticket.');
    } finally {
      setSavingId(null);
    }
  }

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (!term) return true;
      const studentName = ticket.studentId?.name || '';
      const studentUsn = ticket.studentId?.usn || ticket.usn || '';
      return `${studentName} ${studentUsn} ${ticket.description}`.toLowerCase().includes(term);
    });
  }, [tickets, search]);

  const badgeClass = (status) => String(status || '').toLowerCase().replace(/_/g, '-');

  return (
    <Layout>
      <div className="cp-maint cp-maint--warden">
        <header className="cp-page-header cp-page-header--compact">
          <div>
            <span className="cp-kicker">Operations</span>
            <h1>Maintenance management</h1>
          </div>
        </header>

        <div className="cp-maint-toolbar">
          <div className="cp-maint-filters">
            {['ALL', ...STATUSES].map((option) => (
              <button
                key={option}
                type="button"
                className={`cp-filter-btn ${statusFilter === option ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(option)}
              >
                {option === 'ALL' ? 'All tickets' : option}
              </button>
            ))}
          </div>

          <div className="cp-search-box">
            <span>Search</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Student, USN, issue..."
            />
          </div>
        </div>

        {error && <div className="cp-maint-error">{error}</div>}

        {loading ? (
          <div className="cp-maint-state">Loading maintenance requests…</div>
        ) : filteredTickets.length === 0 ? (
          <div className="cp-maint-state cp-maint-state--empty">
            No tickets match the current filter.
          </div>
        ) : (
          <div className="cp-maint-list">
            {filteredTickets.map((ticket) => (
              <article key={ticket._id} className="cp-maint-ticket cp-maint-ticket--warden">
                <div className="cp-maint-row cp-maint-row--stacked">
                  <div>
                    <strong>{ticket.studentId?.name || 'Student'}</strong>
                    <div className="cp-maint-submeta">{ticket.studentId?.usn || ticket.usn} · {ticket.studentId?.branch || 'N/A'}</div>
                  </div>
                  <span className={`cp-maint-badge cp-maint-badge--${badgeClass(ticket.status)}`}>{ticket.status}</span>
                </div>

                <div className="cp-maint-row cp-maint-row--meta">
                  <span className="cp-maint-date">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                  <span className="cp-maint-contact">{ticket.studentId?.phone || 'No phone on record'}</span>
                </div>

                <p className="cp-maint-description">{ticket.description}</p>

                <div className="cp-maint-controls">
                  <label className="cp-maint-select-wrap">
                    <span>Status</span>
                    <select
                      value={ticket.status}
                      onChange={(event) => updateStatus(ticket._id, event.target.value, ticket.resolutionNote || '')}
                      disabled={savingId === ticket._id}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>

                  <label className="cp-maint-note-wrap">
                    <span>Resolution note</span>
                    <textarea
                      rows={2}
                      value={ticket.resolutionNote || ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        setTickets((current) => current.map((entry) => (entry._id === ticket._id ? { ...entry, resolutionNote: value } : entry)));
                      }}
                      placeholder="Add a note to the student..."
                    />
                  </label>

                  <button
                    type="button"
                    className="cp-maint-save"
                    onClick={() => updateStatus(ticket._id, ticket.status, ticket.resolutionNote || '')}
                    disabled={savingId === ticket._id}
                  >
                    {savingId === ticket._id ? 'Saving...' : 'Save update'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}