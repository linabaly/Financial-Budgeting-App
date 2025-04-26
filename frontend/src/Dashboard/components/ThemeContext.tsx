/**
 * ThemeContext
 * 
 * Provides theme state management and persistence across the application.
 * Handles theme switching, local storage, and applies theme classes to DOM.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';

// Define theme types for type safety
type Theme = 'dark' | 'light';

// Context interface definition
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create context with undefined default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component wraps the application to provide theme context
 * Manages theme state and applies theme-related changes to the DOM
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'dark';
  });

  // Apply theme changes to DOM and localStorage
  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', theme);
    
    // Update HTML attribute for CSS variable access
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update body classes for component styling
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    
    // Apply critical styles directly for immediate visual feedback
    document.body.style.backgroundColor = theme === 'dark' ? '#121212' : '#f8f9fa';
    document.body.style.color = theme === 'dark' ? '#ffffff' : '#212529';
  }, [theme]);

  // Toggle between dark and light themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook for consuming theme context
 * Provides type-safe access to theme state and toggle function
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};