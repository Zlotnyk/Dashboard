import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LifestylePage from './pages/lifestyle.jsx'

function NotFoundPage() {
	return (
		<div>
			<h1>404 - Сторінку не знайдено</h1>
			<p>Ця сторінка ще в розробці.</p>
		</div>
	)
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<Router>
			<Routes>
				<Route path='/' element={<App />} />
				<Route path='/lifestyle' element={<LifestylePage />} />
				<Route path='*' element={<NotFoundPage />} />
			</Routes>
		</Router>
	</StrictMode>
)
