
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure we're getting the right DOM element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Initialize app with React 18's createRoot
createRoot(rootElement).render(<App />);

// Add some logging to help debug
console.log("React application initialized");
