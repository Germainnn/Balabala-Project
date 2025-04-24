import React, { useState, useEffect } from 'react';
import './PomodoroTimer.css';
import { createPomodoroSession, getPomodoroSessions } from '../../utils/api';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [sessionSetting, setSessionSetting] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  // Load previously completed sessions
  useEffect(() => {
    fetchCompletedSessions();
  }, []);

  const fetchCompletedSessions = async () => {
    try {
      const sessions = await getPomodoroSessions();
      setCompletedSessions(sessions);
      // Update sessions based on completed sessions
      if (sessions.length > 0) {
        setSessions(sessions.length);
      }
    } catch (error) {
      console.error('Error fetching pomodoro sessions:', error);
    }
  };

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    if (!isBreak) {
      setSessions(prev => prev + 1);
      try {
        await createPomodoroSession({
          duration: 25,
          type: 'pomodoro',
          completedAt: new Date()
        });
      } catch (error) {
        console.error('Error saving pomodoro session:', error);
      }
    }
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSessionSetting({
      ...sessionSetting,
      [name]: parseInt(value, 10),
    });

    // Update current timer if matching the current mode
    if (name === 'pomodoro' && !isRunning) {
      setTimeLeft(parseInt(value, 10) * 60);
    }
  };

  // Calculate statistics
  const totalPomodoroTime = completedSessions
    .filter(session => session.type === 'pomodoro')
    .reduce((total, session) => total + session.duration, 0);

  const todayCompletedPomodoros = completedSessions
    .filter(session => {
      const sessionDate = new Date(session.completedAt);
      const today = new Date();
      return session.type === 'pomodoro' && 
        sessionDate.getDate() === today.getDate() &&
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear();
    }).length;

  return (
    <div className="pomodoro-timer">
      <h2>Pomodoro Timer</h2>
      <div className="timer-display">
        <div className="time">{formatTime(timeLeft)}</div>
        <div className="timer-label">{isBreak ? 'Break Time' : 'Focus Time'}</div>
      </div>
      <div className="timer-controls">
        <button onClick={toggleTimer}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      <div className="session-info">
        <p>Completed Sessions: {sessions}</p>
        <p>Today's completed pomodoros: {todayCompletedPomodoros}</p>
        <p>Total focus time: {Math.floor(totalPomodoroTime / 60)} hours {totalPomodoroTime % 60} minutes</p>
      </div>
      <div className="timer-settings">
        <h3>Timer Settings</h3>
        <div className="settings-form">
          <div>
            <label htmlFor="pomodoro">Pomodoro (minutes):</label>
            <input
              type="number"
              id="pomodoro"
              name="pomodoro"
              min="1"
              max="60"
              value={sessionSetting.pomodoro}
              onChange={handleSettingChange}
              disabled={isRunning}
            />
          </div>
          <div>
            <label htmlFor="shortBreak">Short Break (minutes):</label>
            <input
              type="number"
              id="shortBreak"
              name="shortBreak"
              min="1"
              max="30"
              value={sessionSetting.shortBreak}
              onChange={handleSettingChange}
              disabled={isRunning}
            />
          </div>
          <div>
            <label htmlFor="longBreak">Long Break (minutes):</label>
            <input
              type="number"
              id="longBreak"
              name="longBreak"
              min="1"
              max="60"
              value={sessionSetting.longBreak}
              onChange={handleSettingChange}
              disabled={isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer; 