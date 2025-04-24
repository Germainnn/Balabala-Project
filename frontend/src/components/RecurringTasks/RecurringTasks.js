import React, { useState, useEffect } from 'react';
import './RecurringTasks.css';
import { getRecurringTasks, createRecurringTask, updateRecurringTask, deleteRecurringTask } from '../../utils/api';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];

const RecurringTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    category: 'academic',
    priority: 'medium',
    nextDueDate: new Date().toISOString().split('T')[0]
  });
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const categories = {
    academic: { label: 'Academic', color: '#4285F4' },
    personal: { label: 'Personal', color: '#0F9D58' },
    work: { label: 'Work', color: '#DB4437' },
    project: { label: 'Project', color: '#F4B400' }
  };

  const priorities = {
    high: { label: 'High Priority', color: '#ff4444' },
    medium: { label: 'Medium Priority', color: '#ffbb33' },
    low: { label: 'Low Priority', color: '#00c851' }
  };

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' }
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const recurringTasks = await getRecurringTasks();
      setTasks(recurringTasks);
    } catch (error) {
      console.error('Error loading recurring tasks:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRecurringTask(newTask);
      setNewTask({
        title: '',
        description: '',
        frequency: 'daily',
        category: 'academic',
        priority: 'medium',
        nextDueDate: new Date().toISOString().split('T')[0]
      });
      setIsAddFormVisible(false);
      loadTasks();
    } catch (error) {
      console.error('Error creating recurring task:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecurringTask(id);
      loadTasks();
    } catch (error) {
      console.error('Error deleting recurring task:', error);
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateRecurringTask(updatedTask);
      loadTasks();
    } catch (error) {
      console.error('Error updating recurring task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => 
    filterCategory === 'all' || task.category === filterCategory
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.nextDueDate) - new Date(b.nextDueDate);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const calculateNextDueDate = (task) => {
    const dueDate = new Date(task.nextDueDate);
    const today = new Date();
    
    if (dueDate < today) {
      const newDate = new Date(today);
      
      if (task.frequency === 'daily') {
        return formatDate(newDate);
      } else if (task.frequency === 'weekly') {
        newDate.setDate(newDate.getDate() + (7 - newDate.getDay() + dueDate.getDay()) % 7);
        return formatDate(newDate);
      } else if (task.frequency === 'monthly') {
        newDate.setDate(dueDate.getDate());
        if (newDate < today) {
          newDate.setMonth(newDate.getMonth() + 1);
        }
        return formatDate(newDate);
      }
    }
    
    return formatDate(dueDate);
  };

  return (
    <div className="recurring-tasks-container">
      <div className="tasks-header">
        <h2>Recurring Tasks</h2>
        <div className="task-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {Object.entries(categories).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="category">Category</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
        <button 
          className="add-task-button"
          onClick={() => setIsAddFormVisible(true)}
        >
          Add Recurring Task
        </button>
      </div>

      {sortedTasks.length > 0 ? (
        <div className="tasks-list">
          {sortedTasks.map(task => (
            <div 
              key={task.id} 
              className={`task-card ${task.completed ? 'completed' : ''}`}
              style={{ borderLeft: `4px solid ${priorities[task.priority].color}` }}
            >
              <div className="task-header">
                <div className="task-title-container">
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => toggleTaskCompletion(task)}
                  />
                  <h3 className="task-title">{task.title}</h3>
                </div>
                <div className="task-category" style={{ backgroundColor: categories[task.category].color }}>
                  {categories[task.category].label}
                </div>
              </div>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              <div className="task-footer">
                <div className="task-meta">
                  <span className="task-frequency">
                    {frequencies.find(f => f.value === task.frequency)?.label || 'Custom'}
                  </span>
                  <span className="task-due-date">
                    Next: {calculateNextDueDate(task)}
                  </span>
                </div>
                <button 
                  className="delete-task-button"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-tasks-message">
          <p>No recurring tasks found. Add one to get started!</p>
        </div>
      )}

      {isAddFormVisible && (
        <div className="add-task-form-overlay">
          <div className="add-task-form">
            <h3>Add New Recurring Task</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    name="category"
                    value={newTask.category}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.entries(categories).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    name="priority"
                    value={newTask.priority}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.entries(priorities).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select 
                    name="frequency"
                    value={newTask.frequency}
                    onChange={handleInputChange}
                    required
                  >
                    {frequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="nextDueDate"
                    value={newTask.nextDueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit">Save Task</button>
                <button 
                  type="button"
                  onClick={() => setIsAddFormVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTasks; 