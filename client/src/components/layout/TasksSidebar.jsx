import React from 'react';
import { FaTrash } from 'react-icons/fa';
import api from '../../lib/api';
import './Sidebars.css';

const getDaysLeft = (deadline) => {
    if (!deadline) return 'No deadline';
    // Use UTC to match server logic and avoid timezone issues
    const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
    const deadlineDate = new Date(deadline);
    deadlineDate.setUTCHours(0, 0, 0, 0);

    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
};

const TasksSidebar = ({ tasks, isLoading, onDataChange }) => {
  const handleDelete = async (taskId, subject) => {
    if (window.confirm(`Delete task '${subject}'?`)) {
      try {
        await api.delete(`/tasks/${taskId}`);
        onDataChange();
      } catch (error) { alert('Could not delete task.'); }
    }
  };
  return (
    <aside className="info-panel-cute">
      <h3>All Tasks</h3>
      <div className="panel-content">
        {isLoading ? <p className="loading-message">...</p> :
         !tasks || tasks.length === 0 ? <p className="no-items-message">No tasks found.</p> :
         tasks.map(task => {
            // **FIX 3: Correctly calculate completed hours to fix the 'NaN' bug.**
            // We need to filter for completed entries and then sum their 'hours' property.
            const completedHours = Object.values(task.dailyProgress || {})
              .filter(progress => progress.completed)
              .reduce((sum, progress) => sum + progress.hours, 0);

            const remaining = task.hours - completedHours;
            
            return (
              <div key={task.id} className="task-item-cute">
                <div className="task-info">
                  <span className="task-subject">{task.subject}</span>
                  <small className="task-details">Hours Left: {remaining.toFixed(1)}/{task.hours}</small>
                  <small className="task-deadline">{getDaysLeft(task.deadline)}</small>
                </div>
                <button className="delete-btn" onClick={() => handleDelete(task.id, task.subject)}><FaTrash /></button>
              </div>
            );
         })
        }
      </div>
    </aside>
  );
};
export default TasksSidebar;