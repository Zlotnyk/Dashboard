import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LifestylePage from './pages/lifestyle.jsx'
import HealthFitnessPage from './pages/health-fitness.jsx'
import WellnessPage from './pages/wellness.jsx'
import ProductivityPage from './pages/productivity.jsx'
import FinancePage from './pages/finance.jsx'
import NotFoundPage from './pages/not-found.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<Router>
			<Routes>
				<Route path='/' element={<App />} />
				<Route path='/lifestyle' element={<LifestylePage />} />
				<Route path='/health-fitness' element={<HealthFitnessPage />} />
				<Route path='/wellness' element={<WellnessPage />} />
				<Route path='/productivity' element={<ProductivityPage />} />
				<Route path='/finance' element={<FinancePage />} />
				<Route path='*' element={<NotFoundPage />} />
			</Routes>
		</Router>
	</StrictMode>
)