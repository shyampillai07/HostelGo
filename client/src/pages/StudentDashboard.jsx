import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Layout from '../components/Layout';
import DigitalPass from '../components/DigitalPass';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    api
      .get('/status/me')
      .then((res) => {
        if (isMounted) setStatus(res.data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load your hostel status right now.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const payment = status?.payment;
  const hasPayment = Boolean(payment);
  const isPaymentVerified = Boolean(payment?.isFullyPaid);
  const hasRoom = Boolean(status?.room);
  const passReady = hasRoom && isPaymentVerified;

  const stageData = useMemo(() => {
    const registered = true;
    const paymentSubmitted = hasPayment;
    const paymentVerified = isPaymentVerified;
    const roomAllocated = hasRoom;
    const passActive = passReady;

    const stages = [
      { id: 'registered', label: 'Registered', complete: registered, description: 'Your application has been created.' },
      { id: 'payment', label: 'Payment submitted', complete: paymentSubmitted, description: paymentSubmitted ? 'Payment record is in the review queue.' : 'Submit payment details and receipt to continue.' },
      { id: 'verified', label: 'Payment verified', complete: paymentVerified, description: paymentVerified ? 'Verification is complete.' : 'Awaiting warden approval.' },
      { id: 'room', label: 'Room allocated', complete: roomAllocated, description: roomAllocated ? 'Your hostel assignment is confirmed.' : 'Final allocation happens after verification.' },
      { id: 'pass', label: 'Pass active', complete: passActive, description: passReady ? 'Your digital pass is ready for gate access.' : 'Complete the remaining steps to activate your pass.' },
    ];

    const completedCount = stages.filter((step) => step.complete).length;
    const nextAction = !paymentSubmitted
      ? { label: 'Complete Registration', to: '/payments', note: 'Add your payment details and receipt to begin verification.' }
      : !isPaymentVerified
        ? { label: 'View Payment Status', to: '/payments', note: 'The warden is reviewing your payment evidence.' }
        : !hasRoom
          ? { label: 'View Room Details', to: '/dashboard', note: 'Your room will be assigned once the allocation process is complete.' }
          : { label: 'View Hostel Pass', to: '/pass', note: 'Your pass is active and ready for entry checks.' };

    return { stages, completedCount, nextAction };
  }, [hasPayment, isPaymentVerified, hasRoom, passReady]);

  const paymentLabel = !payment ? 'Not submitted' : payment.isFullyPaid ? 'Verified' : 'Pending review';
  const roomLabel = status?.room ? `${status.room.block}, Room ${status.room.room} (Bed ${status.room.bed})` : 'Not allocated';

  if (loading) {
    return (
      <Layout>
        <div className="cp-student-shell">
          <div className="cp-loading-card">Loading hostel status…</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cp-student-shell">
        <div className="cp-hero-card">
          <div className="cp-hero-copy">
            <span className="cp-kicker">Student journey</span>
            <h1>Welcome back, {user?.name || 'Student'}</h1>
            <p>
             Track your hostel application, payment review, room allocation, and digital pass from one clear dashboard.
            </p>
          </div>
          <div className="cp-hero-summary">
            <span className="cp-status-badge cp-status-badge--neutral">{stageData.completedCount}/5 complete</span>
            <strong>{PaymentStatusLabel(payment)}</strong>
            <small>{status?.room ? 'Room confirmed' : 'Awaiting allocation'}</small>
          </div>
        </div>

        <div className="cp-dashboard-grid">
          <div className="cp-panel cp-panel--wide">
            <div className="cp-panel-header">
              <div>
                <span className="cp-kicker">Application progress</span>
                <h2>Hostel journey</h2>
              </div>
              <span className="cp-pill cp-pill--soft">{stageData.completedCount}/5 steps</span>
            </div>

            <div className="cp-stepper" role="list" aria-label="Hostel application progress">
              {stageData.stages.map((step, index) => (
                <div
                  key={step.id}
                  className={`cp-step ${step.complete ? 'is-complete' : ''} ${index === stageData.stages.findIndex((item) => !item.complete) ? 'is-current' : ''}`}
                  role="listitem"
                >
                  <div className="cp-step-indicator">
                    <span>{step.complete ? '✓' : index + 1}</span>
                  </div>
                  <div className="cp-step-copy">
                    <h3>{step.label}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cp-panel cp-panel--action">
            <span className="cp-kicker">Next action</span>
            <h2>{stageData.nextAction.label}</h2>
            <p>{stageData.nextAction.note}</p>
            <Link to={stageData.nextAction.to} className="cp-primary-button">
              {stageData.nextAction.label}
            </Link>
          </div>
        </div>

        {error ? <div className="cp-error-banner">{error}</div> : null}

        <div className="cp-stats-grid">
          <div className={`cp-stat-card ${isPaymentVerified ? 'is-success' : 'is-warning'}`}>
            <span>Payment</span>
            <strong>{paymentLabel}</strong>
            <small>{payment?.isFullyPaid ? 'Hostel dues cleared.' : 'Verification is in progress.'}</small>
          </div>
          <div className={`cp-stat-card ${hasRoom ? 'is-success' : 'is-warning'}`}>
            <span>Room</span>
            <strong>{roomLabel}</strong>
            <small>{hasRoom ? 'Allocation has been confirmed.' : 'Your room will be assigned after verification.'}</small>
          </div>
          <div className="cp-stat-card is-neutral">
            <span>Maintenance</span>
            <strong>{status?.openMaintenanceTickets ?? 0} open</strong>
            <small>Service requests needing attention</small>
          </div>
        </div>

        <div className="cp-detail-grid">
          <DigitalPass user={user} />

          <div className="cp-panel">
            <div className="cp-panel-header">
              <div>
                <span className="cp-kicker">Application summary</span>
                <h2>Current status</h2>
              </div>
            </div>

            <div className="cp-info-list">
              <div>
                <label>Payment status</label>
                <strong>{paymentLabel}</strong>
              </div>
              <div>
                <label>VTU rent</label>
                <strong>{payment?.vtuRentStatus || 'Not submitted'}</strong>
              </div>
              <div>
                <label>Mess DD</label>
                <strong>{payment?.messDdStatus || 'Not submitted'}</strong>
              </div>
              <div>
                <label>Hostel pass</label>
                <strong>{passReady ? 'Active' : 'Not active yet'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function PaymentStatusLabel(payment) {
  if (!payment) return 'No payment submitted';
  if (payment.isFullyPaid) return 'Payment verified';
  return 'Payment under review';
}