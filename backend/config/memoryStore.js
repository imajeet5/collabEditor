// Simple in-memory data store for demonstration
// In production, this would be replaced with MongoDB

let documents = [];
let sessions = [];
let nextDocId = 1;

// Generate simple ID
const generateId = () => {
  return (nextDocId++).toString();
};

// Documents store
const documentsStore = {
  create: (data) => {
    const doc = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
    documents.push(doc);
    return doc;
  },

  findByOwnerOrCollaborator: (username) => {
    return documents.filter(doc => 
      doc.owner === username || 
      (doc.collaborators && doc.collaborators.includes(username))
    ).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
  },

  findById: (id) => {
    return documents.find(doc => doc._id === id);
  },

  updateById: (id, updates) => {
    const docIndex = documents.findIndex(doc => doc._id === id);
    if (docIndex === -1) return null;
    
    documents[docIndex] = {
      ...documents[docIndex],
      ...updates,
      lastModified: new Date(),
      version: documents[docIndex].version + 1
    };
    return documents[docIndex];
  },

  deleteById: (id) => {
    const docIndex = documents.findIndex(doc => doc._id === id);
    if (docIndex === -1) return false;
    
    documents.splice(docIndex, 1);
    return true;
  }
};

// Sessions store
const sessionsStore = {
  create: (data) => {
    const session = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    sessions.push(session);
    return session;
  },

  findByUsername: (username) => {
    return sessions.find(session => 
      session.username === username && session.isActive
    );
  },

  findBySessionId: (sessionId) => {
    return sessions.find(session => 
      session.sessionId === sessionId && session.isActive
    );
  },

  updateBySessionId: (sessionId, updates) => {
    const sessionIndex = sessions.findIndex(session => session.sessionId === sessionId);
    if (sessionIndex === -1) return null;
    
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date()
    };
    return sessions[sessionIndex];
  },

  deleteBySessionId: (sessionId) => {
    const sessionIndex = sessions.findIndex(session => session.sessionId === sessionId);
    if (sessionIndex === -1) return false;
    
    sessions[sessionIndex].isActive = false;
    return true;
  }
};

module.exports = {
  documentsStore,
  sessionsStore
};
