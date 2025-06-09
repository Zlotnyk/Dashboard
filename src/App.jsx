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
import HeaderContent from './components/header-content'
import NavigationLinks from './components/navigation-links'
import './App.css'
import TaskTimeline from './components/Task_Timeline/task_timeline'
import { generateMockTasks } from './components/Task_Timeline/timeline_utils'

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

	return (
		<div>
			<div>
				<header className="relative">
					<GifContainer />
				</header>

				{/* Header content between photo and wavy lines */}
				<HeaderContent />
				<NavigationLinks />

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