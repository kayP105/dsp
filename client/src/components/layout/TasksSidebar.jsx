// client/src/components/layout/TasksSidebar.jsx

import React from 'react';
import { FaTrash } from 'react-icons/fa';
import api from '../../lib/api';
import './TasksSidebar.css';

const TasksSidebar = ({ tasks, isLoading, onDataChange }) => {

  const handleDelete = async (taskId, taskSubject) => {
    if (window.confirm(`Are you sure you want to delete the task for '${taskSubject}'?`)) {
      try {
        await api.delete(`/tasks/${taskId}`);
        onDataChange(); // Trigger a refresh of the whole app's data
      } catch (error) {
        console.error('Failed to delete task from sidebar', error);
        alert('Could not delete the task.');
      }
    }
  };

  return (
    <aside className="tasks-sidebar">
      <h3>TASKS</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task.id} className="task-item">
            <div className="task-info">
              <span>{task.subject}</span>
              <small>Total: {task.hours} hours</small>
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(task.id, task.subject)}
              title="Delete Task"
            >
              <FaTrash />
            </button>
          </div>
        ))
      ) : (
        <p>No tasks found.</p>
      )}
    </aside>
  );
};

export default TasksSidebar;