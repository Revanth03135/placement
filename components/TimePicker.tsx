'use client';

import { useState, useEffect } from 'react';

interface TimePickerProps {
  label: string;
  value: string; // e.g., "09:00 AM"
  onChange: (time: string) => void;
}

export default function TimePicker({ label, value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'hour' | 'minute'>('hour');
  
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (isOpen && value) {
      const match = value.match(/(\d{2}):(\d{2}) (AM|PM)/);
      if (match) {
        setHour(match[1]);
        setMinute(match[2]);
        setPeriod(match[3]);
      }
      setView('hour');
    }
  }, [isOpen, value]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSave = () => {
    onChange(`${hour}:${minute} ${period}`);
    handleClose();
  };

  const handleHourSelect = (h: number) => {
    setHour(String(h).padStart(2, '0'));
    setView('minute');
  };

  const handleMinuteSelect = (m: number) => {
    setMinute(String(m).padStart(2, '0'));
  };

  const getPosition = (index: number, total: number) => {
    // 12 is at the top (-90 degrees)
    const angle = ((index / total) * 360 - 90) * (Math.PI / 180);
    const radius = 38; // percentage from center
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    return { left: `${x}%`, top: `${y}%` };
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const formatMin = (m: number) => m === 0 ? '00' : String(m);

  return (
    <div className="tp-container">
      <label className="form-label">{label}</label>
      <div className="tp-input" onClick={handleOpen}>
        {value || 'Select time'}
      </div>

      {isOpen && (
        <div className="tp-backdrop" onClick={handleClose}>
          <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tp-header">
              <div className="tp-time-display">
                <span 
                  className={`tp-time-part ${view === 'hour' ? 'active' : ''}`}
                  onClick={() => setView('hour')}
                >
                  {hour}
                </span>
                <span className="tp-colon">:</span>
                <span 
                  className={`tp-time-part ${view === 'minute' ? 'active' : ''}`}
                  onClick={() => setView('minute')}
                >
                  {minute}
                </span>
              </div>
              <div className="tp-period-toggles">
                <button 
                  className={`tp-period-btn ${period === 'AM' ? 'active' : ''}`}
                  onClick={() => setPeriod('AM')}
                >
                  AM
                </button>
                <button 
                  className={`tp-period-btn ${period === 'PM' ? 'active' : ''}`}
                  onClick={() => setPeriod('PM')}
                >
                  PM
                </button>
              </div>
            </div>

            <div className="tp-clock-container">
              <div className="tp-clock-face">
                <div className="tp-clock-center" />
                
                {/* A subtle hand pointing from center to the selected number */}
                {view === 'hour' && (
                  <div 
                    className="tp-clock-hand"
                    style={{ 
                      transform: `rotate(${(parseInt(hour) % 12) * 30}deg)`
                    }}
                  />
                )}
                {view === 'minute' && (
                  <div 
                    className="tp-clock-hand"
                    style={{ 
                      transform: `rotate(${parseInt(minute) * 6}deg)`
                    }}
                  />
                )}

                {view === 'hour' && hours.map((h, i) => {
                  const pos = getPosition(i, 12);
                  const isSelected = parseInt(hour, 10) === h || (h === 12 && parseInt(hour, 10) === 0);
                  return (
                    <button
                      key={h}
                      type="button"
                      className={`tp-clock-number ${isSelected ? 'selected' : ''}`}
                      style={{ left: pos.left, top: pos.top }}
                      onClick={() => handleHourSelect(h)}
                    >
                      {h}
                    </button>
                  );
                })}

                {view === 'minute' && minutes.map((m, i) => {
                  const pos = getPosition(i, 12);
                  const isSelected = parseInt(minute, 10) === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`tp-clock-number ${isSelected ? 'selected' : ''}`}
                      style={{ left: pos.left, top: pos.top }}
                      onClick={() => handleMinuteSelect(m)}
                    >
                      {formatMin(m)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tp-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleClose}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
