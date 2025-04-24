import React, { useState, useEffect } from 'react';
import './EisenhowerMatrix.css';
import { getTasks, createTask, updateTask, deleteTask } from '../../utils/api';

function EisenhowerMatrix() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ text: '', quadrant: 'urgentImportant' });

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
      setNewTask({ text: '', quadrant: 'urgentImportant' });
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

  const quadrants = {
    urgentImportant: 'Urgent & Important',
    notUrgentImportant: 'Not Urgent & Important',
    urgentNotImportant: 'Urgent & Not Important',
    notUrgentNotImportant: 'Not Urgent & Not Important'
  };

  return (
    <div className="eisenhower-matrix">
      <h2>Eisenhower Matrix</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          value={newTask.text}
          onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
          placeholder="New task"
          required
        />
        <select
          value={newTask.quadrant}
          onChange={(e) => setNewTask({ ...newTask, quadrant: e.target.value })}
        >
          {Object.entries(quadrants).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button type="submit">Add Task</button>
      </form>
      <div className="matrix-grid">
        {Object.entries(quadrants).map(([key, label]) => (
          <div key={key} className="quadrant">
            <h3>{label}</h3>
            <div className="tasks">
              {tasks
                .filter(task => task.quadrant === key)
                .map(task => (
                  <div key={task.id} className="task">
                    <span>{task.text}</span>
                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EisenhowerMatrix; 