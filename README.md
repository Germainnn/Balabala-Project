# Time Management Application

A comprehensive time management application featuring time blocking, recurring tasks, a Pomodoro timer, and more.

## Features

- **Time Blocking Calendar**: Schedule your day with customizable time blocks
  - Day, week, and month views
  - Color-coded categories and priorities
  - Select specific time ranges for precise scheduling

- **Recurring Tasks**: Set up repeating tasks to maintain regular routines
  - Daily, weekly, or monthly repetition
  - Task completion tracking
  - Category and priority organization

- **Pomodoro Timer**: Stay focused with the proven Pomodoro technique
  - Customizable work and break intervals
  - Session tracking and statistics

- **User Authentication**:
  - Secure signup and login process
  - Password encryption
  - JWT-based authentication
  - Private user data

## Local Development

1. Clone the repository
   ```
   git clone <repository-url>
   cd time-blocking-app
   ```

2. Install dependencies
   ```
   cd frontend
   npm install
   cd ../time-blocking-backend
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with:
   ```
   JWT_SECRET=your_secure_jwt_secret
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the development servers
   ```
   # In time-blocking-backend directory
   npm run dev
   
   # In frontend directory (in a new terminal)
   npm start
   ```

## Deploying to Vercel

This application is designed to be easily deployed on Vercel with MongoDB Atlas as the database.

### Prerequisites

1. Create a [Vercel account](https://vercel.com/signup)
2. Create a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)
3. Install the [Vercel CLI](https://vercel.com/download)
   ```
   npm i -g vercel
   ```

### Setup MongoDB Atlas

1. Create a new cluster (the free tier is sufficient)
2. Create a database user with read/write permissions
3. Add your IP address to the IP whitelist or allow access from anywhere
4. Get your MongoDB connection string:
   - Go to "Connect" > "Connect your application"
   - Select "Node.js" as your driver
   - Copy the connection string (it looks like `mongodb+srv://username:password@cluster.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)

### Configure Vercel Environment Variables

1. Log in to Vercel CLI
   ```
   vercel login
   ```

2. Add your environment variables as secrets
   ```
   vercel secrets add mongodb_uri "your-mongodb-connection-string"
   vercel secrets add jwt_secret "your-secure-jwt-secret"
   ```

### Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Connect your repository in the Vercel dashboard:
   - Click "Import Project"
   - Select your repository
   - Configure project settings (the default settings should work with this project structure)

3. Deploy from the command line:
   ```
   vercel
   ```

4. To deploy to production:
   ```
   vercel --prod
   ```

## Project Structure

```
/
├── api/                    # Serverless API functions
│   ├── timeblocks.js       # Time blocks API endpoints
│   ├── recurring-tasks.js  # Recurring tasks API endpoints
│   └── auth.js             # Authentication endpoints
├── time-blocking-backend/  # Express backend server
│   ├── index.js            # Server setup and routes
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend application
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   │   ├── Auth/       # Authentication components
│   │   │   └── ...         # Other components
│   │   ├── utils/          # Utility functions
│   │   └── ...
│   └── package.json        # Frontend dependencies
└── vercel.json             # Vercel configuration
```

## Security Features

This application implements several security best practices:

1. **Password Security**: Uses bcrypt for secure password hashing
2. **JWT Authentication**: Tokens expire after 7 days
3. **Private User Data**: Each user can only access their own data
4. **Input Validation**: Server-side validation on all inputs

## Offline Support

This application includes localStorage fallback support, which means:

1. Data is automatically saved to your browser's local storage when offline
2. When the application reconnects to the internet, it will attempt to sync with the server
3. You can continue using the app even without an internet connection

## Technical Details

- Frontend: React.js
- API: Serverless functions (Node.js)
- Database: MongoDB Atlas
- Authentication: JWT
- Hosting: Vercel
"# redeploy trigger" 
