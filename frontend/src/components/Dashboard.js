import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { documentAPI } from '../services/api';
import { 
  FileText, 
  Plus, 
  LogOut, 
  Calendar, 
  User, 
  Edit3,
  Trash2,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = ({ onSelectDocument, onCreateDocument }) => {
  const { user, logout } = useUser();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDocuments = async () => {
    if (!user?.username) return;
    
    try {
      setIsLoading(true);
      const response = await documentAPI.getAll(user.username);
      
      if (response.data.success) {
        setDocuments(response.data.data);
      } else {
        toast.error('Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    
    if (!newDocTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    try {
      setIsCreating(true);
      const response = await documentAPI.create(
        newDocTitle.trim(),
        '',
        user.username
      );
      
      if (response.data.success) {
        toast.success('Document created successfully');
        setNewDocTitle('');
        setShowCreateForm(false);
        await loadDocuments();
        
        // Auto-open the new document
        if (onCreateDocument) {
          onCreateDocument(response.data.data);
        }
      } else {
        toast.error('Failed to create document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await documentAPI.delete(docId, user.username);
      
      if (response.data.success) {
        toast.success('Document deleted successfully');
        await loadDocuments();
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Collaborative Editor
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.username}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Document Section */}
        <div className="mb-8">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Document
            </button>
          ) : (
            <form onSubmit={handleCreateDocument} className="card max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Document
              </h3>
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter document title"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  disabled={isCreating}
                  maxLength={200}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isCreating || !newDocTitle.trim()}
                  className="btn-primary flex items-center"
                >
                  {isCreating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewDocTitle('');
                  }}
                  className="btn-secondary"
                  disabled={isCreating}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Documents List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Your Documents ({documents.length})
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first document to get started with collaborative editing.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <div key={doc._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {doc.title}
                    </h3>
                    
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Open document"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      
                      {doc.owner === user?.username && (
                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>Owner: {doc.owner}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Modified: {formatDate(doc.lastModified)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Edit3 className="h-4 w-4 mr-2" />
                      <span>Last edited by: {doc.lastModifiedBy}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Open Document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
