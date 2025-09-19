import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      csrfUrl={`${import.meta.env.VITE_SERVER_HOSTNAME}/csrf`}
      submitUrl={`${import.meta.env.VITE_SERVER_HOSTNAME}/contact`}
      csrfHeaderName="X-CSRF-Token"
      csrfFieldName={null}
    />
  </StrictMode>,
)
