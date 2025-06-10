import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Load Supabase test utility in development environment
if (import.meta.env.DEV) {
  import('./utils/test-supabase-browser.js')
    .then(() => console.log('Supabase test utility loaded. Use testSupabaseFromBrowser() in console to test.'))
    .catch(err => console.error('Error loading Supabase test utility:', err));
}

createRoot(document.getElementById("root")!).render(<App />);
