import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import App from "./App.tsx"; // Import App component

// import './index.css'
// import App from './App.tsx'
//import RegisterPage from './Register/RegisterPage.tsx'
//import LoginPage from './Login/LoginPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);