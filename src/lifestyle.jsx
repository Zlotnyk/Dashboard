import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LifestylePage from './pages/lifestyle.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LifestylePage />
  </StrictMode>,
)