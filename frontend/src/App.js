import React, { useState } from 'react';
import './App.css';
import TimeBlockingCalendar from './components/TimeBlocking/TimeBlockingCalendar';
import PomodoroTimer from './components/Pomodoro/PomodoroTimer';
import DailyTaskList from './components/TaskList/DailyTaskList';
import RecurringTasks from './components/RecurringTasks/RecurringTasks';
import MonthlyBoard from './components/MonthlyBoard/MonthlyBoard';

function App() {
  const [activeComponent, setActiveComponent] = useState('timeBlocking');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    {
      id: 'timeBlocking',
      label: 'Time Blocking',
      icon: '📅',
      description: 'Schedule your time effectively'
    },
    {
      id: 'pomodoro',
      label: 'Pomodoro Timer',
      icon: '⏱️',
      description: 'Focus on your work'
    },
    {
      id: 'taskList',
      label: 'Daily Task List',
      icon: '📝',
      description: 'Manage your daily tasks'
    },
    {
      id: 'recurringTasks',
      label: 'Recurring Tasks',
      icon: '🔄',
      description: 'Set up repeating tasks'
    },
    {
      id: 'monthlyBoard',
      label: 'Monthly Board',
      icon: '📊',
      description: 'View all projects and tasks'
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'timeBlocking':
        return (
          <div className="feature-section time-blocking-section">
            <h2>Time Blocking Calendar</h2>
            <TimeBlockingCalendar />
          </div>
        );
      case 'pomodoro':
        return (
          <div className="feature-section">
            <h2>Pomodoro Timer</h2>
            <PomodoroTimer />
          </div>
        );
      case 'taskList':
        return (
          <div className="feature-section">
            <h2>Daily Task List</h2>
            <DailyTaskList />
          </div>
        );
      case 'recurringTasks':
        return (
          <div className="feature-section">
            <h2>Recurring Tasks</h2>
            <RecurringTasks />
          </div>
        );
      case 'monthlyBoard':
        return (
          <div className="feature-section">
            <h2>Monthly Board</h2>
            <MonthlyBoard />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <nav className={`main-nav ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="nav-header">
          <h1>Time Management</h1>
          <button className="toggle-sidebar-button" onClick={toggleSidebar}>
            {isSidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>
        <div className="nav-items">
          {navItems.map(item => (
            <div key={item.id} className="nav-item-container">
              <button
                className={`nav-item ${activeComponent === item.id ? 'active' : ''}`}
                onClick={() => setActiveComponent(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isSidebarCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </nav>
      <main className="main-content">
        <div className="features-container">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

export default App; 