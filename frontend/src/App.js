import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserProvider, useUser } from './context/UserContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TextEditor from './components/TextEditor';
import './index.css';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useUser();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'editor'
  const [currentDocument, setCurrentDocument] = useState(null);

  const handleSelectDocument = (document) => {
    setCurrentDocument(document);
    setCurrentView('editor');
  };

  const handleCreateDocument = (document) => {
    setCurrentDocument(document);
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentDocument(null);
    setCurrentView('dashboard');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show main app based on current view
  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' ? (
        <Dashboard
          onSelectDocument={handleSelectDocument}
          onCreateDocument={handleCreateDocument}
        />
      ) : (
        <TextEditor
          document={currentDocument}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <UserProvider>
        <div className="App">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </UserProvider>
    </Router>
  );
};

export default App;
