import React, { createContext, useState, useContext, ReactNode } from 'react';

interface NotificationContextType {
  showNotification: (message: string) => void;
  simulateLoading: (callback: () => void) => void;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showNotification = (message: string) => {
    const notification = document.getElementById('save-notification');
    if (notification) {
      notification.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
  };

  const simulateLoading = (callback: () => void) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      callback();
    }, 800);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, simulateLoading, isLoading }}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loader"></div>
        </div>
      )}
      <div id="save-notification" className="save-notification"></div>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};