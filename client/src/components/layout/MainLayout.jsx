// client/src/components/layout/MainLayout.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import api from '../../lib/api';
import MainNavigationSidebar from './MainNavigationSidebar';
import EventsSidebar from './EventsSidebar';
import TasksSidebar from './TasksSidebar';
import './MainLayout.css';

const MainLayout = () => {
  const [manualEvents, setManualEvents] = useState([]); // State for the Events sidebar
  const [tasks, setTasks] = useState([]);             // State for the Tasks sidebar
  const [isLoading, setIsLoading] = useState(true);

  const fetchDataForSidebars = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch both the manual events list and the tasks list
      const [eventsResponse, tasksResponse] = await Promise.all([
        api.get('/events'), // We will create this new endpoint
        api.get('/tasks')
      ]);
      
      setManualEvents(eventsResponse.data);
      setTasks(tasksResponse.data);

    } catch (error) {
      console.error("Failed to fetch layout data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDataForSidebars();
  }, [fetchDataForSidebars]);

  return (
    <div className="main-layout">
      <MainNavigationSidebar />
      {/* Pass the list of manual events to the EventsSidebar */}
      <EventsSidebar events={manualEvents} isLoading={isLoading} />
      <main className="main-content-area">
        <Outlet context={{ onDataChange: fetchDataForSidebars }} />
      </main>
      <TasksSidebar tasks={tasks} isLoading={isLoading} onDataChange={fetchDataForSidebars} />
    </div>
  );
};

export default MainLayout;