import React, { useState } from 'react'
import { Plus, FileText, Pencil } from 'lucide-react'
import TaskDrawer from './Task_Timeline/task_drawer'
import { useAuth } from '../hooks/useAuth'
import { tasksAPI } from '../services/api'
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from './Task_Timeline/timeline_utils'

export default function TodoList({
	onAddTask,
	onUpdateTask,
	onDeleteTask,
	tasks,
	selectedDate,
}) {
	const { isAuthenticated } = useAuth()
	const [editingId, setEditingId] = useState(null)
	const [editingText, setEditingText] = useState('')
	const [editingStart, setEditingStart] = useState('')
	const [editingEnd, setEditingEnd] = useState('')
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [drawerTask, setDrawerTask] = useState(null)
	const [loading, setLoading] = useState(false)

	const addTodo = () => {
		// Open drawer for new task creation
		const newTodo = {
			title: 'New Task',
			start: new Date(selectedDate),
			end: new Date(selectedDate),
			progress: 0,
			status: 'Not started',
			priority: 'normal',
			description: '',
			color: '#3B82F6',
		}
		
		setDrawerTask(newTodo)
		setIsDrawerOpen(true)
	}

	const startEditing = task => {
		const taskId = task.id || task._id
		setEditingId(taskId)
		setEditingText(task.title)
		setEditingStart(formatDateToYYYYMMDD(task.start))
		setEditingEnd(formatDateToYYYYMMDD(task.end))
	}

	const finishEditing = async () => {
		if (!editingText.trim()) return
		
		const taskToUpdate = tasks.find(task => {
			const taskId = task.id || task._id
			return taskId === editingId
		})
		
		if (taskToUpdate) {
			const updatedTask = {
				...taskToUpdate,
				title: editingText,
				start: parseYYYYMMDDToDate(editingStart),
				end: parseYYYYMMDDToDate(editingEnd),
			}

			if (isAuthenticated) {
				try {
					setLoading(true)
					const taskId = editingId
					const response = await tasksAPI.updateTask(taskId, {
						title: updatedTask.title,
						startDate: formatDateToYYYYMMDD(updatedTask.start),
						endDate: formatDateToYYYYMMDD(updatedTask.end)
					})
					
					const backendTask = {
						...response.data.data,
						id: response.data.data._id,
						start: new Date(response.data.data.startDate),
						end: new Date(response.data.data.endDate),
						color: updatedTask.color || 'var(--accent-color, #97e7aa)'
					}
					
					onUpdateTask(backendTask)
				} catch (error) {
					console.error('Error updating task:', error)
					// Fallback to local update
					onUpdateTask(updatedTask)
				} finally {
					setLoading(false)
				}
			} else {
				onUpdateTask(updatedTask)
			}
		}
		
		setEditingId(null)
		setEditingText('')
		setEditingStart('')
		setEditingEnd('')
	}

	const openTaskDrawer = (task) => {
		setDrawerTask(task)
		setIsDrawerOpen(true)
	}

	const handleDrawerSave = async (updatedTask) => {
		if (!updatedTask.id && !updatedTask._id) {
			// This is a new task
			if (isAuthenticated) {
				try {
					setLoading(true)
					const response = await tasksAPI.createTask({
						title: updatedTask.title,
						description: updatedTask.description,
						startDate: formatDateToYYYYMMDD(updatedTask.start),
						endDate: formatDateToYYYYMMDD(updatedTask.end),
						status: updatedTask.status,
						priority: updatedTask.priority
					})
					
					const backendTask = {
						...response.data.data,
						id: response.data.data._id,
						start: new Date(response.data.data.startDate),
						end: new Date(response.data.data.endDate),
						color: updatedTask.color || 'var(--accent-color, #97e7aa)'
					}
					
					onAddTask(backendTask)
				} catch (error) {
					console.error('Error creating task:', error)
					const localTask = { ...updatedTask, id: crypto.randomUUID() }
					onAddTask(localTask)
				} finally {
					setLoading(false)
				}
			} else {
				const localTask = { ...updatedTask, id: crypto.randomUUID() }
				onAddTask(localTask)
			}
		} else {
			// This is an existing task
			if (isAuthenticated) {
				try {
					setLoading(true)
					const taskId = updatedTask.id || updatedTask._id
					const response = await tasksAPI.updateTask(taskId, {
						title: updatedTask.title,
						description: updatedTask.description,
						startDate: formatDateToYYYYMMDD(updatedTask.start),
						endDate: formatDateToYYYYMMDD(updatedTask.end),
						status: updatedTask.status,
						priority: updatedTask.priority
					})
					
					const backendTask = {
						...response.data.data,
						id: response.data.data._id,
						start: new Date(response.data.data.startDate),
						end: new Date(response.data.data.endDate),
						color: updatedTask.color || 'var(--accent-color, #97e7aa)'
					}
					
					onUpdateTask(backendTask)
				} catch (error) {
					console.error('Error updating task:', error)
					onUpdateTask(updatedTask)
				} finally {
					setLoading(false)
				}
			} else {
				onUpdateTask(updatedTask)
			}
		}
		
		setIsDrawerOpen(false)
		setDrawerTask(null)
	}

	const handleDrawerClose = () => {
		setIsDrawerOpen(false)
		setDrawerTask(null)
	}

	const handleDeleteTask = async (taskId) => {
		if (isAuthenticated) {
			try {
				setLoading(true)
				await tasksAPI.deleteTask(taskId)
				onDeleteTask(taskId)
			} catch (error) {
				console.error('Error deleting task:', error)
				onDeleteTask(taskId)
			} finally {
				setLoading(false)
			}
		} else {
			onDeleteTask(taskId)
		}
	}

	return (
		<>
			<div className='w-full min-h-[400px] rounded-lg p-5 bg-transparent'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-lg font-[Libre_Baskerville] italic text-white'>
						To-Do List
					</h2>
					<button
						className='flex items-center gap-2 px-3 py-1 bg-accent text-white rounded-lg hover:bg-accent-80 text-sm disabled:opacity-50'
						onClick={addTodo}
						disabled={loading}
					>
						<Plus size={16} />
						{loading ? 'Adding...' : 'New'}
					</button>
				</div>

				{/* Horizontal line under header */}
				<div className="w-full h-px bg-gray-700 mb-4"></div>

				<div className='space-y-2'>
					{tasks.map(task => {
						const isUrgent = task.priority === 'urgent'
						const taskId = task.id || task._id
						
						return (
							<div
								key={taskId}
								className='bg-transparent rounded-lg p-3 hover:bg-gray-800/30 transition-colors group'
							>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2 flex-1'>
										<FileText size={16} className='text-gray-400' />
										{editingId === taskId ? (
											<div className='flex flex-col gap-2 w-full'>
												<input
													autoFocus
													type='text'
													value={editingText}
													onChange={e => setEditingText(e.target.value)}
													onBlur={finishEditing}
													onKeyDown={e => {
														if (e.key === 'Enter') finishEditing()
													}}
													className='bg-transparent outline-none text-white w-full text-sm'
													disabled={loading}
												/>
												<input
													type='date'
													value={editingStart}
													onChange={e => setEditingStart(e.target.value)}
													className='bg-transparent outline-none text-gray-400 text-xs'
													disabled={loading}
												/>
												<input
													type='date'
													value={editingEnd}
													onChange={e => setEditingEnd(e.target.value)}
													className='bg-transparent outline-none text-gray-400 text-xs'
													disabled={loading}
												/>
											</div>
										) : (
											<div className='flex flex-col flex-1'>
												<div className='flex items-center gap-2'>
													{isUrgent && <span className="text-orange-500">🔥</span>}
													<span className='text-white text-sm font-medium'>{task.title}</span>
												</div>
												<div className='text-gray-400 text-xs'>
													{task.start.toLocaleDateString()}
												</div>
												<div className='text-gray-400 text-xs'>
													Status: {task.status || 'Not started'}
												</div>
											</div>
										)}
									</div>

									{/* Edit button and checkbox with proper spacing */}
									<div className='flex items-center gap-[10px]'>
										{editingId !== taskId && (
											<button
												onClick={() => openTaskDrawer(task)}
												className='opacity-0 group-hover:opacity-100 border border-gray-500 rounded p-1 hover:bg-gray-600 transition-all w-6 h-6 flex items-center justify-center'
												title='Edit Task Details'
												disabled={loading}
											>
												<Pencil size={12} className='text-gray-400' />
											</button>
										)}

										<input
											type='checkbox'
											onChange={() => handleDeleteTask(taskId)}
											className='w-6 h-6 cursor-pointer bg-transparent appearance-none border border-gray-400 rounded checked:bg-blue-500 checked:border-transparent'
											title='Complete Task'
											disabled={loading}
										/>
									</div>
								</div>
							</div>
						)
					})}

					{/* New page button */}
					<button
						className='w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50'
						onClick={addTodo}
						disabled={loading}
					>
						<Plus size={16} />
						<span className='text-sm'>{loading ? 'Adding...' : 'New page'}</span>
					</button>
				</div>
			</div>

			{/* Task Drawer */}
			<TaskDrawer
				isOpen={isDrawerOpen}
				task={drawerTask}
				onSave={handleDrawerSave}
				onClose={handleDrawerClose}
				onDelete={() => {
					if (drawerTask && (drawerTask.id || drawerTask._id)) {
						handleDeleteTask(drawerTask.id || drawerTask._id)
						handleDrawerClose()
					}
				}}
			/>
		</>
	)
}