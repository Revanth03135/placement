'use client';

import { useState, FormEvent } from 'react';

export default function AddEventPage() {
  const [companyName, setCompanyName] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endHour, setEndHour] = useState('05');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState('PM');

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!companyName.trim() || !eventType || !date || !startHour || !startMinute || !endHour || !endMinute) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          eventType,
          date,
          startTime: `${startHour}:${startMinute} ${startPeriod}`,
          endTime: `${endHour}:${endMinute} ${endPeriod}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create event');
      } else {
        setSuccess(`Event for "${companyName}" created successfully`);
        setCompanyName('');
        setEventType('');
        setDate('');
        setStartHour('09');
        setStartMinute('00');
        setStartPeriod('AM');
        setEndHour('05');
        setEndMinute('00');
        setEndPeriod('PM');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add Event</h1>
        <p className="page-description">
          Create a new placement event
        </p>
      </div>

      <div className="form-card">
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyName" className="form-label">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              className="form-input"
              placeholder="e.g. Tata Consultancy Services"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventType" className="form-label">
              Type of Event
            </label>
            <select
              id="eventType"
              className="form-select"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
            >
              <option value="" disabled>
                Select event type
              </option>
              <option value="Pre Placement Talk">Pre Placement Talk</option>
              <option value="Online Assessment">Online Assessment</option>
              <option value="Campus Interview">Campus Interview</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date
            </label>
            <input
              id="date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="form-select" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                  {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select className="form-select" value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
                  {minutesList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select className="form-select" value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="form-select" value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                  {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select className="form-select" value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
                  {minutesList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select className="form-select" value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
