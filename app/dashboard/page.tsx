'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardPage() {
  // Seed students on first load
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Manage placement events and generate OD forms
        </p>
      </div>

      <div className="dashboard-grid">
        <Link href="/dashboard/add" className="dashboard-card">
          <div className="card-indicator" />
          <div className="card-title">Add Event</div>
          <div className="card-description">
            Create a new placement event with company details, event type, date
            and time
          </div>
        </Link>

        <Link href="/dashboard/students" className="dashboard-card">
          <div className="card-indicator" />
          <div className="card-title">Add Students</div>
          <div className="card-description">
            Select students for placement events from the class roster
          </div>
        </Link>

        <Link href="/dashboard/records" className="dashboard-card">
          <div className="card-indicator" />
          <div className="card-title">Records</div>
          <div className="card-description">
            View all events, edit student lists, and generate OD PDF documents
          </div>
        </Link>
      </div>
    </div>
  );
}
