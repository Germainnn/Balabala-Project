// Serverless API endpoint for time blocks
import { MongoClient, ObjectId } from 'mongodb';

// Connection string for MongoDB Atlas (replace with your actual connection string)
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'time-management-app';
const collectionName = 'timeblocks';

// Helper function to connect to MongoDB
async function connectToDatabase() {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Database name:', dbName);
    console.log('URI format check:', uri.startsWith('mongodb+srv://') ? 'Valid MongoDB Atlas URI' : 'Invalid URI format');
    
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Successfully connected to MongoDB');
    
    return {
      client,
      db: client.db(dbName),
      collection: client.db(dbName).collection(collectionName)
    };
  } catch (error) {
    console.error('MongoDB connection error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
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

  let client;
  try {
    const { client: dbClient, collection } = await connectToDatabase();
    client = dbClient;

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get a single time block
          const timeBlock = await collection.findOne({ 
            _id: new ObjectId(req.query.id) 
          });
          
          if (!timeBlock) {
            res.status(404).json({ message: 'Time block not found' });
            return;
          }
          
          res.status(200).json({ 
            ...timeBlock, 
            id: timeBlock._id 
          });
        } else {
          // Get all time blocks
          const timeBlocks = await collection.find({}).toArray();
          res.status(200).json(
            timeBlocks.map(block => ({
              ...block,
              id: block._id
            }))
          );
        }
        break;
        
      case 'POST':
        // Create a new time block
        const newBlock = req.body;
        const result = await collection.insertOne(newBlock);
        res.status(201).json({ 
          ...newBlock, 
          id: result.insertedId 
        });
        break;
        
      case 'PUT':
        // Update a time block
        const { id, ...updateData } = req.body;
        
        if (!id) {
          res.status(400).json({ message: 'ID is required for updates' });
          return;
        }
        
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (updateResult.matchedCount === 0) {
          res.status(404).json({ message: 'Time block not found' });
          return;
        }
        
        res.status(200).json({ id, ...updateData });
        break;
        
      case 'DELETE':
        // Delete a time block
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          res.status(400).json({ message: 'ID is required for deletion' });
          return;
        }
        
        const deleteResult = await collection.deleteOne({
          _id: new ObjectId(deleteId)
        });
        
        if (deleteResult.deletedCount === 0) {
          res.status(404).json({ message: 'Time block not found' });
          return;
        }
        
        res.status(200).json({ message: 'Time block deleted successfully' });
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling request:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Send more detailed error response
    res.status(500).json({ 
      message: 'Internal Server Error',
      error: {
        name: error.name,
        message: error.message,
        code: error.code
      }
    });
  } finally {
    // Close the database connection
    if (client) {
      await client.close();
    }
  }
} 