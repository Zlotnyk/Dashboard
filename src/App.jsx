import React, { useState, useEffect } from 'react'
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
import Navbar from './components/navbar'
import './App.css'
import TaskTimeline from './components/Task_Timeline/task_timeline'
import { generateMockTasks } from './components/Task_Timeline/timeline_utils'
import { useAuth } from './hooks/useAuth'
import { tasksAPI, eventsAPI } from './services/api'

function App() {
	const { isAuthenticated, user } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [tasks, setTasks] = useState([])
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(false)
	const [widths, setWidths] = useState({
		left: 20,
		center: 65,
		right: 15,
	})
	const [containerHeight, setContainerHeight] = useState(window.innerHeight)

	// Update container height on window resize
	useEffect(() => {
		const handleResize = () => {
			setContainerHeight(window.innerHeight)
		}
		
		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	// Load tasks and events when user authentication changes
	useEffect(() => {
		if (isAuthenticated && user) {
			loadUserData()
		} else {
			// Load from localStorage for non-authenticated users
			loadLocalData()
		}
	}, [isAuthenticated, user])

	const loadUserData = async () => {
		try {
			setLoading(true)
			console.log('Loading user data from backend...')
			
			// Load tasks from backend
			const tasksResponse = await tasksAPI.getTasks()
			console.log('Backend tasks response:', tasksResponse.data)
			
			if (tasksResponse.data && tasksResponse.data.data) {
				const backendTasks = tasksResponse.data.data.map(task => {
					console.log('Processing task:', task)
					return {
						...task,
						id: task._id, // Map _id to id
						start: new Date(task.startDate),
						end: new Date(task.endDate),
						color: task.color || 'var(--accent-color, #97e7aa)',
						// Ensure all required fields are present
						title: task.title || 'Untitled Task',
						status: task.status || 'Not started',
						priority: task.priority || 'normal',
						description: task.description || ''
					}
				})
				console.log('Processed tasks:', backendTasks)
				setTasks(backendTasks)
			} else {
				console.log('No tasks data in response')
				setTasks([])
			}

			// Load events from backend
			const eventsResponse = await eventsAPI.getEvents()
			if (eventsResponse.data && eventsResponse.data.data) {
				const backendEvents = eventsResponse.data.data.map(event => ({
					...event,
					id: event._id,
					date: new Date(event.date)
				}))
				setEvents(backendEvents)
			} else {
				setEvents([])
			}

		} catch (error) {
			console.error('Error loading user data:', error)
			// Fallback to localStorage
			loadLocalData()
		} finally {
			setLoading(false)
		}
	}

	const loadLocalData = () => {
		console.log('Loading data from localStorage...')
		
		// Load tasks from localStorage
		const savedTasks = localStorage.getItem('tasks')
		if (savedTasks) {
			try {
				const parsedTasks = JSON.parse(savedTasks).map(task => ({
					...task,
					start: new Date(task.start),
					end: new Date(task.end)
				}))
				console.log('Loaded tasks from localStorage:', parsedTasks)
				setTasks(parsedTasks)
			} catch (error) {
				console.error('Error parsing saved tasks:', error)
				setTasks(generateMockTasks())
			}
		} else {
			console.log('No saved tasks, using mock data')
			setTasks(generateMockTasks())
		}

		// Load events from localStorage
		const savedEvents = localStorage.getItem('events')
		if (savedEvents) {
			try {
				const parsedEvents = JSON.parse(savedEvents).map(event => ({
					...event,
					date: new Date(event.date)
				}))
				setEvents(parsedEvents)
			} catch (error) {
				console.error('Error parsing saved events:', error)
				setEvents([])
			}
		} else {
			setEvents([])
		}
	}

	// Save to localStorage for non-authenticated users
	useEffect(() => {
		if (!isAuthenticated && tasks.length > 0) {
			console.log('Saving tasks to localStorage:', tasks)
			localStorage.setItem('tasks', JSON.stringify(tasks))
		}
	}, [tasks, isAuthenticated])

	useEffect(() => {
		if (!isAuthenticated && events.length > 0) {
			localStorage.setItem('events', JSON.stringify(events))
		}
	}, [events, isAuthenticated])

	const handleTaskAdd = async (task) => {
		console.log('Adding task:', task)
		
		if (isAuthenticated) {
			try {
				// For authenticated users, add the task to the state
				// The task should already be created via API in the component
				setTasks(prevTasks => {
					const newTasks = [...prevTasks, task]
					console.log('Updated tasks state:', newTasks)
					return newTasks
				})
			} catch (error) {
				console.error('Error adding task:', error)
			}
		} else {
			// For non-authenticated users, add locally
			const newTask = { ...task, id: task.id || crypto.randomUUID() }
			setTasks(prevTasks => {
				const newTasks = [...prevTasks, newTask]
				console.log('Updated tasks state (local):', newTasks)
				return newTasks
			})
		}
	}

	const handleTaskUpdate = (updatedTask) => {
		console.log('Updating task:', updatedTask)
		
		setTasks(prevTasks => {
			const newTasks = prevTasks.map(task => {
				const taskId = task.id || task._id
				const updatedTaskId = updatedTask.id || updatedTask._id
				return taskId === updatedTaskId ? updatedTask : task
			})
			console.log('Updated tasks state after update:', newTasks)
			return newTasks
		})
	}

	const handleTaskDelete = (taskId) => {
		console.log('Deleting task with ID:', taskId)
		
		setTasks(prevTasks => {
			const newTasks = prevTasks.filter(task => {
				const currentTaskId = task.id || task._id
				return currentTaskId !== taskId
			})
			console.log('Updated tasks state after delete:', newTasks)
			return newTasks
		})
	}

	const handleEventAdd = async (event) => {
		if (isAuthenticated) {
			try {
				const response = await eventsAPI.createEvent({
					title: event.title,
					date: event.date,
					time: event.time,
					location: event.location,
					category: event.category,
					isBirthday: event.isBirthday,
					originalBirthYear: event.originalBirthYear
				})
				
				const backendEvent = {
					...response.data.data,
					id: response.data.data._id,
					date: new Date(response.data.data.date)
				}
				
				setEvents(prevEvents => [...prevEvents, backendEvent])
			} catch (error) {
				console.error('Error creating event:', error)
				// Fallback to local storage
				setEvents(prevEvents => [...prevEvents, event])
			}
		} else {
			setEvents(prevEvents => [...prevEvents, event])
		}
	}

	const handleEventDelete = async (eventId) => {
		if (isAuthenticated) {
			try {
				await eventsAPI.deleteEvent(eventId)
				setEvents(prevEvents => prevEvents.filter(event => {
					const currentEventId = event.id || event._id
					return currentEventId !== eventId
				}))
			} catch (error) {
				console.error('Error deleting event:', error)
				// Fallback to local delete
				setEvents(prevEvents => prevEvents.filter(event => {
					const currentEventId = event.id || event._id
					return currentEventId !== eventId
				}))
			}
		} else {
			setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
		}
	}

	// Calculate available height for the task timeline
	const calculateTimelineHeight = () => {
		// Approximate heights of other components
		const navbarHeight = 60;
		const headerHeight = 200;
		const todoNotesHeight = 400;
		const padding = 40;
		
		// Calculate available height
		const availableHeight = containerHeight - navbarHeight - headerHeight - todoNotesHeight - padding;
		
		// Return a reasonable height (minimum 300px)
		return Math.max(300, availableHeight * 0.4); // 40% of available space
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
				<div className="text-white text-xl">Loading...</div>
			</div>
		)
	}

	return (
		<div>
			<div>
				<Navbar />
				<header className='relative'>
					<GifContainer />
				</header>
				<HeaderContent />
				<NavigationLinks />
				<WavyLines />
				<main className='flex w-full h-screen select-none'>
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: `${widths.left}%` }}
					>
						<FlipClock />
						<QuickLinks />
					</section>
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
                height={`${calculateTimelineHeight()}px`}
							/>
							<BigCalendar
								events={events}
								onAddEvent={handleEventAdd}
								onDeleteEvent={handleEventDelete}
							/>
						</section>
					</section>
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