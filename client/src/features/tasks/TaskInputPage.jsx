// client/src/features/tasks/TaskInputPage.jsx

import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../lib/api';
import './TaskInputPage.css';

const TaskInputPage = () => {
  const { onDataChange } = useOutletContext();
  const navigate = useNavigate();
  
  const [formType, setFormType] = useState('task'); 
  
  // State for the Task form
  const [taskSubject, setTaskSubject] = useState('');
  const [taskStartDate, setTaskStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskHours, setTaskHours] = useState('');

  // State for the Event form
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('11:00');
  const [eventDescription, setEventDescription] = useState('');

  const [message, setMessage] = useState('');

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/tasks', { 
        subject: taskSubject, 
        startDate: taskStartDate,
        deadline: taskDeadline, 
        hours: taskHours 
      });
      onDataChange();
      setMessage('Task scheduled! Redirecting...');
      setTimeout(() => navigate('/app/dashboard'), 1500);
    } catch (err) {
      setMessage('Failed to add task.');
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/events', {
        name: eventName,
        date: eventDate,
        startTime: eventStartTime,
        endTime: eventEndTime,
        description: eventDescription
      });
      onDataChange();
      setMessage('Event added! Redirecting...');
      setTimeout(() => navigate('/app/dashboard'), 1500);
    } catch (err) {
      setMessage('Failed to add event.');
    }
  };

  return (
    <div className="card page-fade-in">
      <h2>Add New</h2>
      <div className="form-toggle">
        <button 
          className={formType === 'task' ? 'active' : ''} 
          onClick={() => setFormType('task')}>
          Task
        </button>
        <button 
          className={formType === 'event' ? 'active' : ''} 
          onClick={() => setFormType('event')}>
          Event
        </button>
      </div>

      {formType === 'task' ? (
        <form onSubmit={handleTaskSubmit} className="input-form">
          <p>Add a large task. We'll schedule study blocks for you from the start date to the deadline.</p>
          <label>Topic / Subject</label>
          <input type="text" value={taskSubject} onChange={(e) => setTaskSubject(e.target.value)} required />
          
          <label>Start Date</label>
          <input type="date" value={taskStartDate} onChange={(e) => setTaskStartDate(e.target.value)} required />

          <label>Deadline Date</label>
          <input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} required />
          <label>Total Hours Required</label>
          <input type="number" value={taskHours} onChange={(e) => setTaskHours(e.target.value)} required min="1" />
          <button type="submit">Add and Schedule Task</button>
        </form>
      ) : (
        <form onSubmit={handleEventSubmit} className="input-form">
          <p>Add a fixed event, like a meeting or appointment.</p>
          <label>Event Name</label>
          <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
          <label>Date</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          <label>Start Time</label>
          <input type="time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} required />
          <label>End Time</label>
          <input type="time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} required />
          <label>Description (optional)</label>
          <textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
          <button type="submit">Add Event</button>
        </form>
      )}
      {message && <p style={{ marginTop: '1rem', fontWeight: 600 }}>{message}</p>}
    </div>
  );
};

export default TaskInputPage;