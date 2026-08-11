'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateODPdf } from '@/lib/generatePDF';
import { generateODDocx } from '@/lib/generateDOCX';

interface Student {
  _id: string;
  rollNo: string;
  name: string;
}

interface EventRecord {
  _id: string;
  companyName: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  students: Student[];
  exposed: boolean;
  createdAt: string;
}

export default function RecordsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal state
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [editSelectedIds, setEditSelectedIds] = useState<Set<string>>(
    new Set()
  );
  const [editSearch, setEditSearch] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editStartHour, setEditStartHour] = useState('09');
  const [editStartMinute, setEditStartMinute] = useState('00');
  const [editStartPeriod, setEditStartPeriod] = useState('AM');
  const [editEndHour, setEditEndHour] = useState('05');
  const [editEndMinute, setEditEndMinute] = useState('00');
  const [editEndPeriod, setEditEndPeriod] = useState('PM');
  const [editDate, setEditDate] = useState('');

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Expose toggle state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, studentsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/students'),
      ]);
      const eventsData = await eventsRes.json();
      const studentsData = await studentsRes.json();
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setAllStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openEditModal(event: EventRecord) {
    setEditingEvent(event);
    setEditSelectedIds(new Set(event.students.map((s) => s._id)));
    
    // "09:00 AM" -> ["09:00", "AM"]
    const [sTime, sPeriod] = event.startTime.split(' ');
    const [sH, sM] = sTime.split(':');
    setEditStartHour(sH);
    setEditStartMinute(sM);
    setEditStartPeriod(sPeriod);

    const [eTime, ePeriod] = event.endTime.split(' ');
    const [eH, eM] = eTime.split(':');
    setEditEndHour(eH);
    setEditEndMinute(eM);
    setEditEndPeriod(ePeriod);
    
    // Convert to local YYYY-MM-DD for the date input
    const d = new Date(event.date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setEditDate(`${yyyy}-${mm}-${dd}`);

    setEditSearch('');
  }

  function closeEditModal() {
    setEditingEvent(null);
    setEditSelectedIds(new Set());
    setEditSearch('');
  }

  function toggleEditStudent(studentId: string) {
    setEditSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }

  async function handleEditSave() {
    if (!editingEvent) return;
    setEditSaving(true);

    try {
      const res = await fetch(`/api/events/${editingEvent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: Array.from(editSelectedIds),
          startTime: `${editStartHour}:${editStartMinute} ${editStartPeriod}`,
          endTime: `${editEndHour}:${editEndMinute} ${editEndPeriod}`,
          date: new Date(editDate).toISOString(),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e._id === editingEvent._id ? updated : e))
        );
        closeEditModal();
      }
    } catch {
      setError('Failed to save changes');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(eventId: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
      }
    } catch {
      setError('Failed to delete event');
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  }

  async function handleToggleExpose(eventId: string, currentExposed: boolean) {
    setTogglingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exposed: !currentExposed }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? updated : e))
        );
      }
    } catch {
      setError('Failed to update visibility');
    } finally {
      setTogglingId(null);
    }
  }

  function handleGeneratePDF(event: EventRecord) {
    const sortedStudents = [...event.students].sort((a, b) =>
      a.rollNo.localeCompare(b.rollNo)
    );

    const pdf = generateODPdf({
      companyName: event.companyName,
      eventType: event.eventType,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      students: sortedStudents,
    });

    // Open in new tab for preview and download
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  }

  function handleGenerateDOCX(event: EventRecord) {
    const sortedStudents = [...event.students].sort((a, b) =>
      a.rollNo.localeCompare(b.rollNo)
    );

    generateODDocx({
      companyName: event.companyName,
      eventType: event.eventType,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      students: sortedStudents,
    });
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const filteredEditStudents = allStudents.filter((s) => {
    const q = editSearch.toLowerCase();
    return (
      s.rollNo.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    );
  });

  function toggleEditSelectAll() {
    if (editSelectedIds.size === filteredEditStudents.length && filteredEditStudents.length > 0) {
      setEditSelectedIds(new Set());
    } else {
      setEditSelectedIds(new Set(filteredEditStudents.map(s => s._id)));
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Records</h1>
        <p className="page-description">
          View events, manage students, and generate OD documents
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No records yet</div>
          <p>Create an event and add students to see records here</p>
        </div>
      ) : (
        <div className="records-list">
          {events.map((event) => (
            <div key={event._id} className="record-card">
              <div className="record-header">
                <div className="record-info">
                  <div className="record-company">
                    M/s {event.companyName}
                  </div>
                  <div className="record-meta">
                    <span className="record-tag">{event.eventType}</span>
                    <span className="record-detail">
                      {formatDate(event.date)}
                    </span>
                    <span className="record-detail">
                      {event.startTime} - {event.endTime}
                    </span>
                    <span className="record-students-badge">
                      {event.students.length} students
                    </span>
                  </div>
                </div>

                <div className="record-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(event)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleGeneratePDF(event)}
                    disabled={event.students.length === 0}
                  >
                    PDF
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleGenerateDOCX(event)}
                    disabled={event.students.length === 0}
                  >
                    DOCX
                  </button>
                  <button
                    className={`btn btn-sm ${
                      event.exposed ? 'btn-expose-active' : 'btn-expose'
                    }`}
                    onClick={() => handleToggleExpose(event._id, event.exposed)}
                    disabled={togglingId === event._id}
                  >
                    {togglingId === event._id
                      ? '...'
                      : event.exposed
                      ? 'Hide'
                      : 'Expose'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeletingId(event._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <div className="modal-backdrop" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                Edit Students — {editingEvent.companyName}
              </h2>
              <button className="modal-close" onClick={closeEditModal}>
                &#x2715;
              </button>
            </div>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Time</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select className="form-input" value={editStartHour} onChange={(e) => setEditStartHour(e.target.value)} style={{ padding: '8px 12px' }}>
                      {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select className="form-input" value={editStartMinute} onChange={(e) => setEditStartMinute(e.target.value)} style={{ padding: '8px 12px' }}>
                      {minutesList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="form-input" value={editStartPeriod} onChange={(e) => setEditStartPeriod(e.target.value)} style={{ padding: '8px 12px' }}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End Time</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select className="form-input" value={editEndHour} onChange={(e) => setEditEndHour(e.target.value)} style={{ padding: '8px 12px' }}>
                      {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select className="form-input" value={editEndMinute} onChange={(e) => setEditEndMinute(e.target.value)} style={{ padding: '8px 12px' }}>
                      {minutesList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="form-input" value={editEndPeriod} onChange={(e) => setEditEndPeriod(e.target.value)} style={{ padding: '8px 12px' }}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="students-toolbar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or roll number..."
                value={editSearch}
                onChange={(e) => setEditSearch(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="students-count">
                  {filteredEditStudents.length} students
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={toggleEditSelectAll}
                >
                  {editSelectedIds.size === filteredEditStudents.length && filteredEditStudents.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="students-list">
                {filteredEditStudents.map((student) => (
                  <div
                    key={student._id}
                    className={`student-row ${
                      editSelectedIds.has(student._id) ? 'selected' : ''
                    }`}
                    onClick={() => toggleEditStudent(student._id)}
                  >
                    <input
                      type="checkbox"
                      className="student-checkbox"
                      checked={editSelectedIds.has(student._id)}
                      onChange={() => toggleEditStudent(student._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="student-rollno">{student.rollNo}</span>
                    <span className="student-name">{student.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <span className="selected-count">
                <strong>{editSelectedIds.size}</strong> students selected
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleEditSave}
                  disabled={editSaving}
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div
          className="modal-backdrop"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Delete Event</h2>
              <button
                className="modal-close"
                onClick={() => setDeletingId(null)}
              >
                &#x2715;
              </button>
            </div>
            <div className="confirm-text">
              Are you sure you want to delete this event? This action cannot be
              undone and all associated student selections will be lost.
            </div>
            <div className="confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deletingId)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
