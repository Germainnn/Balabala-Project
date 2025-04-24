import React, { useState, useEffect } from 'react';
import './MonthlyBoard.css';

const STATUSES = ['Not Started', 'In Progress', 'Completed'];

function MonthlyBoard() {
  const [projects, setProjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not Started',
    tasks: []
  });

  useEffect(() => {
    // TODO: Load projects from API
    const mockProjects = [
      {
        id: 1,
        title: 'Website Redesign',
        description: 'Redesign company website with modern UI',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        status: 'In Progress',
        tasks: [
          { id: 1, title: 'Design mockups', status: 'Completed' },
          { id: 2, title: 'Frontend development', status: 'In Progress' },
          { id: 3, title: 'Backend integration', status: 'Not Started' }
        ]
      },
      {
        id: 2,
        title: 'Mobile App Launch',
        description: 'Launch new mobile app version',
        startDate: '2024-03-15',
        endDate: '2024-04-15',
        status: 'Not Started',
        tasks: [
          { id: 1, title: 'Beta testing', status: 'Not Started' },
          { id: 2, title: 'Marketing materials', status: 'Not Started' }
        ]
      }
    ];
    setProjects(mockProjects);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const project = {
      id: Date.now(),
      ...newProject,
      tasks: []
    };
    setProjects([...projects, project]);
    setNewProject({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Not Started',
      tasks: []
    });
    setShowAddForm(false);
  };

  const addTask = (projectId) => {
    const taskTitle = prompt('Enter task title:');
    if (taskTitle) {
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: [
              ...project.tasks,
              {
                id: Date.now(),
                title: taskTitle,
                status: 'Not Started'
              }
            ]
          };
        }
        return project;
      }));
    }
  };

  const updateTaskStatus = (projectId, taskId, newStatus) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, status: newStatus };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const updateProjectStatus = (projectId, newStatus) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return { ...project, status: newStatus };
      }
      return project;
    }));
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'var(--status-completed)';
      case 'in progress':
        return 'var(--status-in-progress)';
      default:
        return 'var(--status-not-started)';
    }
  };

  const calculateProgress = (tasks) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="monthly-board-container">
      <div className="board-header">
        <div className="header-left">
          <h3>Monthly Projects</h3>
          <div className="project-count">
            {projects.length} projects
          </div>
        </div>
        <button 
          className="button-primary"
          onClick={() => setShowAddForm(true)}
        >
          + Add Project
        </button>
      </div>

      {showAddForm && (
        <div className="add-project-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="button-primary">Create Project</button>
              <button 
                type="button" 
                className="button-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-card-header">
              <div className="project-title">
                <h4>{project.title}</h4>
                <select
                  value={project.status}
                  onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                  className="status-select"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <button 
                className="delete-button"
                onClick={() => deleteProject(project.id)}
              >
                ×
              </button>
            </div>

            <p className="project-description">{project.description}</p>

            <div className="project-dates">
              <div className="date-item">
                <span className="date-label">Start:</span>
                <span className="date-value">{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div className="date-item">
                <span className="date-label">End:</span>
                <span className="date-value">{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <h5>Progress</h5>
                <span className="progress-percentage">{calculateProgress(project.tasks)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${calculateProgress(project.tasks)}%` }}
                />
              </div>
            </div>

            <div className="tasks-section">
              <div className="tasks-header">
                <h5>Tasks</h5>
                <button 
                  className="button-secondary small"
                  onClick={() => addTask(project.id)}
                >
                  + Add Task
                </button>
              </div>
              <div className="tasks-list">
                {project.tasks.map(task => (
                  <div key={task.id} className="task-item">
                    <span className="task-title">{task.title}</span>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(project.id, task.id, e.target.value)}
                      className="status-select small"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthlyBoard; 