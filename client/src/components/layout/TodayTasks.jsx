// client/src/components/layout/TodaysTasks.jsx

import React from 'react';
import api from '../../lib/api';
import './Sidebars.css';

const TodaysTasks = ({ events, isLoading, onDataChange }) => {
  
  // **FIX 2: Create a timezone-safe local date string.**
  // Using toISOString() can give you yesterday's or tomorrow's date depending on your timezone.
  // This method always gets the date according to the user's local machine.
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayString = getTodayString();

  const todaysTasks = (events || []).filter(event => 
    event.extendedProps?.type === 'task' && event.extendedProps?.date === todayString
  );

  const handleUpdate = async (event, markAsComplete) => {
    const { taskId, date, hours } = event.extendedProps;
    try {
      await api.post(`/tasks/${taskId}/progress`, {
        date: date,
        hours: hours,
        completed: markAsComplete,
      });
      onDataChange();
    } catch (error) {
      alert("Could not update task status.");
      console.error("Failed to update today's task status", error);
    }
  };

  const renderContent = () => {
    if (isLoading) return <p className="loading-message">...</p>;
    if (todaysTasks.length === 0) return <p className="no-items-message">All clear for today! ✨</p>;

    return todaysTasks.map(event => {
      const isComplete = event.extendedProps.isComplete;
      return (
        <div key={event.id} className="today-task-item-cute">
          <span>{event.title}</span>
          <div className="today-task-actions">
            <button 
              className="action-btn check" 
              onClick={() => handleUpdate(event, true)}
              disabled={isComplete}
              title="Mark as Done"
            ></button>
            <button 
              className="action-btn cross" 
              onClick={() => handleUpdate(event, false)}
              disabled={!isComplete}
              title="Mark as Incomplete"
            ></button>
          </div>
        </div>
      );
    });
  };

  return (
    <aside className="info-panel-cute today-tasks-box">
      <h3>Today's Focus</h3>
      <div className="panel-content">
        {renderContent()}
      </div>
    </aside>
  );
};

export default TodaysTasks;