'use client';

import { useState, FormEvent } from 'react';
import TimePicker from '@/components/TimePicker';

export default function AddEventPage() {
  const [companyName, setCompanyName] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');


  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!companyName.trim() || !eventType || !date || !startTime || !endTime) {
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
          startTime,
          endTime,
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
        setStartTime('09:00 AM');
        setEndTime('05:00 PM');
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
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
              />
            </div>

            <div className="form-group">
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
              />
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
