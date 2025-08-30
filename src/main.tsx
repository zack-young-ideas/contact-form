import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App url={`${import.meta.env.VITE_SERVER_HOSTNAME}/contact`}/>
  </StrictMode>,
)
