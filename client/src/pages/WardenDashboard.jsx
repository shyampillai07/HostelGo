import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import './WardenDashboard.css';

const FILTERS = ['ALL', 'PENDING', 'VERIFIED', 'REJECTED'];

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusClass = (status) => {
  const value = String(status || '').toUpperCase();
  if (value.includes('VERIFIED')) return 'verified';
  if (value.includes('REJECTED')) return 'rejected';
  if (value.includes('PENDING') || value.includes('PHYSICAL_DD_RECEIVED')) return 'pending';
  return 'neutral';
};

export default function WardenDashboard() {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const loadLedgers = useCallback(async (nextFilter = activeFilter) => {
    setLoading(true);
    try {
      const params = nextFilter === 'ALL' ? {} : { status: nextFilter };
      const res = await api.get('/ledger', { params });
      setLedgers(res.data.ledgers || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load payment submissions right now.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadLedgers(activeFilter);
  }, [activeFilter, loadLedgers]);

  useEffect(() => {
    return () => {
      if (receiptUrl) URL.revokeObjectURL(receiptUrl);
    };
  }, [receiptUrl]);

  async function handleVerify(id, stream, statusValue) {
    const streamName = stream === 'vtuRent' ? 'VTU rent' : 'Mess DD';
    const confirmed = window.confirm(`Mark ${streamName} as ${statusValue}? This action cannot be undone.`);
    if (!confirmed) return;

    setBusyId(`${id}:${stream}`);
    try {
      await api.put(`/ledger/${id}/verify`, { stream, status: statusValue });
      await loadLedgers(activeFilter);
    } catch (err) {
      setError(err.response?.data?.error || 'The verification request could not be completed.');
    } finally {
      setBusyId(null);
    }
  }

  async function openReceipt(id) {
    try {
      const response = await api.get(`/ledger/${id}/receipt`, { responseType: 'blob' });
      const type = response.headers['content-type'] || 'application/pdf';
      const nextUrl = URL.createObjectURL(new Blob([response.data], { type }));
      if (receiptUrl) URL.revokeObjectURL(receiptUrl);
      setReceiptUrl(nextUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'The receipt could not be opened.');
    }
  }

  const filteredLedgers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ledgers.filter((ledger) => {
      const student = typeof ledger.studentId === 'object' ? ledger.studentId : null;
      const studentName = student?.name || 'Student';
      const studentUsn = student?.usn || ledger.usn || '';
      const haystack = [
        studentName,
        studentUsn,
        ledger.academicYear,
        ledger.vtuDuReference,
        ledger.ddNumber,
        ledger.vtuRentStatus,
        ledger.messDdStatus,
      ]
        .join(' ')
        .toLowerCase();

      return !query || haystack.includes(query);
    });
  }, [ledgers, search]);

  const summary = useMemo(() => {
    const pending = ledgers.filter((ledger) =>
      ['PENDING', 'PHYSICAL_DD_RECEIVED'].includes(ledger.vtuRentStatus) || ['PENDING', 'PHYSICAL_DD_RECEIVED'].includes(ledger.messDdStatus)
    ).length;
    const verified = ledgers.filter((ledger) => ledger.vtuRentStatus === 'VERIFIED' && ledger.messDdStatus === 'VERIFIED').length;
    const rejected = ledgers.filter((ledger) => ledger.vtuRentStatus === 'REJECTED' || ledger.messDdStatus === 'REJECTED').length;

    return { pending, verified, rejected };
  }, [ledgers]);

  if (loading && ledgers.length === 0) {
    return (
      <Layout>
        <div className="cp-warden-shell">
          <div className="cp-loading-card">Loading payment review queue…</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cp-warden-shell">
        <header className="cp-page-header">
          <div>
            <span className="cp-kicker">Finance review</span>
            <h1>Payment verification</h1>
          </div>
          <div className="cp-page-header-meta">
            <span className="cp-pill cp-pill--soft">{filteredLedgers.length} listed</span>
          </div>
        </header>

        <div className="cp-summary-grid">
          <div className="cp-summary-card cp-summary-card--amber">
            <span>Pending</span>
            <strong>{summary.pending}</strong>
            <small>Requires action</small>
          </div>
          <div className="cp-summary-card cp-summary-card--green">
            <span>Verified</span>
            <strong>{summary.verified}</strong>
            <small>Cleared for allocation</small>
          </div>
          <div className="cp-summary-card cp-summary-card--red">
            <span>Rejected</span>
            <strong>{summary.rejected}</strong>
            <small>Needs follow-up</small>
          </div>
        </div>

        <div className="cp-toolbar">
          <div className="cp-filter-group" role="tablist" aria-label="Payment statuses">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`cp-filter-btn ${activeFilter === filter ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'ALL' ? 'All' : filter}
              </button>
            ))}
          </div>

          <label className="cp-search-box">
            <span>Search</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, USN, reference…"
              aria-label="Search payments"
            />
          </label>
        </div>

        {error ? <div className="cp-error-banner">{error}</div> : null}

        {filteredLedgers.length === 0 ? (
          <div className="cp-empty-state">
            <h2>No payment records match this review.</h2>
            <p>Try another status or search term.</p>
          </div>
        ) : (
          <div className="cp-ledger-list">
            {filteredLedgers.map((ledger) => {
              const student = typeof ledger.studentId === 'object' ? ledger.studentId : null;
              const studentName = student?.name || 'Student';
              const studentUsn = student?.usn || ledger.usn || 'Not provided';

              return (
                <article key={ledger._id} className="cp-ledger-card">
                  <div className="cp-ledger-header">
                    <div>
                      <h2>{studentName}</h2>
                      <div className="cp-ledger-meta">
                        <span>{studentUsn}</span>
                        <span>{ledger.academicYear}</span>
                      </div>
                    </div>
                    <span className={`cp-pill cp-pill--${getStatusClass(ledger.vtuRentStatus)}`}>
                      {ledger.vtuRentStatus}
                    </span>
                  </div>

                  <div className="cp-ledger-grid">
                    <div>
                      <label>Amount</label>
                      <strong>{formatCurrency(ledger.vtuRentAmount)}</strong>
                    </div>
                    <div>
                      <label>Payment method</label>
                      <strong>{ledger.vtuDuReference ? 'VTU transfer' : 'Not provided'}</strong>
                    </div>
                    <div>
                      <label>Reference</label>
                      <strong>{ledger.vtuDuReference || 'Not provided'}</strong>
                    </div>
                    <div>
                      <label>Mess DD</label>
                      <strong>{formatCurrency(ledger.messFeeAmount)}</strong>
                    </div>
                  </div>

                  <div className="cp-document-grid">
                    <div>
                      <span>Receipt</span>
                      <strong>{ledger.vtuReceiptPdfUrl ? 'Available' : 'Not provided'}</strong>
                    </div>
                    <div>
                      <span>DD number</span>
                      <strong>{ledger.ddNumber || 'Not provided'}</strong>
                    </div>
                    <div>
                      <span>Bank</span>
                      <strong>{ledger.ddBankName || 'Not provided'}</strong>
                    </div>
                    <div>
                      <span>Submitted</span>
                      <strong>{new Date(ledger.createdAt).toLocaleDateString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="cp-ledger-row">
                    <div className="cp-ledger-status-row">
                      <div className="cp-status-labeled">
                        <span>VTU rent</span>
                        <small className={`cp-status-text cp-status-text--${getStatusClass(ledger.vtuRentStatus)}`}>{ledger.vtuRentStatus}</small>
                      </div>
                      {ledger.vtuRentStatus === 'PENDING' ? (
                        <div className="cp-ledger-actions">
                          <button type="button" disabled={busyId === `${ledger._id}:vtuRent`} onClick={() => handleVerify(ledger._id, 'vtuRent', 'VERIFIED')}>Approve</button>
                          <button type="button" className="cp-btn-reject" disabled={busyId === `${ledger._id}:vtuRent`} onClick={() => handleVerify(ledger._id, 'vtuRent', 'REJECTED')}>Reject</button>
                        </div>
                      ) : null}
                    </div>

                    <div className="cp-ledger-status-row">
                      <div className="cp-status-labeled">
                        <span>Mess DD</span>
                        <small className={`cp-status-text cp-status-text--${getStatusClass(ledger.messDdStatus)}`}>{ledger.messDdStatus}</small>
                      </div>
                      {ledger.messDdStatus === 'PHYSICAL_DD_RECEIVED' ? (
                        <div className="cp-ledger-actions">
                          <button type="button" disabled={busyId === `${ledger._id}:messDd`} onClick={() => handleVerify(ledger._id, 'messDd', 'VERIFIED')}>Approve</button>
                          <button type="button" className="cp-btn-reject" disabled={busyId === `${ledger._id}:messDd`} onClick={() => handleVerify(ledger._id, 'messDd', 'REJECTED')}>Reject</button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {ledger.vtuReceiptPdfUrl ? (
                    <button type="button" className="cp-ghost-button" onClick={() => openReceipt(ledger._id)}>
                      View receipt
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}

        {receiptUrl ? (
          <div className="cp-modal-backdrop" onClick={() => setReceiptUrl('')}>
            <div className="cp-modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="cp-modal-header">
                <h3>Payment receipt</h3>
                <button type="button" className="cp-close-button" onClick={() => setReceiptUrl('')}>Close</button>
              </div>
              <iframe title="Payment receipt preview" src={receiptUrl} className="cp-receipt-frame" />
              <a href={receiptUrl} target="_blank" rel="noreferrer" className="cp-primary-button cp-primary-button--small">
                Download PDF
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}