import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

const UserContext = createContext();

const initialState = {
  user: null,
  sessionId: null,
  isLoading: false,
  isAuthenticated: false,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        sessionId: action.payload.sessionId,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        sessionId: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_ACTIVITY':
      return { ...state };
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    const username = localStorage.getItem('username');
    
    if (sessionId && username) {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      sessionAPI.get(sessionId)
        .then(response => {
          if (response.data.success) {
            dispatch({
              type: 'SET_USER',
              payload: {
                user: { username: response.data.data.username },
                sessionId: response.data.data.sessionId,
              },
            });
          } else {
            clearSession();
          }
        })
        .catch(() => {
          clearSession();
        });
    }
  }, []);

  // Update activity periodically
  useEffect(() => {
    if (state.sessionId) {
      const interval = setInterval(() => {
        sessionAPI.updateActivity(state.sessionId)
          .then(() => {
            dispatch({ type: 'UPDATE_ACTIVITY' });
          })
          .catch(() => {
            // Session might be expired
            clearSession();
            toast.error('Session expired. Please login again.');
          });
      }, 5 * 60 * 1000); // Update every 5 minutes

      return () => clearInterval(interval);
    }
  }, [state.sessionId]);

  const login = async (username) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await sessionAPI.create(username);
      
      if (response.data.success) {
        const { sessionId, username: returnedUsername } = response.data.data;
        
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('username', returnedUsername);
        
        dispatch({
          type: 'SET_USER',
          payload: {
            user: { username: returnedUsername },
            sessionId,
          },
        });
        
        toast.success(`Welcome, ${returnedUsername}!`);
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      if (state.sessionId) {
        await sessionAPI.end(state.sessionId);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      clearSession();
      toast.success('Logged out successfully');
    }
  };

  const clearSession = () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    dispatch({ type: 'CLEAR_USER' });
  };

  const value = {
    ...state,
    login,
    logout,
    clearSession,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
