import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { User, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      alert('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (username.length < 2 || username.length > 50) {
      alert('Username must be between 2 and 50 characters');
      return;
    }

    setIsSubmitting(true);
    await login(username.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Collaborative Text Editor
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter a username to start collaborating
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="input-field"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || isSubmitting}
                minLength={2}
                maxLength={50}
                pattern="^[a-zA-Z0-9_]+$"
              />
              <p className="mt-1 text-xs text-gray-500">
                2-50 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || isSubmitting || !username.trim()}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isLoading || isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Start Session
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            No registration required. Just enter a username and start editing!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
