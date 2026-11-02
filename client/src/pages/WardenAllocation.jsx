import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import './WardenAllocation.css';

const CATEGORY_OPTIONS = ['ALL', 'UG', 'PG'];

export default function WardenAllocation() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyBedId, setBusyBedId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadAll() {
    setLoading(true);
    try {
      const [studentsRes, roomsRes] = await Promise.all([api.get('/rooms/unallocated'), api.get('/rooms')]);
      setStudents(studentsRes.data.students || []);
      setRooms(roomsRes.data.rooms || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load allocation data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleAllocate(roomId, bedId) {
    if (!selectedStudent) return;
    setBusyBedId(bedId);
    setMessage('');
    setError('');
    try {
      await api.post('/rooms/allocate', { studentId: selectedStudent._id, roomId, bedId });
      setMessage(`Allocated ${selectedStudent.name} successfully.`);
      setSelectedStudent(null);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Allocation failed.');
    } finally {
      setBusyBedId(null);
    }
  }

  const allocationStats = useMemo(() => {
    const totalBeds = rooms.reduce((acc, room) => acc + (room.beds?.length || 0), 0);
    const availableBeds = rooms.reduce((acc, room) => acc + (room.beds?.filter((bed) => bed.status === 'AVAILABLE').length || 0), 0);
    const occupiedBeds = rooms.reduce((acc, room) => acc + (room.beds?.filter((bed) => bed.status === 'OCCUPIED').length || 0), 0);
    const outOfServiceBeds = rooms.reduce((acc, room) => acc + (room.beds?.filter((bed) => bed.status === 'OUT_OF_SERVICE').length || 0), 0);

    return {
      totalRooms: rooms.length,
      totalBeds,
      availableBeds,
      occupiedBeds,
      outOfServiceBeds,
      queueCount: students.length,
    };
  }, [rooms, students]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesCategory = categoryFilter === 'ALL' || student.category === categoryFilter;
      const matchesSearch = !term || `${student.name} ${student.usn} ${student.branch} ${student.category}`.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, search, students]);

  const filteredRooms = useMemo(() => {
    const roomsForCategory = selectedStudent ? rooms.filter((room) => room.blockId?.category === selectedStudent.category) : rooms;
    return roomsForCategory.filter((room) => {
      if (categoryFilter === 'ALL') return true;
      return room.blockId?.category === categoryFilter;
    });
  }, [categoryFilter, rooms, selectedStudent]);

  if (loading) return <Layout><p style={{ padding: 40 }}>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="cp-alloc">
        <header className="cp-page-header cp-page-header--compact">
          <div>
            <span className="cp-kicker">Operations</span>
            <h1>Room allocation</h1>
          </div>
        </header>

        <div className="cp-alloc-summary">
          <article className="cp-alloc-stat cp-alloc-stat--navy">
            <span>Total rooms</span>
            <strong>{allocationStats.totalRooms}</strong>
            <small>Live blocks</small>
          </article>
          <article className="cp-alloc-stat cp-alloc-stat--gold">
            <span>Available beds</span>
            <strong>{allocationStats.availableBeds}</strong>
            <small>Ready for assignment</small>
          </article>
          <article className="cp-alloc-stat cp-alloc-stat--green">
            <span>Occupied</span>
            <strong>{allocationStats.occupiedBeds}</strong>
            <small>Confirmed stays</small>
          </article>
          <article className="cp-alloc-stat cp-alloc-stat--red">
            <span>Waiting list</span>
            <strong>{allocationStats.queueCount}</strong>
            <small>Pending allocation</small>
          </article>
        </div>

        {message && <div className="cp-alloc-message">{message}</div>}
        {error && <div className="cp-alloc-error">{error}</div>}

        <div className="cp-alloc-toolbar">
          <div className="cp-alloc-filter-group">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`cp-filter-btn ${categoryFilter === option ? 'is-active' : ''}`}
                onClick={() => setCategoryFilter(option)}
              >
                {option === 'ALL' ? 'All categories' : option}
              </button>
            ))}
          </div>

          <div className="cp-search-box">
            <span>Search</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, USN, branch..."
            />
          </div>
        </div>

        <div className="cp-alloc-grid">
          <div className="cp-alloc-panel">
            <div className="cp-alloc-panel-header">
              <h2>Students waiting for allocation</h2>
              <span>{filteredStudents.length}</span>
            </div>

            {filteredStudents.length === 0 ? (
              <p className="cp-alloc-empty">No fully-paid students match the current filters.</p>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student._id}
                  type="button"
                  className={`cp-alloc-student ${selectedStudent?._id === student._id ? 'cp-alloc-student--selected' : ''}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="cp-alloc-student-topline">
                    <strong>{student.name}</strong>
                    <span className="cp-alloc-category-pill">{student.category}</span>
                  </div>
                  <span>{student.usn} · {student.branch}</span>
                </button>
              ))
            )}
          </div>

          <div className="cp-alloc-panel cp-alloc-panel--rooms">
            <div className="cp-alloc-panel-header">
              <h2>{selectedStudent ? `Assigned rooms for ${selectedStudent.category}` : 'Available rooms'}</h2>
              <span>{filteredRooms.length}</span>
            </div>

            {!selectedStudent && <p className="cp-alloc-hint">Select a student from the queue to enable allocation.</p>}

            {filteredRooms.length === 0 && selectedStudent ? (
              <p className="cp-alloc-empty">No rooms are available for this category right now.</p>
            ) : null}

            <div className="cp-room-list">
              {filteredRooms.map((room) => {
                const availableCount = room.beds.filter((bed) => bed.status === 'AVAILABLE').length;
                const occupiedCount = room.beds.filter((bed) => bed.status === 'OCCUPIED').length;

                return (
                  <div key={room._id} className="cp-alloc-room">
                    <div className="cp-alloc-room-head">
                      <div>
                        <strong>{room.blockId?.blockName || 'Block'}</strong>
                        <span>Room {room.roomNumber}</span>
                      </div>
                      <div className="cp-room-meta">
                        <span>{availableCount} available</span>
                        <span>{occupiedCount} occupied</span>
                      </div>
                    </div>

                    <div className="cp-alloc-beds">
                      {room.beds.map((bed) => (
                        <button
                          key={bed._id}
                          type="button"
                          className={`cp-alloc-bed cp-alloc-bed--${bed.status.toLowerCase()}`}
                          disabled={bed.status !== 'AVAILABLE' || !selectedStudent || busyBedId === bed._id}
                          onClick={() => handleAllocate(room._id, bed._id)}
                        >
                          <span>{bed.bedNumber}</span>
                          <small>{bed.status === 'AVAILABLE' ? 'Open' : bed.status === 'OCCUPIED' ? 'Filled' : 'Offline'}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}