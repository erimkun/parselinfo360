import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompanyProvider } from './contexts/CompanyContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <CompanyProvider>
      <App />
    </CompanyProvider>
  </ThemeProvider>
)
