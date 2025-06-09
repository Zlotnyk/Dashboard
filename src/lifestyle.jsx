import RefreshRuntime from 'react-refresh/runtime';
if (import.meta.hot) {
  RefreshRuntime.injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LifestylePage from './pages/lifestyle.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LifestylePage />
  </StrictMode>,
)