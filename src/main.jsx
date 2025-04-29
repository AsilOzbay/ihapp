import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { SelectedCoinsProvider } from './context/SelectedCoinsContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <SelectedCoinsProvider>
        <App />
      </SelectedCoinsProvider>
    </ThemeProvider>
  </StrictMode>
);
