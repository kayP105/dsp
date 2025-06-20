// client/src/features/planner/PlannerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../lib/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './PlannerDashboard.css';

const PlannerDashboard = () => {
  const { onDataChange } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCalendarEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/planner');
            setEvents(response.data);
        } catch (error) {
            console.error("Failed to load calendar events", error);
        } finally {
            setLoading(false);
        }
    };
    fetchAllCalendarEvents();
  }, [onDataChange]);

  const handleEventClick = async (clickInfo) => {
    const { type, taskId, date, hours, isComplete } = clickInfo.event.extendedProps;

    if (type === 'progress' || type === 'task') {
        const actionText = isComplete ? 'mark as incomplete' : 'mark as complete';
        if (window.confirm(`Do you want to ${actionText} the session for '${clickInfo.event.title}'?`)) {
            try {
                // Tell the backend about the change
                await api.post(`/tasks/${taskId}/progress`, {
                    date,
                    hours: hours,
                    completed: !isComplete
                });

                // --- THIS IS THE FIX ---
                // Update the local state immediately for instant visual feedback
                setEvents(currentEvents => currentEvents.map(event => {
                    if (event.id === clickInfo.event.id) {
                        // This is the event we clicked. Return a new version of it.
                        return {
                            ...event,
                            backgroundColor: !isComplete ? '#2f9e44' : '#ced4da', // Toggle color
                            borderColor: !isComplete ? '#2f9e44' : '#ced4da',
                            extendedProps: {
                                ...event.extendedProps,
                                isComplete: !isComplete // Toggle completion status
                            }
                        };
                    }
                    return event; // Return all other events unchanged
                }));

                // Also, tell the parent to refresh the sidebar data in the background
                onDataChange();

            } catch (error) {
                alert('Could not update progress.');
            }
        }
    } else if (type === 'manual') {
        // ... manual event deletion logic ...
    }
  };
  
  const renderEventContent = (eventInfo) => {
    const { type, isComplete } = eventInfo.event.extendedProps;
    if (type === 'progress') {
      return (
        <div className="progress-event">
          <span className={`checkbox ${isComplete ? 'checked' : ''}`}></span>
          <span className="event-title">{eventInfo.event.title} {isComplete ? '(Done)' : '(Missed)'}</span>
        </div>
      );
    }
    if (type === 'task') {
        return (
            <div className="task-event">
                <span className="checkbox"></span>
                <span className="event-title">{eventInfo.event.title}</span>
            </div>
        )
    }
    return <i>{eventInfo.event.title}</i>;
  };

  if (loading) return <div className="card"><h3>Loading your schedule...</h3></div>;
  
  return (
    <div className="planner-dashboard">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="100%"
        headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        }}
        editable={false}
        selectable={false}
      />
    </div>
  );
};

export default PlannerDashboard;