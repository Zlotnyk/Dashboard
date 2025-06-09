import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, MoreHorizontal, Plus } from 'lucide-react'

const TaskTimeline = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedTask, setSelectedTask] = useState(null)
	const [draggedTask, setDraggedTask] = useState(null)
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
	const timelineRef = useRef(null)

	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	]

	const currentMonth = currentDate.getMonth()
	const currentYear = currentDate.getFullYear()
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

	const navigateMonth = (direction) => {
		const newDate = new Date(currentDate)
		newDate.setMonth(currentMonth + direction)
		setCurrentDate(newDate)
	}

	const getDayPosition = (date) => {
		const day = date.getDate()
		return ((day - 1) / daysInMonth) * 100
	}

	const getTaskWidth = (task) => {
		const startDay = task.start.getDate()
		const endDay = task.end.getDate()
		return ((endDay - startDay + 1) / daysInMonth) * 100
	}

	const handleTaskClick = (task) => {
		setSelectedTask(selectedTask?.id === task.id ? null : task)
	}

	const handleDeleteTask = () => {
		if (selectedTask) {
			onDeleteTask(selectedTask.id)
			setSelectedTask(null)
		}
	}

	const handleAddTask = () => {
		const newTask = {
			id: crypto.randomUUID(),
			title: 'New page',
			start: new Date(currentYear, currentMonth, 1),
			end: new Date(currentYear, currentMonth, 3),
			progress: 0,
			status: 'Not started',
			color: '#97e7aa'
		}
		onAddTask(newTask)
	}

	const handleMouseDown = (e, task) => {
		e.preventDefault()
		setDraggedTask(task)
		const rect = timelineRef.current.getBoundingClientRect()
		setDragOffset({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		})
	}

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!draggedTask || !timelineRef.current) return

			const rect = timelineRef.current.getBoundingClientRect()
			const x = e.clientX - rect.left - dragOffset.x
			const dayWidth = rect.width / daysInMonth
			const newStartDay = Math.max(1, Math.min(daysInMonth, Math.round(x / dayWidth) + 1))
			
			const taskDuration = draggedTask.end.getDate() - draggedTask.start.getDate()
			const newEndDay = Math.min(daysInMonth, newStartDay + taskDuration)

			const updatedTask = {
				...draggedTask,
				start: new Date(currentYear, currentMonth, newStartDay),
				end: new Date(currentYear, currentMonth, newEndDay)
			}

			onUpdateTask(updatedTask)
		}

		const handleMouseUp = () => {
			setDraggedTask(null)
		}

		if (draggedTask) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [draggedTask, dragOffset, currentYear, currentMonth, daysInMonth, onUpdateTask])

	const currentMonthTasks = tasks.filter(task => 
		task.start.getMonth() === currentMonth && task.start.getFullYear() === currentYear
	)

	return (
		<div className="w-full bg-[#1a1a1a] rounded-lg border border-gray-700 h-[300px] flex flex-col">
			{/* Compact Header */}
			<div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 flex-shrink-0">
				<div className="flex items-center gap-2">
					<Calendar size={16} className="text-gray-400" />
					<span className="text-white text-sm font-medium">Task Timeline</span>
					<MoreHorizontal size={16} className="text-gray-400" />
				</div>

				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<button
							onClick={() => navigateMonth(-1)}
							className="p-1 hover:bg-gray-700 rounded"
						>
							<ChevronLeft size={14} className="text-gray-400" />
						</button>
						<span className="text-white text-xs font-medium min-w-[80px] text-center">
							{monthNames[currentMonth].slice(0, 3)} {currentYear}
						</span>
						<button
							onClick={() => navigateMonth(1)}
							className="p-1 hover:bg-gray-700 rounded"
						>
							<ChevronRight size={14} className="text-gray-400" />
						</button>
					</div>

					<div className="flex items-center gap-1">
						<button className="px-2 py-1 text-xs text-gray-400 hover:text-white">
							Month
						</button>
						<button className="px-2 py-1 text-xs text-gray-400 hover:text-white">
							Week
						</button>
						<button className="px-2 py-1 text-xs text-gray-400 hover:text-white">
							Today
						</button>
						<button
							onClick={handleAddTask}
							className="flex items-center gap-1 px-2 py-1 bg-[#97e7aa] text-white rounded text-xs hover:bg-[#75b384]"
						>
							<Plus size={12} />
							New
						</button>
					</div>
				</div>
			</div>

			{/* Calendar Grid */}
			<div className="relative flex-1 overflow-hidden" ref={timelineRef}>
				{/* Compact Days Header */}
				<div className="flex border-b border-gray-700 h-6">
					{Array.from({ length: daysInMonth }, (_, i) => (
						<div
							key={i + 1}
							className="flex-1 flex items-center justify-center text-xs text-gray-400 border-r border-gray-700 last:border-r-0"
						>
							{i + 1}
						</div>
					))}
				</div>

				{/* Vertical Grid Lines */}
				<div className="absolute inset-0 pointer-events-none top-6">
					{Array.from({ length: daysInMonth - 1 }, (_, i) => (
						<div
							key={i}
							className="absolute top-0 bottom-0 w-px bg-gray-700"
							style={{ left: `${((i + 1) / daysInMonth) * 100}%` }}
						/>
					))}
				</div>

				{/* Compact Tasks Area */}
				<div className="relative h-full p-2 overflow-y-auto custom-scrollbar">
					{currentMonthTasks.map((task, index) => (
						<div
							key={task.id}
							className={`absolute h-6 rounded cursor-pointer transition-all duration-200 ${
								selectedTask?.id === task.id ? 'ring-1 ring-[#97e7aa]' : ''
							}`}
							style={{
								left: `${getDayPosition(task.start)}%`,
								width: `${getTaskWidth(task)}%`,
								top: `${index * 28 + 4}px`,
								backgroundColor: '#97e7aa'
							}}
							onClick={() => handleTaskClick(task)}
							onMouseDown={(e) => handleMouseDown(e, task)}
						>
							<div className="flex items-center h-full px-2 text-white text-xs">
								<span className="truncate">
									{task.title} • {task.status || 'Not started'}
								</span>
							</div>
						</div>
					))}

					{/* Compact Delete Button */}
					{selectedTask && (
						<div className="absolute top-1 left-1">
							<button
								onClick={handleDeleteTask}
								className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
							>
								<span className="text-xs">🗑</span>
								Delete
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default TaskTimeline