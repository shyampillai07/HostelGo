import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import './WardenOverview.css';

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function WardenOverview() {
  const [rooms, setRooms] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/rooms'), api.get('/ledger')])
      .then(([roomsRes, ledgerRes]) => {
        setRooms(roomsRes.data.rooms || []);
        setLedgers(ledgerRes.data.ledgers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="cp-overview-shell"><div className="cp-loading-card">Loading wardens dashboard…</div></div></Layout>;

  const totalBeds = rooms.reduce((sum, r) => sum + r.beds.length, 0);
  const occupied = rooms.reduce((sum, r) => sum + r.occupiedBedsCount, 0);
  const available = totalBeds - occupied;
  const pendingCount = ledgers.filter((ledger) => ledger.vtuRentStatus === 'PENDING' || ledger.messDdStatus === 'PENDING' || ledger.messDdStatus === 'PHYSICAL_DD_RECEIVED').length;
  const verifiedCount = ledgers.filter((ledger) => ledger.vtuRentStatus === 'VERIFIED' && ledger.messDdStatus === 'VERIFIED').length;
  const rejectedCount = ledgers.filter((ledger) => ledger.vtuRentStatus === 'REJECTED' || ledger.messDdStatus === 'REJECTED').length;
  const pendingPreview = ledgers.filter((ledger) => ledger.vtuRentStatus === 'PENDING' || ledger.messDdStatus === 'PENDING' || ledger.messDdStatus === 'PHYSICAL_DD_RECEIVED').slice(0, 4);

  const byBlock = {};
  rooms.forEach((r) => {
    const key = r.blockId.blockName;
    if (!byBlock[key]) byBlock[key] = { category: r.blockId.category, total: 0, occupied: 0 };
    byBlock[key].total += r.beds.length;
    byBlock[key].occupied += r.occupiedBedsCount;
  });

  return (
    <Layout>
      <div className="cp-overview-shell">
        <header className="cp-overview-header">
          <div>
            <span className="cp-kicker">Operations</span>
            <h1>Warden dashboard</h1>
          </div>
          <Link to="/warden/verify" className="cp-primary-button cp-primary-button--compact">Review payments</Link>
        </header>

        <div className="cp-overview-stats">
          <div className="cp-ostat cp-ostat--navy"><strong>{totalBeds}</strong><span>Total Beds</span></div>
          <div className="cp-ostat cp-ostat--amber"><strong>{pendingCount}</strong><span>Pending</span></div>
          <div className="cp-ostat cp-ostat--green"><strong>{occupied}</strong><span>Occupied</span></div>
          <div className="cp-ostat cp-ostat--red"><strong>{rejectedCount}</strong><span>Rejected</span></div>
        </div>

        <div className="cp-overview-actions">
          <Link to="/warden/verify" className="cp-overview-action">
            <span>Review pending payments</span>
            <span className="cp-overview-action-arrow">→</span>
          </Link>
          <Link to="/warden/allocation" className="cp-overview-action">
            <span>Allocate rooms</span>
            <span className="cp-overview-action-arrow">→</span>
          </Link>
        </div>

        <div className="cp-overview-grid">
          <div className="cp-overview-panel">
            <div className="cp-panel-header">
              <div>
                <span className="cp-kicker">Capacity</span>
                <h2>Block allocation</h2>
              </div>
            </div>

            <div className="cp-overview-table-wrap">
              <table className="cp-overview-table">
                <thead><tr><th>Block</th><th>Category</th><th>Occupied</th><th>Available</th></tr></thead>
                <tbody>
                  {Object.entries(byBlock).map(([name, d]) => (
                    <tr key={name}>
                      <td>{name}</td><td>{d.category}</td><td>{d.occupied}</td><td>{d.total - d.occupied}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="cp-overview-note">{available} bed{available !== 1 ? 's' : ''} remain available across all blocks. {verifiedCount} payment{verifiedCount === 1 ? '' : 's'} verified.</p>
          </div>

          <div className="cp-overview-panel">
            <div className="cp-panel-header">
              <div>
                <span className="cp-kicker">Priority queue</span>
                <h2>Pending reviews</h2>
              </div>
            </div>

            <div className="cp-review-list">
              {pendingPreview.length === 0 ? (
                <div className="cp-empty-mini">No payments awaiting review.</div>
              ) : (
                pendingPreview.map((ledger) => {
                  const student = typeof ledger.studentId === 'object' ? ledger.studentId : null;
                  return (
                    <div key={ledger._id} className="cp-review-item">
                      <div className="cp-review-main">
                        <strong>{student?.name || ledger.usn || 'Student'}</strong>
                        <span>{student?.usn || ledger.usn}</span>
                      </div>
                      <div className="cp-review-meta">
                        <span>{ledger.academicYear}</span>
                        <strong>{formatCurrency(ledger.vtuRentAmount)}</strong>
                      </div>
                      <Link to="/warden/verify" className="cp-review-link">Review</Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}