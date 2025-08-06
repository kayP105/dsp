// client/src/features/user/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import './SettingsPage.css';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SettingsPage = () => {
  const [availability, setAvailability] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved availability when the component mounts
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await api.get('/availability');
        const savedAvailability = response.data;
        // If user has settings, use them. Otherwise, create default settings.
        if (savedAvailability && savedAvailability.length > 0) {
          setAvailability(savedAvailability);
        } else {
          // Create a default schedule for new users
          const defaultAvailability = daysOfWeek.map(day => ({
            day,
            startTime: day === 'Saturday' || day === 'Sunday' ? '10:00' : '18:00',
            endTime: day === 'Saturday' || day === 'Sunday' ? '14:00' : '20:00',
            enabled: true,
          }));
          setAvailability(defaultAvailability);
        }
      } catch (error) {
        console.error("Could not fetch availability", error);
        // Handle error by setting default availability
         const defaultAvailability = daysOfWeek.map(day => ({
            day,
            startTime: '10:00',
            endTime: '12:00',
            enabled: false,
          }));
          setAvailability(defaultAvailability);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, []);


  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = value;
    setAvailability(newAvailability);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Send the availability array directly
      await api.post('/availability', { availability });
      setMessage('Availability saved successfully!');
    } catch (error) {
      setMessage('Failed to save availability.');
    }
  };

  if (isLoading) {
    return <div className="card page-fade-in"><p>Loading your schedule...</p></div>;
  }

  return (
    <div className="card page-fade-in">
      <h2>Your Weekly Availability</h2>
      <p>Set the time windows you are free to study each day. The planner will only schedule tasks during these times.</p>
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