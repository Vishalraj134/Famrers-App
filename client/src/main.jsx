import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App.jsx'

const container = document.getElementById('app')

if (!container) {
  // If the root element isn't present, log an error and bail out.
  // This avoids using the TypeScript non-null assertion operator (!) in a JS file.
  // Vite/react will fail to mount without a container, so this surfaces the problem clearly.
  // In production you might throw or create the element dynamically.
  // eslint-disable-next-line no-console
  console.error('Root element with id "app" not found.')
} else {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}