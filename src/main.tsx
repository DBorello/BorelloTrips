import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

if ('serviceWorker' in navigator) {
  // Reload the page the moment a new service worker takes over
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })

  // Check for a new service worker every time the app becomes visible
  // (switching tabs, waking the phone, returning to the app)
  navigator.serviceWorker.ready.then(registration => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        registration.update()
      }
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
