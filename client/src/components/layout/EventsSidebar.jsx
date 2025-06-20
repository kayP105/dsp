// client/src/components/layout/EventsSidebar.jsx
import React from 'react';
import './EventsSidebar.css';

const EventsSidebar = ({ events, isLoading }) => {
  const renderContent = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    }
    if (!events || events.length === 0) {
      return <p>No events yet.</p>;
    }
    return events.map((event) => (
      <div key={event.id} className="event-item">
        {event.title}
      </div>
    ));
  };

  return (
    <aside className="events-sidebar">
      <h3>EVENTS</h3>
      {renderContent()}
    </aside>
  );
};

export default EventsSidebar;