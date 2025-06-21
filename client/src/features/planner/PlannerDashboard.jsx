// client/src/features/planner/PlannerDashboard.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../lib/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './PlannerDashboard.css';

const PlannerDashboard = () => {
  // Get everything from the parent layout, removing redundant local state and fetches
  const { events, isLoading, onDataChange } = useOutletContext();

  const handleEventClick = async (clickInfo) => {
    const props = clickInfo.event.extendedProps;

    if (props.type === 'task') {
      const { taskId, date, hours, isComplete } = props;

      if (taskId === undefined || date === undefined || hours === undefined || isComplete === undefined) {
        alert("Cannot process this event: data is missing.");
        return;
      }

      const actionText = isComplete ? 'mark as incomplete' : 'mark as complete';
      if (window.confirm(`Do you want to ${actionText} '${clickInfo.event.title}'?`)) {
        try {
          await api.post(`/tasks/${taskId}/progress`, {
            date,
            hours,
            completed: !isComplete
          });
          // Tell the main layout to refresh all data for perfect sync
          onDataChange();
        } catch (error) {
          alert('Could not sync with the server. Please try again.');
          console.error('Could not update progress:', error);
        }
      }
    }
  };
  
  const renderEventContent = (eventInfo) => {
    const { type, isComplete } = eventInfo.event.extendedProps;
    if (type === 'task') {
      return (
        <div className="task-event-wrapper">
          <span className={`checkbox ${isComplete ? 'checked' : ''}`}></span>
          <span className="event-title">{eventInfo.event.title}</span>
        </div>
      );
    }
    return <div className="manual-event-wrapper"><i>{eventInfo.event.title}</i></div>;
  };

  if (isLoading) {
    return <div className="loading-container"><h3>Loading your cute schedule...</h3></div>;
  }
  
  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="100%"
      />
    </div>
  );
};

export default PlannerDashboard;