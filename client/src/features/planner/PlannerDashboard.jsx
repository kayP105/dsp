import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

const PlannerDashboard = () => {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get('/planner');
        setPlan(response.data);
      } catch (err) {
        setError('Failed to fetch study plan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  if (loading) return <p>Generating your plan...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Your Study Plan</h2>
      {plan.length === 0 ? (
        <p>You have no tasks yet. Go to "Add Task" to create your plan!</p>
      ) : (
        plan.map((task) => (
          <div key={task.id} className="card">
            <h3>{task.subject}</h3>
            <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
            <p><strong>Total Hours:</strong> {task.hours}</p>
            <p><strong>Days Remaining:</strong> {task.daysRemaining}</p>
            <p style={{ color: '#007bff', fontWeight: 'bold' }}>
              Recommended Pace: {task.hoursPerDay} hours/day
            </p>
            {/* TODO: Add a "Mark as Complete" button here */}
          </div>
        ))
      )}
    </div>
  );
};

export default PlannerDashboard;