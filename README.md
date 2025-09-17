# Collaborative Text Editor

A real-time collaborative text editor built with React.js (frontend) and Node.js (backend). This project demonstrates a complete full-stack application with user sessions, document management, auto-save functionality, and persistent MongoDB storage.

## Features

### Core Features
- **Rich Text Editing**: Powered by Slate.js with formatting toolbar and keyboard shortcuts
- **Real-time Collaboration**: Multiple users can edit documents simultaneously (foundation ready)
- **User Sessions**: Secure session management with auto-expiry
- **Document Management**: Create, read, update, and delete documents
- **Auto-save**: Automatic saving of document changes with debouncing
- **Persistent Storage**: MongoDB database with Docker containerization
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

### Rich Text Features
- **Text Formatting**: Bold, italic, underline, and inline code
- **Block Elements**: Headings, blockquotes, numbered/bulleted lists
- **Keyboard Shortcuts**: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline), Ctrl+` (code)
- **Extensible Editor**: Built on Slate.js framework for future collaboration features

### Security Features
- CORS protection with configurable origins
- Request rate limiting
- Input validation and sanitization
- Helmet.js security headers
- Session-based authentication
- Database user authentication

### Developer Experience
- Hot reload for both frontend and backend
- Comprehensive error handling
- RESTful API design
- Modular backend architecture
- Docker containerization for easy database setup

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **Slate.js**: Rich text editing framework optimized for collaborative editing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Mongoose**: MongoDB object modeling
- **UUID**: Unique identifier generation
- **Express Rate Limit**: API rate limiting
- **Helmet.js**: Security middleware
- **Nodemon**: Development auto-restart

### Database
- **MongoDB 7.0**: Document-based NoSQL database
- **Docker**: Containerized database deployment
- **Mongo Express**: Web-based MongoDB admin interface

## Project Structure

```
collaborative-text-editor/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login.js     # User login/session creation
│   │   │   ├── Dashboard.js # Document list and management
│   │   │   └── TextEditor.js # Main text editing interface
│   │   ├── context/         # React context providers
│   │   │   └── UserContext.js # User session state management
│   │   ├── services/        # API service layer
│   │   │   └── api.js       # Axios configuration and API calls
│   │   └── App.js           # Main application component
│   └── package.json         # Frontend dependencies
├── backend/                  # Node.js backend API
│   ├── controllers/         # Request handlers
│   │   ├── documentController.js # Document CRUD operations
│   │   └── sessionController.js  # Session management
│   ├── models/              # Mongoose data models
│   │   ├── Document.js      # Document schema and model
│   │   └── UserSession.js   # User session schema and model
│   ├── routes/              # API route definitions
│   │   ├── documents.js     # Document endpoints
│   │   └── sessions.js      # Session endpoints
│   ├── config/              # Configuration files
│   │   └── database.js      # MongoDB connection setup
│   ├── middleware/          # Custom middleware
│   │   └── auth.js          # Authentication middleware
│   └── server.js            # Main server file
├── mongo-init/              # MongoDB initialization
│   └── 01-init.js          # Database setup script
├── docker-compose.yml       # Docker container configuration
├── docker-mongo.sh          # MongoDB management script
└── package.json             # Root package.json for scripts
```

## API Endpoints

### Session Management
- `POST /api/sessions` - Create new user session
- `GET /api/sessions/:sessionId` - Get session details
- `PUT /api/sessions/:sessionId/activity` - Update session activity
- `DELETE /api/sessions/:sessionId` - End session

### Document Management
- `GET /api/docs?username=<username>` - Get user's documents
- `POST /api/docs` - Create new document
- `GET /api/docs/:id` - Get specific document
- `PUT /api/docs/:id` - Update document content
- `DELETE /api/docs/:id` - Delete document

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collaborative-text-editor
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   ```

3. **Start MongoDB with Docker**
   ```bash
   # From root directory
   ./docker-mongo.sh start
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   MONGODB_URI=mongodb://editoruser:editorpass123@localhost:27017/collaborative-editor
   ```

5. **Start the application**
   ```bash
   # From root directory - starts both frontend and backend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Health Check: http://localhost:5001/health
   - MongoDB Express: http://localhost:8081 (admin/admin123)

## Docker Management

Use the provided script to manage MongoDB:

```bash
# Start MongoDB containers
./docker-mongo.sh start

# Stop MongoDB containers
./docker-mongo.sh stop

# Restart MongoDB containers
./docker-mongo.sh restart

# View MongoDB logs
./docker-mongo.sh logs

# Check container status
./docker-mongo.sh status

# Open MongoDB shell
./docker-mongo.sh shell

# Clean up containers and volumes
./docker-mongo.sh clean
```

## Database Schema

### Document Model
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  owner: String,
  collaborators: [String],
  createdAt: Date,
  updatedAt: Date,
  lastModifiedBy: String
}
```

### UserSession Model
```javascript
{
  _id: ObjectId,
  sessionId: String (unique),
  username: String,
  isActive: Boolean,
  lastActivity: Date,
  createdAt: Date,
  expiresAt: Date (TTL index)
}
```

## Usage

1. **Create a Session**: Enter a username to create a new session
2. **Create Documents**: Use the dashboard to create new text documents
3. **Edit Documents**: Click on any document to open the text editor
4. **Auto-save**: Changes are automatically saved as you type
5. **Keyboard Shortcuts**: Use Ctrl+S (Cmd+S on Mac) to manually save
6. **Data Persistence**: All data is stored in MongoDB and persists across restarts

## Development

### Available Scripts

- `npm start` - Start both frontend and backend in development mode
- `npm run start-backend` - Start only the backend server
- `npm run start-frontend` - Start only the frontend development server
- `npm run build` - Build the frontend for production

### Key Features for Development

- **Hot Reload**: Both frontend and backend restart automatically on changes
- **Error Handling**: Comprehensive error messages and logging
- **CORS**: Configured for cross-origin requests during development
- **Rate Limiting**: Protects API endpoints from abuse
- **Database Persistence**: Data survives application restarts
- **Docker Integration**: Easy database setup and management

## Production Deployment

### Database Migration
To migrate from in-memory storage to MongoDB:
1. Start MongoDB containers: `./docker-mongo.sh start`
2. Update `.env` file with MongoDB connection string
3. Restart the application: `npm start`

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb://username:password@host:port/database
CORS_ORIGIN=https://yourdomain.com
PORT=5001
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with both in-memory and MongoDB storage
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   ./docker-mongo.sh status
   
   # View MongoDB logs
   ./docker-mongo.sh logs
   ```

2. **Port Conflicts**
   - MongoDB: 27017
   - Mongo Express: 8081
   - Backend: 5001
   - Frontend: 3000

3. **Database Reset**
   ```bash
   # Clean and restart MongoDB
   ./docker-mongo.sh clean
   ./docker-mongo.sh start
   ```

## Future Enhancements

- Real-time synchronization with WebSockets
- User authentication and authorization
- Document versioning and history
- Collaborative cursors and user presence
- Rich text editing capabilities
- Export functionality (PDF, DOCX)
- Cloud deployment with MongoDB Atlas

## License

This project is open source and available under the [MIT License](LICENSE).
