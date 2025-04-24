import React, { useState, useEffect } from 'react';
import './DailyTaskList.css';
import { getTasks, createTask, updateTask, deleteTask } from '../../utils/api';

function DailyTaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    status: 'pending'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(4); // Default daily Pomodoro goal

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(newTask);
      setNewTask({
        title: '',
        description: '',
        estimatedPomodoros: 1,
        completedPomodoros: 0,
        status: 'pending'
      });
      setShowAddForm(false);
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handlePomodoroComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          completedPomodoros: task.completedPomodoros + 1,
          status: task.completedPomodoros + 1 >= task.estimatedPomodoros ? 'completed' : 'in-progress'
        };
        await updateTask(taskId, updatedTask);
        loadTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getProgressPercentage = (task) => {
    return (task.completedPomodoros / task.estimatedPomodoros) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="daily-task-list">
      <div className="task-list-header">
        <div className="header-left">
          <h3>Today's Tasks</h3>
          <div className="daily-goal">
            <label>Daily Pomodoro Goal:</label>
            <input
              type="number"
              min="1"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value))}
            />
          </div>
        </div>
        <button 
          className="add-task-button"
          onClick={() => setShowAddForm(true)}
        >
          + Add Task
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-task-form">
          <div className="form-group">
            <label>Task Title:</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Estimated Pomodoros:</label>
            <input
              type="number"
              min="1"
              value={newTask.estimatedPomodoros}
              onChange={(e) => setNewTask({ ...newTask, estimatedPomodoros: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit">Add Task</button>
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="task-list-content">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div className="task-header">
              <div className="task-title">
                <h4>{task.title}</h4>
                <span className="task-status" style={{ backgroundColor: getStatusColor(task.status) }}>
                  {task.status}
                </span>
              </div>
              <div className="task-actions">
                <button 
                  className="pomodoro-button"
                  onClick={() => handlePomodoroComplete(task.id)}
                  disabled={task.status === 'completed'}
                >
                  Complete Pomodoro
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${getProgressPercentage(task)}%` }}
                />
              </div>
              <div className="progress-text">
                {task.completedPomodoros} / {task.estimatedPomodoros} Pomodoros
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DailyTaskList; 