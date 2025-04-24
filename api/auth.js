// Serverless API endpoint for authentication
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Connection string for MongoDB Atlas
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'time-management-app';
const collectionName = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to connect to MongoDB
async function connectToDatabase() {
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  return {
    client,
    db: client.db(dbName),
    collection: client.db(dbName).collection(collectionName)
  };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let { client, collection } = await connectToDatabase();

  try {
    // Route handling
    const { action } = req.query;

    switch (action) {
      case 'signup':
        await handleSignup(req, res, collection);
        break;
      case 'login':
        await handleLogin(req, res, collection);
        break;
      case 'verify':
        await handleVerify(req, res);
        break;
      default:
        res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    // Close the database connection
    await client.close();
  }
}

// Handle user signup
async function handleSignup(req, res, collection) {
  const { email, password, name } = req.body;
  
  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }
  
  // Check if user already exists
  const existingUser = await collection.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create new user
  const newUser = {
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString()
  };
  
  const result = await collection.insertOne(newUser);
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: result.insertedId, email, name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Return user data (excluding password) and token
  res.status(201).json({
    message: 'User created successfully',
    token,
    user: {
      id: result.insertedId,
      email,
      name
    }
  });
}

// Handle user login
async function handleLogin(req, res, collection) {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Find user
  const user = await collection.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Return user data and token
  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name
    }
  });
}

// Verify token and get user info
async function handleVerify(req, res) {
  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Return user info
    res.status(200).json({
      message: 'Token is valid',
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
} 