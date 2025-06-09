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
import TimetablePage from './pages/quick-links/timetable.jsx'
import CourseMaterialsPage from './pages/quick-links/course-materials.jsx'
import StudyChecklistPage from './pages/quick-links/study-checklist.jsx'
import AssignmentPlannerPage from './pages/quick-links/assignment-planner.jsx'
import StudyNotebookPage from './pages/quick-links/study-notebook.jsx'
import ImportantConceptsPage from './pages/quick-links/important-concepts.jsx'
import ProjectPlannerPage from './pages/quick-links/project-planner.jsx'
import GroupProjectsPage from './pages/quick-links/group-projects.jsx'
import EssayPlannerPage from './pages/quick-links/essay-planner.jsx'
import ExamPreparationPage from './pages/quick-links/exam-preparation.jsx'
import ExamReflectionPage from './pages/quick-links/exam-reflection.jsx'
import LifestyleDayPage from './pages/quick-links/lifestyle-day.jsx'
import LifestyleWeekPage from './pages/quick-links/lifestyle-week.jsx'
import LifestyleMonthPage from './pages/quick-links/lifestyle-month.jsx'
import LifestyleYearPage from './pages/quick-links/lifestyle-year.jsx'
import LifestyleContactsPage from './pages/quick-links/lifestyle-contacts.jsx'
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
				<Route path='/timetable' element={<TimetablePage />} />
				<Route path='/course-materials' element={<CourseMaterialsPage />} />
				<Route path='/study-checklist' element={<StudyChecklistPage />} />
				<Route path='/assignment-planner' element={<AssignmentPlannerPage />} />
				<Route path='/study-notebook' element={<StudyNotebookPage />} />
				<Route path='/important-concepts' element={<ImportantConceptsPage />} />
				<Route path='/project-planner' element={<ProjectPlannerPage />} />
				<Route path='/group-projects' element={<GroupProjectsPage />} />
				<Route path='/essay-planner' element={<EssayPlannerPage />} />
				<Route path='/exam-preparation' element={<ExamPreparationPage />} />
				<Route path='/exam-reflection' element={<ExamReflectionPage />} />
				<Route path='/lifestyle-day' element={<LifestyleDayPage />} />
				<Route path='/lifestyle-week' element={<LifestyleWeekPage />} />
				<Route path='/lifestyle-month' element={<LifestyleMonthPage />} />
				<Route path='/lifestyle-year' element={<LifestyleYearPage />} />
				<Route path='/lifestyle-contacts' element={<LifestyleContactsPage />} />
				<Route path='*' element={<NotFoundPage />} />
			</Routes>
		</Router>
	</StrictMode>
)