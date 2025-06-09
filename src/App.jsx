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
				<div className="bg-[#1a1a1a] py-8">
					<div className="flex items-center justify-between px-8">
						{/* Left side - Title and quote */}
						<div className="flex-1">
							<h1 className="text-4xl font-bold text-white mb-2 font-[Libre_Baskerville]">
								Student Planner
							</h1>
							<blockquote className="text-lg italic text-white/90 font-[Libre_Baskerville]">
								"Miracles happen everyday, change your perception of what a miracle is and you'll see them all around you."
							</blockquote>
						</div>
						
						{/* Center - Navigation links */}
						<div className="flex items-center justify-center gap-8 text-sm text-white/80">
							<a href="#" className="flex items-center gap-2 hover:text-[#97e7aa] transition-colors">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Lifestyle
							</a>
							<a href="#" className="flex items-center gap-2 hover:text-[#97e7aa] transition-colors">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Health & Fitness
							</a>
							<a href="#" className="flex items-center gap-2 hover:text-[#97e7aa] transition-colors">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Wellness
							</a>
							<a href="#" className="flex items-center gap-2 hover:text-[#97e7aa] transition-colors">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Productivity
							</a>
							<a href="#" className="flex items-center gap-2 hover:text-[#97e7aa] transition-colors">
								<span className="w-2 h-2 bg-[#97e7aa] rounded-full"></span>
								Finance
							</a>
						</div>
						
						{/* Right side - empty for balance */}
						<div className="flex-1"></div>
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