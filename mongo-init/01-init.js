// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('collaborative-editor');

// Create a user for the application
db.createUser({
  user: 'editoruser',
  pwd: 'editorpass123',
  roles: [
    {
      role: 'readWrite',
      db: 'collaborative-editor'
    }
  ]
});

// Create collections with indexes for better performance
db.createCollection('documents');
db.createCollection('usersessions');

// Create indexes for documents collection
db.documents.createIndex({ "owner": 1, "createdAt": -1 });
db.documents.createIndex({ "collaborators": 1 });
db.documents.createIndex({ "title": "text", "content": "text" });

// Create indexes for user sessions collection
db.usersessions.createIndex({ "username": 1 });
db.usersessions.createIndex({ "sessionId": 1 }, { unique: true });
db.usersessions.createIndex({ "lastActivity": 1 }, { expireAfterSeconds: 86400 }); // TTL index

print("Database initialization completed successfully!");
