import React from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App.tsx";
import './index.css'

// Error handling for root rendering
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: Add global error handler
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  // Optionally send error to logging service
});

// Optional: Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Optionally send error to logging service
});

