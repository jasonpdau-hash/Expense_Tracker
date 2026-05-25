import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app.jsx'

/* App entry point */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
