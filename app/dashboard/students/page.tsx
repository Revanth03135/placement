'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  _id: string;
  rollNo: string;
  name: string;
}

interface EventItem {
  _id: string;
  companyName: string;
  eventType: string;
  date: string;
  students: Student[];
}

export default function AddStudentsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, studentsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/students'),
      ]);
      const eventsData = await eventsRes.json();
      const studentsData = await studentsRes.json();
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find((e) => e._id === selectedEventId);
      if (event) {
        setSelectedStudentIds(
          new Set(event.students.map((s) => s._id))
        );
      }
    } else {
      setSelectedStudentIds(new Set());
    }
  }, [selectedEventId, events]);

  function toggleStudent(studentId: string) {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.rollNo.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    );
  });

  function toggleSelectAll() {
    if (selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0) {
      // Deselect all
      setSelectedStudentIds(new Set());
    } else {
      // Select all filtered
      setSelectedStudentIds(new Set(filteredStudents.map(s => s._id)));
    }
  }

  async function handleSave() {
    if (!selectedEventId) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/events/${selectedEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: Array.from(selectedStudentIds),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save students');
      } else {
        const updated = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e._id === selectedEventId ? updated : e))
        );
        setSuccess(
          `Saved! Redirecting to records...`
        );
        setTimeout(() => {
          router.push('/dashboard/records');
        }, 1500);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  }



  const selectedEvent = events.find((e) => e._id === selectedEventId);

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
        <h1 className="page-title">Add Students</h1>
        <p className="page-description">
          Select students for a placement event
        </p>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="students-layout">
        <div className="event-selector">
          <label className="event-selector-label">Select Event</label>
          <select
            className="form-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">Choose an event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.companyName} - {event.eventType} (
                {new Date(event.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <div className="students-panel">
            <div className="students-toolbar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="students-count">
                  {filteredStudents.length} students
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={toggleSelectAll}
                >
                  {selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>
            </div>

            <div className="students-list">
              {filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className={`student-row ${
                    selectedStudentIds.has(student._id) ? 'selected' : ''
                  }`}
                  onClick={() => toggleStudent(student._id)}
                >
                  <input
                    type="checkbox"
                    className="student-checkbox"
                    checked={selectedStudentIds.has(student._id)}
                    onChange={() => toggleStudent(student._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="student-rollno">{student.rollNo}</span>
                  <span className="student-name">{student.name}</span>
                </div>
              ))}
            </div>

            <div className="students-footer">
              <span className="selected-count">
                <strong>{selectedStudentIds.size}</strong> students selected
              </span>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {!selectedEvent && events.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-title">No events yet</div>
            <p>Create an event first from the Add Event page</p>
          </div>
        )}
      </div>
    </div>
  );
}
