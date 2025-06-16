import React, { useState } from 'react';
import api from '../../lib/api';

const TaskInputPage = () => {
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [hours, setHours] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/tasks', { subject, deadline, hours });
      setMessage('Task added successfully!');
      setSubject('');
      setDeadline('');
      setHours('');
    } catch (err) {
      setMessage('Failed to add task.');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h2>Add a New Subject or Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Subject or Topic Name"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Deadline"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Total Hours Required"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          required
          min="1"
        />
        <button type="submit">Add Task</button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default TaskInputPage;