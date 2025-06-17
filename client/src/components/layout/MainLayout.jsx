// client/src/components/layout/MainLayout.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import api from '../../lib/api';
import MainNavigationSidebar from './MainNavigationSidebar';
import EventsSidebar from './EventsSidebar';
import TasksSidebar from './TasksSidebar';
import './MainLayout.css';

const MainLayout = () => {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subjectsResponse, tasksResponse] = await Promise.all([
        api.get('/subjects'),
        api.get('/tasks') // <-- Now fetches the raw master tasks list
      ]);
      setSubjects(subjectsResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error("Failed to fetch sidebar data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // This function allows child components to trigger a full refresh of all data
  const handleDataChange = () => {
    fetchData();
  };

  return (
    <div className="main-layout">
      <MainNavigationSidebar />
      <EventsSidebar subjects={subjects} isLoading={isLoading} />
      <main className="main-content-area">
        {/* Pass the refresh function down to the routed component (PlannerDashboard) */}
        <Outlet context={{ onDataChange: handleDataChange }} />
      </main>
      {/* Pass data and the refresh function down to the TasksSidebar */}
      <TasksSidebar tasks={tasks} isLoading={isLoading} onDataChange={handleDataChange} />
    </div>
  );
};

export default MainLayout;