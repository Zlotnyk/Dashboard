import React, { useState } from 'react'
import FlipClock from './components/FlipClock/'
import GifContainer from './components/gif_container'
import TodoList from './components/todo-list'
import Notes from './components/notes'
import WavyLines from './components/wavy-lines'
import QuickLinks from './components/quick-links'
import BigCalendar from './components/big-calendar'
import MiniCalendar from './components/mini-calendar'
import './App.css'
import TaskTimeline from './components/Task_Timeline/task_timeline'
import { generateMockTasks } from './components/Task_Timeline/timeline_utils'

function App() {
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [tasks, setTasks] = useState(generateMockTasks())

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

	const [widths, setWidths] = useState({
		left: 20,
		center: 60,
		right: 20,
	})

	return (
		<div>
			<div>
				<header className="relative">
					<GifContainer />
					<div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10">
						<h1 className="text-4xl font-bold text-white mb-2 font-[Libre_Baskerville]">
							Student Planner <span className="text-[#d4af37]">(Sunrise)</span>
						</h1>
						<blockquote className="text-lg italic text-white/90 max-w-2xl font-[Libre_Baskerville]">
							"Miracles happen everyday, change your perception of what a miracle is and you'll see them all around you."
						</blockquote>
						<div className="flex items-center gap-8 mt-4 text-sm text-white/80">
							<span className="flex items-center gap-2">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Lifestyle
							</span>
							<span className="flex items-center gap-2">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Health & Fitness
							</span>
							<span className="flex items-center gap-2">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Wellness
							</span>
							<span className="flex items-center gap-2">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Productivity
							</span>
							<span className="flex items-center gap-2">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Finance
							</span>
						</div>
					</div>
				</header>

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

							<BigCalendar />
						</section>
					</section>

					{/* Права Секція */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: `${widths.right}%` }}
					>
						<MiniCalendar />
						<div className='border-2 border-dashed border-gray-400 p-4 '>
							Права 2
						</div>
					</section>
				</main>
			</div>
		</div>
	)
}

export default App