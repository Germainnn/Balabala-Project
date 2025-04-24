const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration - Using SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'), // SQLite file will be created in the root directory
  logging: console.log
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

// Define models
// User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const TimeBlock = sequelize.define('TimeBlock', {
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'academic'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  quadrant: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'urgentImportant'
  },
  projectCategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

const Task = sequelize.define('Task', {
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quadrant: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'urgentImportant'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

const PomodoroSession = sequelize.define('PomodoroSession', {
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pomodoro'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

// Define relationships
User.hasMany(TimeBlock);
TimeBlock.belongsTo(User);

User.hasMany(Task);
Task.belongsTo(User);

User.hasMany(PomodoroSession);
PomodoroSession.belongsTo(User);

// Sync all models with the database
sequelize.sync()
  .then(() => console.log('Database synced successfully'))
  .catch(err => console.error('Error syncing database:', err));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Authentication token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Define routes
const apiRouter = express.Router();

// Health check route
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Authentication routes
apiRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Sequelize.Op.or]: [{ username }, { email }] 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user', error: error.message });
  }
});

apiRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ 
      where: { username } 
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
});

apiRouter.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// TimeBlock routes
apiRouter.get('/timeblocks', authenticateToken, async (req, res) => {
  try {
    const timeBlocks = await TimeBlock.findAll({
      where: { userId: req.user.id }
    });
    res.json(timeBlocks);
  } catch (error) {
    console.error('Error fetching time blocks:', error);
    res.status(500).json({ error: 'Failed to fetch time blocks' });
  }
});

apiRouter.post('/timeblocks', authenticateToken, async (req, res) => {
  try {
    const timeBlock = await TimeBlock.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(timeBlock);
  } catch (error) {
    console.error('Error creating time block:', error);
    res.status(500).json({ error: 'Failed to create time block' });
  }
});

apiRouter.put('/timeblocks/:id', authenticateToken, async (req, res) => {
  try {
    const timeBlock = await TimeBlock.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!timeBlock) {
      return res.status(404).json({ error: 'Time block not found or not authorized' });
    }
    
    const updated = await TimeBlock.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });
    
    const updatedTimeBlock = await TimeBlock.findByPk(req.params.id);
    res.json(updatedTimeBlock);
  } catch (error) {
    console.error('Error updating time block:', error);
    res.status(500).json({ error: 'Failed to update time block' });
  }
});

apiRouter.delete('/timeblocks/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await TimeBlock.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ error: 'Time block not found or not authorized' });
    }
    res.json({ message: 'Time block deleted successfully' });
  } catch (error) {
    console.error('Error deleting time block:', error);
    res.status(500).json({ error: 'Failed to delete time block' });
  }
});

// Task routes
apiRouter.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

apiRouter.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

apiRouter.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }
    
    const updated = await Task.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });
    
    const updatedTask = await Task.findByPk(req.params.id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

apiRouter.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Task.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Pomodoro session routes
apiRouter.get('/pomodoro-sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await PomodoroSession.findAll({
      where: { userId: req.user.id }
    });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    res.status(500).json({ error: 'Failed to fetch pomodoro sessions' });
  }
});

apiRouter.post('/pomodoro-sessions', authenticateToken, async (req, res) => {
  try {
    const session = await PomodoroSession.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating pomodoro session:', error);
    res.status(500).json({ error: 'Failed to create pomodoro session' });
  }
});

// Mount API routes
app.use('/api', apiRouter);

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
