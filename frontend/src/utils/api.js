// API utility functions for backend communication

// Use relative URL in production, full URL in development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

// Initialize mock data from localStorage or use defaults
const initializeLocalStorage = () => {
  if (!localStorage.getItem('mockTimeBlocks')) {
    localStorage.setItem('mockTimeBlocks', JSON.stringify([
      {
        id: '1',
        title: 'Project Meeting',
        description: 'Discuss project timeline and milestones',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:30',
        category: 'work',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Study Session',
        description: 'Review course materials for upcoming exam',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '16:00',
        category: 'academic',
        priority: 'high'
      },
      {
        id: '3',
        title: 'Exercise',
        description: 'Go for a run in the park',
        date: new Date().toISOString().split('T')[0],
        startTime: '17:30',
        endTime: '18:30',
        category: 'personal',
        priority: 'medium'
      }
    ]));
  }

  if (!localStorage.getItem('mockRecurringTasks')) {
    localStorage.setItem('mockRecurringTasks', JSON.stringify([
      {
        id: '1',
        title: 'Team Standup',
        description: 'Daily team meeting to discuss progress',
        frequency: 'daily',
        category: 'work',
        priority: 'high',
        completed: false,
        nextDueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Weekly Report',
        description: 'Submit weekly progress report',
        frequency: 'weekly',
        category: 'work',
        priority: 'medium',
        completed: false,
        nextDueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Pay Bills',
        description: 'Pay monthly bills and subscriptions',
        frequency: 'monthly',
        category: 'personal',
        priority: 'high',
        completed: false,
        nextDueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ]));
  }
};

// Call once to initialize
initializeLocalStorage();

// Helper functions to interact with localStorage
const getLocalTimeBlocks = () => {
  return JSON.parse(localStorage.getItem('timeBlocks') || '[]');
};

const setLocalTimeBlocks = (blocks) => {
  localStorage.setItem('timeBlocks', JSON.stringify(blocks));
  return blocks;
};

const getLocalRecurringTasks = () => {
  return JSON.parse(localStorage.getItem('recurringTasks') || '[]');
};

const setLocalRecurringTasks = (tasks) => {
  localStorage.setItem('recurringTasks', JSON.stringify(tasks));
  return tasks;
};

// Time Block API calls
export const getTimeBlocks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/timeblocks`);
    if (!response.ok) {
      throw new Error('Failed to fetch time blocks');
    }
    const data = await response.json();
    // Update localStorage with the latest data
    setLocalTimeBlocks(data);
    return data;
  } catch (error) {
    console.error('Error fetching time blocks:', error);
    // Return data from localStorage
    return getLocalTimeBlocks();
  }
};

export const createTimeBlock = async (timeBlock) => {
  try {
    const response = await fetch(`${API_BASE_URL}/timeblocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeBlock),
    });
    if (!response.ok) {
      throw new Error('Failed to create time block');
    }
    const data = await response.json();
    // Update localStorage
    const blocks = getLocalTimeBlocks();
    blocks.push(data);
    setLocalTimeBlocks(blocks);
    return data;
  } catch (error) {
    console.error('Error creating time block:', error);
    // Save to localStorage with a temporary ID
    const blocks = getLocalTimeBlocks();
    const localBlock = {
      ...timeBlock,
      id: Date.now().toString(),
    };
    blocks.push(localBlock);
    setLocalTimeBlocks(blocks);
    return localBlock;
  }
};

export const updateTimeBlock = async (timeBlock) => {
  try {
    const response = await fetch(`${API_BASE_URL}/timeblocks/${timeBlock.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeBlock),
    });
    if (!response.ok) {
      throw new Error('Failed to update time block');
    }
    const data = await response.json();
    // Update localStorage
    const blocks = getLocalTimeBlocks();
    const index = blocks.findIndex(block => block.id === timeBlock.id);
    if (index !== -1) {
      blocks[index] = data;
      setLocalTimeBlocks(blocks);
    }
    return data;
  } catch (error) {
    console.error('Error updating time block:', error);
    // Update in localStorage
    const blocks = getLocalTimeBlocks();
    const index = blocks.findIndex(block => block.id === timeBlock.id);
    if (index !== -1) {
      blocks[index] = timeBlock;
      setLocalTimeBlocks(blocks);
      return timeBlock;
    }
    return null;
  }
};

export const deleteTimeBlock = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/timeblocks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete time block');
    }
    // Update localStorage
    const blocks = getLocalTimeBlocks();
    const updatedBlocks = blocks.filter(block => block.id !== id);
    setLocalTimeBlocks(updatedBlocks);
    return true;
  } catch (error) {
    console.error('Error deleting time block:', error);
    // Delete from localStorage
    const blocks = getLocalTimeBlocks();
    const updatedBlocks = blocks.filter(block => block.id !== id);
    setLocalTimeBlocks(updatedBlocks);
    return true;
  }
};

// Task API calls (using Fetch API instead of axios for consistency)
export const getTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const createTask = async (task) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};

export const updateTask = async (id, task) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting task:', error);
    return null;
  }
};

// Pomodoro Session API calls
export const getPomodoroSessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pomodoro-sessions`);
    if (!response.ok) {
      throw new Error('Failed to fetch pomodoro sessions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    return [];
  }
};

export const createPomodoroSession = async (session) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pomodoro-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });
    if (!response.ok) {
      throw new Error('Failed to create pomodoro session');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating pomodoro session:', error);
    return null;
  }
};

// Recurring Tasks API
export const getRecurringTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recurring-tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch recurring tasks');
    }
    const data = await response.json();
    // Update localStorage with the latest data
    setLocalRecurringTasks(data);
    return data;
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    // Return data from localStorage
    return getLocalRecurringTasks();
  }
};

export const createRecurringTask = async (task) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recurring-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to create recurring task');
    }
    const data = await response.json();
    // Update localStorage
    const tasks = getLocalRecurringTasks();
    tasks.push(data);
    setLocalRecurringTasks(tasks);
    return data;
  } catch (error) {
    console.error('Error creating recurring task:', error);
    // Save to localStorage
    const tasks = getLocalRecurringTasks();
    const localTask = {
      ...task,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(localTask);
    setLocalRecurringTasks(tasks);
    return localTask;
  }
};

export const updateRecurringTask = async (task) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recurring-tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to update recurring task');
    }
    const data = await response.json();
    // Update localStorage
    const tasks = getLocalRecurringTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks[index] = data;
      setLocalRecurringTasks(tasks);
    }
    return data;
  } catch (error) {
    console.error('Error updating recurring task:', error);
    // Update in localStorage
    const tasks = getLocalRecurringTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
      setLocalRecurringTasks(tasks);
      return task;
    }
    return null;
  }
};

export const deleteRecurringTask = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recurring-tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete recurring task');
    }
    // Update localStorage
    const tasks = getLocalRecurringTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    setLocalRecurringTasks(updatedTasks);
    return true;
  } catch (error) {
    console.error('Error deleting recurring task:', error);
    // Delete from localStorage
    const tasks = getLocalRecurringTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    setLocalRecurringTasks(updatedTasks);
    return true;
  }
}; 