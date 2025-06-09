import React, { useState } from 'react'
import FlipClock from './components/FlipClock/'
import GifContainer from './components/gif_container'
import TodoList from './components/todo-list'
import Notes from './components/notes'
import WavyLines from './components/wavy-lines'
import QuickLinks from './components/quick-links'
import BigCalendar from './components/big-calendar'
import MiniCalendar from './components/mini-calendar'
import RightSidebar from './components/right-sidebar'
import './App.css'
import TaskTimeline from './components/Task_Timeline/task_timeline'
import { generateMockTasks } from './components/Task_Timeline/timeline_utils'
import { Heart, Activity, Brain, Target, DollarSign } from 'lucide-react'

function App() {
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [tasks, setTasks] = useState(generateMockTasks())
	const [events, setEvents] = useState([])

	const handleTaskAdd = task => {
		setTasks(prevTasks => [...prevTasks, task])
	}

	const handleTaskUpdate = updatedTask => {
		setTasks(prevTasks =>
			prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
		)
	}

	const handleTaskDelete = taskId => {
		setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
	}

	const handleEventAdd = event => {
		setEvents(prevEvents => [...prevEvents, event])
	}

	const handleEventDelete = eventId => {
		setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
	}

	const [widths, setWidths] = useState({
		left: 20,
		center: 65,
		right: 15,
	})

	const navigationLinks = [
		{ name: 'Lifestyle', icon: Heart },
		{ name: 'Health & Fitness', icon: Activity },
		{ name: 'Wellness', icon: Brain },
		{ name: 'Productivity', icon: Target },
		{ name: 'Finance', icon: DollarSign }
	]

	return (
		<div>
			<div>
				<header className="relative">
					<GifContainer />
				</header>

				{/* Header content between photo and wavy lines */}
				<div className="bg-[#1a1a1a] py-8">
					<div className="max-w-7xl mx-auto px-8">
						{/* Left side content - moved to far left */}
						<div className="flex flex-col items-start mb-6">
							{/* Title */}
							<h1 className="text-4xl font-bold text-white mb-4 font-[Libre_Baskerville]">
								Student Planner
							</h1>
							
							{/* Quote with left border - moved to far left edge */}
							<div className="flex items-start mb-6 -ml-8">
								<div className="w-0.5 h-8 bg-[#97e7aa] mr-4 flex-shrink-0"></div>
								<blockquote className="text-lg italic text-white/90 font-[Libre_Baskerville] leading-relaxed">
									"Miracles happen everyday, change your perception of what a miracle is and you'll see them all around you."
								</blockquote>
							</div>
						</div>
						
						{/* Navigation links - centered with space between and larger text */}
						<div className="flex items-center justify-between text-base text-white/80 max-w-4xl mx-auto">
							{navigationLinks.map((link, index) => {
								const IconComponent = link.icon
								return (
									<a key={index} href="#" className="flex items-center gap-2 hover:text-[#97e7aa] transition-colors text-base">
										<IconComponent size={18} className="text-[#97e7aa]" />
										{link.name}
									</a>
								)
							})}
						</div>
					</div>
				</div>

				<WavyLines />

				<main className='flex w-full h-screen select-none'>
					{/* Ліва Секція */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: `${widths.left}%` }}
					>
						<FlipClock />
						<QuickLinks />
					</section>

					{/* Центральна Секція */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: `${widths.center}%` }}
					>
						<section className='flex flex-row p-4 gap-4'>
							<TodoList
								onAddTask={handleTaskAdd}
								onUpdateTask={handleTaskUpdate}
								onDeleteTask={handleTaskDelete}
								tasks={tasks}
								selectedDate={selectedDate}
							/>
							<Notes
								selectedDate={selectedDate}
								onDateSelect={setSelectedDate}
							/>
						</section>
						<section className='flex flex-col gap-4 mb-4'>
							<TaskTimeline
								tasks={tasks}
								onAddTask={handleTaskAdd}
								onUpdateTask={handleTaskUpdate}
								onDeleteTask={handleTaskDelete}
							/>

							<BigCalendar 
								events={events}
								onAddEvent={handleEventAdd}
								onDeleteEvent={handleEventDelete}
							/>
						</section>
					</section>

					{/* Права Секція */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: `${widths.right}%` }}
					>
						<MiniCalendar />
						<RightSidebar />
					</section>
				</main>
			</div>
		</div>
	)
}

export default App