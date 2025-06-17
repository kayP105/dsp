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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onDataChange } = useOutletContext(); // Get the refresh function from MainLayout

  // This useEffect fetches the schedule and re-runs whenever onDataChange is called
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await api.get('/planner');
        setEvents(response.data);
      } catch (err) {
        console.error('Failed to fetch schedule', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [onDataChange]);

  const handleEventClick = async (clickInfo) => {
    // Check if it's a manual event (pink) or a scheduled task (blue)
    if (clickInfo.event.backgroundColor === '#f06595') {
      if (window.confirm(`Delete the manual event '${clickInfo.event.title}'?`)) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== clickInfo.event.id));
      }
      return;
    }

    // It's a scheduled study block, so delete the master task
    if (window.confirm(`This will delete the entire master task for '${clickInfo.event.title}'. Are you sure?`)) {
      try {
        const taskId = clickInfo.event.extendedProps.taskId;
        if (!taskId) {
            alert('Error: This event is not linked to a master task.');
            return;
        }
        await api.delete(`/tasks/${taskId}`);
        onDataChange(); // <-- Trigger a full refresh of all data in the app
      } catch (error) {
        console.error('Failed to delete task', error);
        alert('Could not delete the task.');
      }
    }
  };
  
  const handleDateSelect = (selectInfo) => {
    let title = prompt('Please enter a title for your new event:');
    if (title) {
      const newEvent = {
        id: Date.now().toString(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        backgroundColor: '#f06595',
        borderColor: '#f06595',
      };
      setEvents(currentEvents => [...currentEvents, newEvent]);
    }
    selectInfo.view.calendar.unselect();
  };

  if (loading) return <div className="card"><h3>Generating your dynamic plan...</h3></div>;

  return (
    <div className="planner-dashboard">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="timeGridWeek"
        events={events}
        editable={true}
        selectable={true}
        eventClick={handleEventClick}
        select={handleDateSelect}
        height="100%"
      />
    </div>
  );
};

export default PlannerDashboard;