import React from 'react';
import './Sidebars.css';

const EventsSidebar = ({ events, isLoading }) => {
  return (
    <aside className="info-panel-cute">
      <h3>Events</h3>
      <div className="panel-content">
        {isLoading ? <p className="loading-message">...</p> : 
         !events || events.length === 0 ? <p className="no-items-message">No events.</p> :
         events.map(event => <div key={event.id} className="event-item-cute">{event.title}</div>)
        }
      </div>
    </aside>
  );
};
export default EventsSidebar;