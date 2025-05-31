import React, { useState } from 'react'
import TimelineHeader from './timeline_header'
import TimelineCalendar from './timeline_calendar'
import TimelineToolbar from './timeline_toolbar'
import TaskList from './task_list'

const TaskTimeline = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
	const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 12))
	const [viewMode, setViewMode] = useState('month')
	const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 12))

	const handlePrevMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
		)
	}

	const handleNextMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
		)
	}

	const handleToday = () => {
		const today = new Date()
		setCurrentDate(today)
		setSelectedDate(today)
	}

	const handleDateSelect = date => {
		setSelectedDate(date)
	}

	const handleAddTask = () => {
		const newTask = {
			id: `task-${Date.now()}`,
			title: 'New Task',
			start: new Date(selectedDate),
			end: new Date(
				selectedDate.getFullYear(),
				selectedDate.getMonth(),
				selectedDate.getDate()
			),
			progress: 0,
			color: '#3B82F6',
		}
		onAddTask(newTask)
	}

	return (
		<div className='flex flex-col text-gray-200'>
			<TimelineHeader />

			<div className='px-4 py-3 flex justify-between items-center border-b border-gray-700'>
				<div className='flex items-center gap-4'>
					<h2 className='text-xl font-medium'>
						{currentDate.toLocaleDateString('en-US', {
							month: 'long',
							year: 'numeric',
						})}
					</h2>
				</div>

				<div className='flex items-center gap-2'>
					<button className='flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-500 text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'>
						<span className='hidden sm:inline'>Open in Calendar</span>
						<span className='sm:hidden'>Calendar</span>
					</button>

					<div className='flex items-center gap-1 rounded-lg border border-gray-500'>
						<select
							className='bg-transparent border-none text-gray-300 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#97e7aa] hover:bg-[#97e7aa] hover:text-white transition-colors'
							value={viewMode}
							onChange={e => setViewMode(e.target.value)}
						>
							<option value='month'>Month</option>
							<option value='week'>Week</option>
						</select>
					</div>

					<div className='flex'>
						<button
							onClick={handlePrevMonth}
							className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'
						>
							&lt;
						</button>
						<button
							onClick={handleToday}
							className='w-12 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'
						>
							Today
						</button>
						<button
							onClick={handleNextMonth}
							className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'
						>
							&gt;
						</button>
					</div>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto custom-scrollbar'>
				<TimelineCalendar
					currentDate={currentDate}
					selectedDate={selectedDate}
					onDateSelect={handleDateSelect}
					onAddTask={handleAddTask}
				/>
				<TaskList
					tasks={tasks}
					currentDate={currentDate}
					selectedDate={selectedDate}
				/>
			</div>

			<TimelineToolbar onAddTask={handleAddTask} />
		</div>
	)
}

export default TaskTimeline
