// client/src/components/layout/EventsSidebar.jsx

import React from 'react';
import './EventsSidebar.css';

// A helper function to assign a color based on the subject name
const getColorForSubject = (subject) => {
  const colors = ['#66d9e8', '#ffc078', '#da77f2', '#f06595', '#a9e34b', '#748ffc'];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash % colors.length)];
};


const EventsSidebar = ({ subjects, isLoading }) => {
  return (
    <aside className="events-sidebar">
      <h3>EVENTS</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : subjects.length > 0 ? (
        subjects.map((subject, index) => (
          <div 
            key={index} 
            className="event-item" 
            style={{ borderLeft: `4px solid ${getColorForSubject(subject)}` }}
          >
            {subject}
          </div>
        ))
      ) : (
        <p>No events yet. Add a task to create one!</p>
      )}
    </aside>
  );
};

export default EventsSidebar;