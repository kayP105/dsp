// client/src/components/layout/MainLayout.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Link } from 'react-router-dom';
import api from '../../lib/api';
import MainNavigationSidebar from './MainNavigationSidebar';
import EventsSidebar from './EventsSidebar';
import TasksSidebar from './TasksSidebar';
import TodaysTasks from './TodayTasks';
import ProfileBox from './ProfileBox';
import './MainLayout.css';
import { FaClock } from 'react-icons/fa';

const MainLayout = () => {
  const [user, setUser] = useState(null);
  const [manualEvents, setManualEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [plannerEvents, setPlannerEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDataForLayout = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userResponse, eventsResponse, tasksResponse, plannerResponse] = await Promise.all([
        api.get('/users/me'),
        api.get('/events'),
        api.get('/tasks'),
        api.get('/planner')
      ]);
      setUser(userResponse.data);
      setManualEvents(eventsResponse.data);
      setTasks(tasksResponse.data);
      setPlannerEvents(plannerResponse.data);
    } catch (error) {
      console.error("A critical error occurred while fetching layout data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDataForLayout();
  }, [fetchDataForLayout]);

  return (
    <div className="shell page-fade-in">
      <div className="grid-nav">
        <MainNavigationSidebar />
      </div>
      <div className="main-layout-grid-cute">
        <div className="grid-profile">
          <ProfileBox user={user} isLoading={isLoading} />
        </div>
        <div className="grid-actions">
           <Link to="/app/focus-timer" className="action-box">
             <FaClock size={24} />
             <span>Focus Mode</span>
           </Link>
        </div>
        <div className="grid-events">
          <EventsSidebar events={manualEvents} isLoading={isLoading} />
        </div>
        {/* THE FIX IS HERE: Restoring className="grid-main" */}
        <main className="grid-main">
          <Outlet context={{ events: plannerEvents, onDataChange: fetchDataForLayout, isLoading }} />
        </main>
        <div className="grid-right-column">
          <TodaysTasks events={plannerEvents} isLoading={isLoading} onDataChange={fetchDataForLayout} />
          <TasksSidebar tasks={tasks} isLoading={isLoading} onDataChange={fetchDataForLayout} />
        </div>
      </div>
    </div>
  );
};
export default MainLayout;