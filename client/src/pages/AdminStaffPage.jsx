import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import './AdminStaffPage.css';

const TABS = [
  ['overview', 'Overview'],
  ['staff', 'Staff'],
  ['students', 'Students'],
  ['inventory', 'Rooms & blocks'],
  ['payments', 'Payments'],
  ['maintenance', 'Maintenance'],
  ['settings', 'Settings'],
];

const initialStaffForm = { role: 'WARDEN', staffId: '', name: '', email: '', phone: '', password: '' };
const initialBlockForm = { blockName: '', category: 'UG' };
const initialRoomForm = { blockId: '', roomNumber: '', capacity: 2 };

export default function AdminStaffPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [overview, setOverview] = useState(null);
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [inventory, setInventory] = useState({ blocks: [], rooms: [] });
  const [payments, setPayments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [settings, setSettings] = useState({ academicYear: '2026-2027', hostelName: 'HostelGo', maintenanceEnabled: true });
  const [staffForm, setStaffForm] = useState(initialStaffForm);
  const [blockForm, setBlockForm] = useState(initialBlockForm);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCategory, setStudentCategory] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [overviewRes, staffRes, studentsRes, inventoryRes, paymentsRes, maintenanceRes, settingsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/staff'),
        api.get('/admin/students'),
        api.get('/admin/inventory'),
        api.get('/admin/payments'),
        api.get('/admin/maintenance'),
        api.get('/admin/settings'),
      ]);
      setOverview(overviewRes.data.overview);
      setStaff(staffRes.data.staff || []);
      setStudents(studentsRes.data.students || []);
      setInventory({ blocks: inventoryRes.data.blocks || [], rooms: inventoryRes.data.rooms || [] });
      setPayments(paymentsRes.data.ledgers || []);
      setMaintenance(maintenanceRes.data.tickets || []);
      setSettings(settingsRes.data.settings);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function createStaff(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/staff', staffForm);
      setSuccess(`${staffForm.role === 'WARDEN' ? 'Warden' : 'Gate staff'} account created.`);
      setStaffForm(initialStaffForm);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Failed to create staff account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function createBlock(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/blocks', blockForm);
      setSuccess('Block created.');
      setBlockForm(initialBlockForm);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create block.');
    } finally {
      setSubmitting(false);
    }
  }

  async function createRoom(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/rooms', roomForm);
      setSuccess('Room and beds created.');
      setRoomForm(initialRoomForm);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.patch('/admin/settings', settings);
      setSettings(res.data.settings);
      setSuccess('System settings saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resetStudentPassword(student) {
    const password = window.prompt(`Enter a temporary password for ${student.name} (minimum 8 characters):`);
    if (!password) return;
    setError('');
    setSuccess('');
    try {
      await api.patch(`/admin/students/${student._id}/password`, { password });
      setSuccess(`Password reset for ${student.name}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    }
  }

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    return students.filter((student) => {
      const categoryMatches = studentCategory === 'ALL' || student.category === studentCategory;
      const searchMatches = !term || `${student.name} ${student.usn} ${student.email} ${student.branch}`.toLowerCase().includes(term);
      return categoryMatches && searchMatches;
    });
  }, [studentCategory, studentSearch, students]);

  return (
    <Layout>
      <div className="cp-admin">
        <header className="cp-admin-header">
          <div>
            <span className="cp-admin-kicker">Administration</span>
            <h1>Hostel control center</h1>
            <p>Manage accounts, rooms, operations, and system settings.</p>
          </div>
        </header>

        {error && <div className="cp-admin-error" role="alert">{error}</div>}
        {success && <div className="cp-admin-success" role="status">{success}</div>}

        <nav className="cp-admin-tabs" aria-label="Admin sections">
          {TABS.map(([key, label]) => (
            <button key={key} type="button" className={activeTab === key ? 'is-active' : ''} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="cp-admin-loading">Loading admin workspace…</div>
        ) : (
          <>
            {activeTab === 'overview' && overview && (
              <section className="cp-admin-section">
                <div className="cp-admin-summary">
                  <article><span>Students</span><strong>{overview.studentCount}</strong><small>registered accounts</small></article>
                  <article><span>Rooms</span><strong>{overview.roomCount}</strong><small>{overview.blockCount} blocks</small></article>
                  <article><span>Available beds</span><strong>{overview.availableBeds}</strong><small>of {overview.totalBeds} total</small></article>
                  <article><span>Fully paid</span><strong>{overview.fullyPaidStudents}</strong><small>{overview.pendingPayments} ledger entries pending</small></article>
                </div>
                <div className="cp-admin-overview-grid">
                  <div className="cp-admin-panel"><h2>Accounts</h2><dl className="cp-admin-stats"><div><dt>Wardens</dt><dd>{overview.wardenCount}</dd></div><div><dt>Gate staff</dt><dd>{overview.gateStaffCount}</dd></div><div><dt>Administrators</dt><dd>{overview.adminCount}</dd></div></dl></div>
                  <div className="cp-admin-panel"><h2>Occupancy</h2><dl className="cp-admin-stats"><div><dt>Occupied beds</dt><dd>{overview.occupiedBeds}</dd></div><div><dt>Available beds</dt><dd>{overview.availableBeds}</dd></div><div><dt>Total beds</dt><dd>{overview.totalBeds}</dd></div></dl></div>
                </div>
              </section>
            )}

            {activeTab === 'staff' && (
              <section className="cp-admin-layout">
                <form className="cp-admin-panel cp-admin-form" onSubmit={createStaff}>
                  <h2>Create staff account</h2>
                  <label>Role<select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}><option value="WARDEN">Warden</option><option value="GATE_STAFF">Gate staff</option></select></label>
                  <label>Staff ID<input value={staffForm.staffId} onChange={(e) => setStaffForm({ ...staffForm, staffId: e.target.value })} required placeholder="e.g. W002" /></label>
                  <label>Full name<input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required /></label>
                  <label>Email<input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required /></label>
                  <label>Phone<input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} required minLength={10} maxLength={10} /></label>
                  <label>Temporary password<input type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required minLength={8} /></label>
                  <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create account'}</button>
                </form>
                <div className="cp-admin-panel cp-admin-table-panel">
                  <div className="cp-admin-panel-heading"><h2>Staff accounts</h2><span>{staff.length}</span></div>
                  {staff.length === 0 ? <p className="cp-admin-empty">No warden or gate staff accounts exist.</p> : (
                    <div className="cp-admin-table-wrap"><table className="cp-admin-table"><thead><tr><th>Staff ID</th><th>Name</th><th>Role</th><th>Email</th><th>Phone</th></tr></thead><tbody>{staff.map((item) => <tr key={item._id}><td>{item.staffId}</td><td>{item.name}</td><td><span className="cp-admin-badge">{item.role}</span></td><td>{item.email}</td><td>{item.phone}</td></tr>)}</tbody></table></div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'students' && (
              <section className="cp-admin-section">
                <div className="cp-admin-toolbar">
                  <div className="cp-admin-filter">
                    {['ALL', 'UG', 'PG'].map((category) => <button key={category} type="button" className={studentCategory === category ? 'is-active' : ''} onClick={() => setStudentCategory(category)}>{category === 'ALL' ? 'All students' : category}</button>)}
                  </div>
                  <input className="cp-admin-search" type="search" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search name, USN, email..." />
                </div>
                <div className="cp-admin-panel cp-admin-table-panel">
                  <div className="cp-admin-panel-heading"><h2>Student accounts</h2><span>{filteredStudents.length}</span></div>
                  {filteredStudents.length === 0 ? <p className="cp-admin-empty">No students match the current filters.</p> : (
                    <div className="cp-admin-table-wrap"><table className="cp-admin-table"><thead><tr><th>USN</th><th>Student</th><th>Category</th><th>Branch</th><th>Payment</th><th>Allocation</th><th>Action</th></tr></thead><tbody>{filteredStudents.map((student) => <tr key={student._id}><td>{student.usn}</td><td><strong>{student.name}</strong><small>{student.email}</small></td><td>{student.category}</td><td>{student.branch}</td><td><span className={`cp-admin-badge ${student.payment?.isFullyPaid ? 'is-green' : 'is-amber'}`}>{student.payment?.isFullyPaid ? 'Fully paid' : 'Pending'}</span></td><td>{student.allocation ? `${student.allocation.blockName} · Room ${student.allocation.roomNumber}` : 'Unallocated'}</td><td><button className="cp-admin-action" type="button" onClick={() => resetStudentPassword(student)}>Reset password</button></td></tr>)}</tbody></table></div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'inventory' && (
              <section className="cp-admin-layout cp-admin-layout--inventory">
                <form className="cp-admin-panel cp-admin-form" onSubmit={createBlock}>
                  <h2>Create block</h2>
                  <label>Block name<input value={blockForm.blockName} onChange={(e) => setBlockForm({ ...blockForm, blockName: e.target.value })} required placeholder="Example: BLOCK C" /></label>
                  <label>Category<select value={blockForm.category} onChange={(e) => setBlockForm({ ...blockForm, category: e.target.value })}><option value="UG">UG</option><option value="PG">PG</option></select></label>
                  <button type="submit" disabled={submitting}>Create block</button>
                </form>

                <form className="cp-admin-panel cp-admin-form" onSubmit={createRoom}>
                  <h2>Create room</h2>
                  <label>Block<select value={roomForm.blockId} onChange={(e) => setRoomForm({ ...roomForm, blockId: e.target.value })} required><option value="">Select block</option>{inventory.blocks.map((block) => <option key={block._id} value={block._id}>{block.blockName} · {block.category}</option>)}</select></label>
                  <label>Room number<input value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} required placeholder="Example: C101" /></label>
                  <label>Bed capacity<input type="number" min="1" max="8" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} required /></label>
                  <button type="submit" disabled={submitting}>Create room</button>
                </form>

                <div className="cp-admin-panel cp-admin-table-panel cp-admin-inventory-list">
                  <div className="cp-admin-panel-heading"><h2>Room inventory</h2><span>{inventory.rooms.length}</span></div>
                  {inventory.rooms.length === 0 ? <p className="cp-admin-empty">No rooms exist yet.</p> : (
                    <div className="cp-admin-inventory-grid">
                      {inventory.rooms.map((room) => (
                        <article className="cp-admin-room" key={room._id}>
                          <div className="cp-admin-room-head"><div><strong>{room.blockId?.blockName || 'Block'}</strong><span>Room {room.roomNumber}</span></div><span>{room.blockId?.category}</span></div>
                          <div className="cp-admin-beds">{room.beds.map((bed) => <div key={bed._id} className={`cp-admin-bed is-${bed.status.toLowerCase()}`}><strong>{bed.bedNumber}</strong><small>{bed.status.replace('_', ' ')}</small></div>)}</div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'payments' && (
              <section className="cp-admin-section">
                <div className="cp-admin-panel cp-admin-table-panel">
                  <div className="cp-admin-panel-heading"><h2>Payment ledger</h2><span>{payments.length}</span></div>
                  {payments.length === 0 ? <p className="cp-admin-empty">No payment records exist.</p> : (
                    <div className="cp-admin-table-wrap"><table className="cp-admin-table"><thead><tr><th>Student</th><th>Academic year</th><th>VTU rent</th><th>Mess DD</th><th>Amounts</th><th>Overall</th></tr></thead><tbody>{payments.map((ledger) => <tr key={ledger._id}><td>{ledger.studentId?.name || ledger.usn}<small>{ledger.usn}</small></td><td>{ledger.academicYear}</td><td><span className="cp-admin-badge">{ledger.vtuRentStatus}</span></td><td><span className="cp-admin-badge">{ledger.messDdStatus}</span></td><td>₹{ledger.vtuRentAmount} / ₹{ledger.messFeeAmount}</td><td><span className={`cp-admin-badge ${ledger.isFullyPaid ? 'is-green' : 'is-amber'}`}>{ledger.isFullyPaid ? 'Fully paid' : 'Incomplete'}</span></td></tr>)}</tbody></table></div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'maintenance' && (
              <section className="cp-admin-section">
                <div className="cp-admin-panel cp-admin-table-panel">
                  <div className="cp-admin-panel-heading"><h2>Maintenance operations</h2><span>{maintenance.length}</span></div>
                  {maintenance.length === 0 ? <p className="cp-admin-empty">No maintenance tickets exist.</p> : (
                    <div className="cp-admin-table-wrap"><table className="cp-admin-table"><thead><tr><th>Student</th><th>Issue</th><th>Status</th><th>Resolution note</th><th>Created</th></tr></thead><tbody>{maintenance.map((ticket) => <tr key={ticket._id}><td>{ticket.studentId?.name || 'Student'}<small>{ticket.usn}</small></td><td>{ticket.description}</td><td><span className="cp-admin-badge">{ticket.status}</span></td><td>{ticket.resolutionNote || 'No note'}</td><td>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table></div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="cp-admin-section">
                <form className="cp-admin-panel cp-admin-form cp-admin-settings" onSubmit={saveSettings}>
                  <h2>System settings</h2>
                  <label>Academic year<input value={settings.academicYear} onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })} required placeholder="2026-2027" /></label>
                  <label>Hostel name<input value={settings.hostelName} onChange={(e) => setSettings({ ...settings, hostelName: e.target.value })} required /></label>
                  <label className="cp-admin-toggle"><input type="checkbox" checked={settings.maintenanceEnabled} onChange={(e) => setSettings({ ...settings, maintenanceEnabled: e.target.checked })} /><span>Maintenance request module enabled</span></label>
                  <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save settings'}</button>
                </form>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
