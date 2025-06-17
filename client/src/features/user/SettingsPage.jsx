// client/src/features/user/SettingsPage.jsx (New File)

import React, { useState } from 'react';
import api from '../../lib/api';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SettingsPage = () => {
  const [availability, setAvailability] = useState({
    0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 4, 6: 4 // Default hours
  });
  const [message, setMessage] = useState('');

  const handleHoursChange = (dayIndex, hours) => {
    setAvailability(prev => ({ ...prev, [dayIndex]: parseInt(hours) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // We need to create this backend endpoint next
      await api.post('/user/availability', { availability });
      setMessage('Availability saved successfully!');
    } catch (error) {
      setMessage('Failed to save availability.');
      console.error(error);
    }
  };

  return (
    <div className="card">
      <h2>Your Weekly Availability</h2>
      <p>Set how many hours per day you can dedicate to studying.</p>
      <form onSubmit={handleSubmit}>
        {daysOfWeek.map((day, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <label>{day}</label>
            <input
              type="number"
              min="0"
              max="24"
              value={availability[index]}
              onChange={(e) => handleHoursChange(index, e.target.value)}
              style={{ width: '100px' }}
            />
          </div>
        ))}
        <button type="submit">Save Availability</button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default SettingsPage;