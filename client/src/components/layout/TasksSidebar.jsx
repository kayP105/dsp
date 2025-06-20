// client/src/components/layout/TasksSidebar.jsx

import React from 'react';
import { FaTrash } from 'react-icons/fa';
import api from '../../lib/api';
import './TasksSidebar.css';

const getDaysLeft = (deadline) => {
    if (!deadline) return 'No deadline';
    const today = new Date();
    const deadlineDate = new Date(deadline);
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
};

const TasksSidebar = ({ tasks, isLoading, onDataChange }) => {
  
  const handleDelete = async (taskId, taskSubject) => {
    if (window.confirm(`Delete the task for '${taskSubject}'?`)) {
      try {
        await api.delete(`/tasks/${taskId}`);
        onDataChange();
      } catch (error) {
        alert('Could not delete the task.');
      }
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    }
    if (!tasks || tasks.length === 0) {
      return <p>No tasks found.</p>;
    }
    return tasks.map((task) => {
      const completedHours = Object.values(task.dailyProgress || {}).reduce((a, b) => a + b, 0);
      const hoursLeft = task.hours - completedHours;

      return (
        <div key={task.id} className="task-item">
          <div className="task-info">
            <span className="task-subject">{task.subject}</span>
            <small className="task-details">Hours Left: {hoursLeft.toFixed(1)} / {task.hours}</small>
            <small className="task-deadline">{getDaysLeft(task.deadline)}</small>
          </div>
          <button
            className="delete-btn"
            onClick={() => handleDelete(task.id, task.subject)}
            title="Delete Task"
          >
            <FaTrash />
          </button>
        </div>
      );
    });
  };

  return (
    <aside className="tasks-sidebar">
      <h3>TASKS</h3>
      {renderContent()}
    </aside>
  );
};

export default TasksSidebar;