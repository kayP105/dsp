// client/src/features/user/SettingsPage.jsx

import React, { useState } from 'react';
import api from '../../lib/api';
import './SettingsPage.css'; // We'll create this CSS file

const initialAvailability = [
  { day: 'Sunday', hours: 2, startTime: '13:00', endTime: '15:00', enabled: true },
  { day: 'Monday', hours: 2, startTime: '18:00', endTime: '20:00', enabled: true },
  { day: 'Tuesday', hours: 2, startTime: '18:00', endTime: '20:00', enabled: true },
  { day: 'Wednesday', hours: 2, startTime: '18:00', endTime: '20:00', enabled: true },
  { day: 'Thursday', hours: 2, startTime: '18:00', endTime: '20:00', enabled: true },
  { day: 'Friday', hours: 4, startTime: '17:00', endTime: '21:00', enabled: true },
  { day: 'Saturday', hours: 4, startTime: '10:00', endTime: '14:00', enabled: true },
];

const SettingsPage = () => {
  const [availability, setAvailability] = useState(initialAvailability);
  const [message, setMessage] = useState('');

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = value;
    setAvailability(newAvailability);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/user/availability', { availability });
      setMessage('Availability saved successfully!');
    } catch (error) {
      setMessage('Failed to save availability.');
    }
  };

  return (
    <div className="card page-fade-in">
      <h2>Your Weekly Availability</h2>
      <p>Set the time windows you are free to study each day.</p>
      <form onSubmit={handleSubmit}>
        <div className="availability-grid">
          {availability.map((day, index) => (
            <div key={index} className={`day-row ${!day.enabled ? 'disabled' : ''}`}>
              <div className="day-name">
                <input 
                  type="checkbox" 
                  checked={day.enabled}
                  onChange={(e) => handleAvailabilityChange(index, 'enabled', e.target.checked)}
                />
                {day.day}
              </div>
              <div className="day-inputs">
                <label>From:</label>
                <input type="time" value={day.startTime} disabled={!day.enabled} onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)} />
                <label>To:</label>
                <input type="time" value={day.endTime} disabled={!day.enabled} onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <button type="submit" style={{marginTop: '2rem'}}>Save Availability</button>
      </form>
      {message && <p style={{ marginTop: '1rem', fontWeight: 600 }}>{message}</p>}
    </div>
  );
};

export default SettingsPage;