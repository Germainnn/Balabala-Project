// Serverless API endpoint for recurring tasks
import { MongoClient, ObjectId } from 'mongodb';

// Connection string for MongoDB Atlas (replace with your actual connection string)
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'time-management-app';
const collectionName = 'recurringTasks';

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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let { client, collection } = await connectToDatabase();

  try {
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get a single recurring task
          const task = await collection.findOne({ 
            _id: new ObjectId(req.query.id) 
          });
          
          if (!task) {
            res.status(404).json({ message: 'Recurring task not found' });
            return;
          }
          
          res.status(200).json({ 
            ...task, 
            id: task._id 
          });
        } else {
          // Get all recurring tasks
          const tasks = await collection.find({}).toArray();
          res.status(200).json(
            tasks.map(task => ({
              ...task,
              id: task._id
            }))
          );
        }
        break;
        
      case 'POST':
        // Create a new recurring task
        const newTask = {
          ...req.body,
          createdAt: new Date().toISOString(),
          completed: false
        };
        
        const result = await collection.insertOne(newTask);
        res.status(201).json({ 
          ...newTask, 
          id: result.insertedId 
        });
        break;
        
      case 'PUT':
        // Update a recurring task
        const { id, ...updateData } = req.body;
        
        if (!id) {
          res.status(400).json({ message: 'ID is required for updates' });
          return;
        }
        
        // Add last modified date
        updateData.lastModified = new Date().toISOString();
        
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (updateResult.matchedCount === 0) {
          res.status(404).json({ message: 'Recurring task not found' });
          return;
        }
        
        res.status(200).json({ id, ...updateData });
        break;
        
      case 'DELETE':
        // Delete a recurring task
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          res.status(400).json({ message: 'ID is required for deletion' });
          return;
        }
        
        const deleteResult = await collection.deleteOne({
          _id: new ObjectId(deleteId)
        });
        
        if (deleteResult.deletedCount === 0) {
          res.status(404).json({ message: 'Recurring task not found' });
          return;
        }
        
        res.status(200).json({ message: 'Recurring task deleted successfully' });
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    // Close the database connection
    await client.close();
  }
} 