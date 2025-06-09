import React, { useState } from 'react'
import Navbar from '../components/navbar'
import GifContainer from '../components/gif_container'
import HeaderContent from '../components/header-content'
import NavigationLinks from '../components/navigation-links'
import WavyLines from '../components/wavy-lines'
import FlipClock from '../components/FlipClock/'
import QuickLinks from '../components/quick-links'
import BigCalendar from '../components/big-calendar'
import TodayTasks from '../components/today-tasks'
import UpcomingBirthdays from '../components/upcoming-birthdays'
import { generateMockTasks } from '../components/Task_Timeline/timeline_utils'
import '../App.css'

function LifestylePage() {
	const [events, setEvents] = useState([])
	const [tasks, setTasks] = useState(generateMockTasks())

	const handleEventAdd = event => {
		setEvents(prevEvents => [...prevEvents, event])
	}

	const handleEventDelete = eventId => {
		setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
	}

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

	return (
		<div>
			<div>
				<Navbar />
				<header className='relative'>
					<GifContainer />
				</header>
				<HeaderContent title="Lifestyle" />
				<NavigationLinks />
				<WavyLines />
				<main className='flex w-full h-screen select-none'>
					{/* Left Section - 20% */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: '20%' }}
					>
						<FlipClock />
						<QuickLinks />
					</section>

					{/* Right Section - 80% */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: '80%' }}
					>
						{/* Top Row - Two blocks side by side */}
						<div className='flex flex-row gap-4 h-1/4'>
							{/* Today Tasks Block */}
							<div className='flex-1'>
								<TodayTasks
									tasks={tasks}
									onAddTask={handleTaskAdd}
									onUpdateTask={handleTaskUpdate}
									onDeleteTask={handleTaskDelete}
								/>
							</div>

							{/* Upcoming Birthdays Block */}
							<div className='flex-1'>
								<UpcomingBirthdays events={events} />
							</div>
						</div>

						{/* Trade Planner Block */}
						<div className='h-1/4 border-2 border-dashed border-gray-500 rounded-lg p-4 flex items-center justify-center'>
							<h3 className='text-xl font-[Libre_Baskerville] italic text-white'>
								Trade Planner
							</h3>
						</div>

						{/* Upcoming Events Block */}
						<div className='h-1/4 border-2 border-dashed border-gray-500 rounded-lg p-4 flex items-center justify-center'>
							<h3 className='text-xl font-[Libre_Baskerville] italic text-white'>
								Upcoming Events in 30 Days
							</h3>
						</div>

						{/* Calendar Block */}
						<div className='h-1/4'>
							<BigCalendar
								events={events}
								onAddEvent={handleEventAdd}
								onDeleteEvent={handleEventDelete}
							/>
						</div>
					</section>
				</main>
			</div>
		</div>
	)
}

export default LifestylePage