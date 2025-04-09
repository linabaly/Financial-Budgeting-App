/**
 * NotificationContext.tsx
 * 
 * This file implements a global notification and loading state system for the application.
 * It provides a context to show toast notifications and loading overlays throughout the app.
 */
import React, { createContext, useState, useContext, ReactNode } from 'react';

/**
 * Interface defining the available notification context methods
 */
interface NotificationContextType {
  /** Display a notification toast with the provided message */
  showNotification: (message: string) => void;
  
  /** Show a loading overlay while executing an async operation */
  simulateLoading: (callback: () => void) => void;
  
  /** Current loading state */
  isLoading: boolean;
}

// Creating the context with undefined default value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Props for the NotificationProvider component
 */
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app and provides notification functionality
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Loading state for the entire application
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Shows a notification toast with the given message
   * @param message - The text to display in the notification
   */
  const showNotification = (message: string) => {
    const notification = document.getElementById('save-notification');
    if (notification) {
      notification.textContent = message;
      notification.classList.add('show');
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
  };

  /**
   * Simulates a loading state for async operations
   * @param callback - Function to execute after loading completes
   */
  const simulateLoading = (callback: () => void) => {
    setIsLoading(true);
    
    // Simulate async operation with timeout
    setTimeout(() => {
      setIsLoading(false);
      callback();
    }, 800);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, simulateLoading, isLoading }}>
      {/* Loading overlay - shown when isLoading is true */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loader"></div>
        </div>
      )}
      
      {/* Notification toast container */}
      <div id="save-notification" className="save-notification"></div>
      
      {/* Application content */}
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to use the notification context
 * @returns NotificationContextType with notification methods
 * @throws Error if used outside of NotificationProvider
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};