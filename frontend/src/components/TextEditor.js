import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { documentAPI } from '../services/api';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

const TextEditor = ({ document: initialDocument, onBack }) => {
  const { user } = useUser();
  const [currentDoc, setCurrentDoc] = useState(initialDocument);
  const [content, setContent] = useState(initialDocument?.content || '');
  const [title, setTitle] = useState(initialDocument?.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [isLoading, setIsLoading] = useState(false);
  
  const saveTimeoutRef = useRef(null);
  const contentRef = useRef(content);
  const titleRef = useRef(title);

  // Load full document data if content is missing
  useEffect(() => {
    const loadDocument = async () => {
      if (!initialDocument?._id || !user?.username) return;
      
      // If document already has content, no need to fetch
      if (initialDocument.content !== undefined) return;
      
      try {
        setIsLoading(true);
        const response = await documentAPI.getById(initialDocument._id, user.username);
        
        if (response.data.success) {
          const fullDocument = response.data.data;
          setCurrentDoc(fullDocument);
          setContent(fullDocument.content || '');
          setTitle(fullDocument.title || '');
        } else {
          toast.error('Failed to load document');
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast.error('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [initialDocument, user]);

  // Update refs when state changes
  useEffect(() => {
    contentRef.current = content;
    titleRef.current = title;
  }, [content, title]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!currentDoc?._id || !user?.username) return;
    
    const currentContent = contentRef.current;
    const currentTitle = titleRef.current;
    
    // Don't save if there are no changes
    if (currentContent === currentDoc.content && currentTitle === currentDoc.title) {
      return;
    }

    try {
      setSaveStatus('saving');
      setIsSaving(true);
      
      const response = await documentAPI.update(
        currentDoc._id,
        { 
          content: currentContent,
          title: currentTitle
        },
        user.username
      );

      if (response.data.success) {
        setCurrentDoc(response.data.data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
        toast.error('Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('error');
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [currentDoc, user]);

  // Debounced auto-save
  useEffect(() => {
    if (hasUnsavedChanges) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, autoSave]);

  // Manual save
  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    autoSave();
  };

  // Handle content change
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  // Handle title change
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    
    const now = new Date();
    const diffMs = now - lastSaved;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    return lastSaved.toLocaleTimeString();
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (!currentDoc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Document not found
          </h2>
          <button onClick={onBack} className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching document content
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading document...
          </h2>
          <p className="text-gray-600">Please wait while we fetch your document.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              
              <div className="flex items-center">
                <Edit3 className="h-5 w-5 text-primary-600 mr-2" />
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Document title..."
                  maxLength={200}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Save Status */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {getSaveStatusIcon()}
                <span>
                  {saveStatus === 'saving' ? 'Saving...' : 
                   saveStatus === 'error' ? 'Save failed' :
                   hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
                </span>
              </div>
              
              {/* Manual Save Button */}
              <button
                onClick={handleManualSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="btn-primary disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Document Info */}
      <div className="bg-white border-b px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>Owner: {currentDoc.owner}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Last saved: {formatLastSaved()}</span>
              </div>
              
              <div className="flex items-center">
                <Edit3 className="h-4 w-4 mr-1" />
                <span>Last edited by: {currentDoc.lastModifiedBy}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Version: {currentDoc.version}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border h-full">
          <textarea
            value={content}
            onChange={handleContentChange}
            className="w-full h-full min-h-[600px] p-6 border-none outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="Start typing your document content here..."
            spellCheck="true"
          />
        </div>
      </main>

      {/* Footer with shortcuts */}
      <footer className="bg-white border-t px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span>
              Auto-save enabled • Press Ctrl+S (Cmd+S) to save manually
            </span>
            <span>
              Words: {content.split(/\s+/).filter(word => word.length > 0).length} • 
              Characters: {content.length}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TextEditor;
