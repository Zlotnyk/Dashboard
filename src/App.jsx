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
import { tasksAPI, eventsAPI, notesAPI } from './services/api'
import { Toaster } from 'react-hot-toast'

function App() {
	const { isAuthenticated, user } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [tasks, setTasks] = useState([])
	const [events, setEvents] = useState([])
	const [notes, setNotes] = useState([])
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
			
			// Load notes from backend
			const notesResponse = await notesAPI.getTodaysNotes()
			if (notesResponse.data && notesResponse.data.data) {
				const backendNotes = notesResponse.data.data.map(note => ({
					id: note._id,
					content: note.content
				}))
				setNotes(backendNotes)
			} else {
				// Don't initialize with empty notes if none found
				setNotes([])
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
		
		// Load notes from localStorage
		const savedNotes = localStorage.getItem('todaysNotes')
		if (savedNotes) {
			try {
				setNotes(JSON.parse(savedNotes))
			} catch (error) {
				console.error('Error parsing saved notes:', error)
				setNotes([])
			}
		} else {
			// Initialize with empty array, not auto-creating notes
			setNotes([])
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
	
	useEffect(() => {
		if (!isAuthenticated && notes.length > 0) {
			localStorage.setItem('todaysNotes', JSON.stringify(notes))
		}
	}, [notes, isAuthenticated])

	const handleTaskAdd = async (task) => {
		console.log('Adding task:', task)
		
		if (isAuthenticated) {
			try {
				setLoading(true)
				// For authenticated users, create task via API
				const taskData = {
					title: task.title,
					description: task.description || '',
					startDate: task.start.toISOString(),
					endDate: task.end.toISOString(),
					status: task.status || 'Not started',
					priority: task.priority || 'normal'
				}
				
				const response = await tasksAPI.createTask(taskData)
				
				// Add the created task to state
				const createdTask = {
					...response.data.data,
					id: response.data.data._id,
					start: new Date(response.data.data.startDate),
					end: new Date(response.data.data.endDate),
					color: task.color || 'var(--accent-color, #97e7aa)'
				}
				
				setTasks(prevTasks => {
					const newTasks = [...prevTasks, createdTask]
					console.log('Updated tasks state after API create:', newTasks)
					return newTasks
				})
				
				return createdTask
			} catch (error) {
				console.error('Error creating task via API:', error)
				// Fallback to local add
				const newTask = { ...task, id: task.id || crypto.randomUUID() }
				setTasks(prevTasks => {
					const newTasks = [...prevTasks, newTask]
					console.log('Updated tasks state (local fallback):', newTasks)
					return newTasks
				})
				return newTask
			} finally {
				setLoading(false)
			}
		} else {
			// For non-authenticated users, add locally
			const newTask = { ...task, id: task.id || crypto.randomUUID() }
			setTasks(prevTasks => {
				const newTasks = [...prevTasks, newTask]
				console.log('Updated tasks state (local):', newTasks)
				return newTasks
			})
			return newTask
		}
	}

	const handleTaskUpdate = async (updatedTask) => {
		console.log('Updating task:', updatedTask)
		
		if (isAuthenticated) {
			try {
				setLoading(true)
				// For authenticated users, update task via API
				const taskId = updatedTask.id || updatedTask._id
				const taskData = {
					title: updatedTask.title,
					description: updatedTask.description || '',
					startDate: updatedTask.start.toISOString(),
					endDate: updatedTask.end.toISOString(),
					status: updatedTask.status || 'Not started',
					priority: updatedTask.priority || 'normal'
				}
				
				await tasksAPI.updateTask(taskId, taskData)
				
				// Update the task in state
				setTasks(prevTasks => {
					const newTasks = prevTasks.map(task => {
						const taskId = task.id || task._id
						const updatedTaskId = updatedTask.id || updatedTask._id
						return taskId === updatedTaskId ? updatedTask : task
					})
					console.log('Updated tasks state after API update:', newTasks)
					return newTasks
				})
				
				return true
			} catch (error) {
				console.error('Error updating task via API:', error)
				// Fallback to local update
				setTasks(prevTasks => {
					const newTasks = prevTasks.map(task => {
						const taskId = task.id || task._id
						const updatedTaskId = updatedTask.id || updatedTask._id
						return taskId === updatedTaskId ? updatedTask : task
					})
					console.log('Updated tasks state (local fallback):', newTasks)
					return newTasks
				})
				return false
			} finally {
				setLoading(false)
			}
		} else {
			// For non-authenticated users, update locally
			setTasks(prevTasks => {
				const newTasks = prevTasks.map(task => {
					const taskId = task.id || task._id
					const updatedTaskId = updatedTask.id || updatedTask._id
					return taskId === updatedTaskId ? updatedTask : task
				})
				console.log('Updated tasks state (local):', newTasks)
				return newTasks
			})
			return false
		}
	}

	const handleTaskDelete = async (taskId) => {
		console.log('Deleting task with ID:', taskId)
		
		if (isAuthenticated) {
			try {
				setLoading(true)
				// For authenticated users, delete task via API
				await tasksAPI.deleteTask(taskId)
				
				// Remove the task from state
				setTasks(prevTasks => {
					const newTasks = prevTasks.filter(task => {
						const currentTaskId = task.id || task._id
						return currentTaskId !== taskId
					})
					console.log('Updated tasks state after API delete:', newTasks)
					return newTasks
				})
				
				return true
			} catch (error) {
				console.error('Error deleting task via API:', error)
				// Fallback to local delete
				setTasks(prevTasks => {
					const newTasks = prevTasks.filter(task => {
						const currentTaskId = task.id || task._id
						return currentTaskId !== taskId
					})
					console.log('Updated tasks state (local fallback):', newTasks)
					return newTasks
				})
				return false
			} finally {
				setLoading(false)
			}
		} else {
			// For non-authenticated users, delete locally
			setTasks(prevTasks => {
				const newTasks = prevTasks.filter(task => task.id !== taskId)
				console.log('Updated tasks state (local):', newTasks)
				return newTasks
			})
			return false
		}
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
				return true
			} catch (error) {
				console.error('Error creating event:', error)
				// Fallback to local storage
				setEvents(prevEvents => [...prevEvents, event])
				return false
			}
		} else {
			setEvents(prevEvents => [...prevEvents, event])
			return true
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
				return true
			} catch (error) {
				console.error('Error deleting event:', error)
				// Fallback to local deletion
				setEvents(prevEvents => prevEvents.filter(event => {
					const currentEventId = event.id || event._id
					return currentEventId !== eventId
				}))
				return false
			}
		} else {
			setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
			return true
		}
	}
	
	// Notes handlers
	const handleNoteAdd = async () => {
		const newNote = {
			id: crypto.randomUUID(),
			content: 'New note',
		}
		
		if (isAuthenticated) {
			try {
				const response = await notesAPI.createNote({
					content: newNote.content,
					category: 'daily'
				})
				
				const createdNote = {
					id: response.data.data._id,
					content: response.data.data.content
				}
				
				setNotes(prevNotes => [...prevNotes, createdNote])
				return createdNote
			} catch (error) {
				console.error('Error creating note:', error)
				// Fallback to local storage
				setNotes(prevNotes => [...prevNotes, newNote])
				return newNote
			}
		} else {
			setNotes(prevNotes => [...prevNotes, newNote])
			return newNote
		}
	}
	
	const handleNoteUpdate = async (id, content) => {
		if (isAuthenticated) {
			try {
				// Check if this is a new note (not from MongoDB)
				if (id.length < 24) {
					// Create a new note in the backend
					const response = await notesAPI.createNote({
						content: content,
						category: 'daily'
					})
					
					// Replace the temporary note with the one from the backend
					setNotes(prevNotes => prevNotes.map(note => 
						note.id === id ? { id: response.data.data._id, content } : note
					))
					
					return true
				} else {
					// Update existing note
					await notesAPI.updateNote(id, { content })
					
					// Update in state
					setNotes(prevNotes => prevNotes.map(note => 
						note.id === id ? { ...note, content } : note
					))
					
					return true
				}
			} catch (error) {
				console.error('Error updating note:', error)
				// Fallback to local update
				setNotes(prevNotes => prevNotes.map(note => 
					note.id === id ? { ...note, content } : note
				))
				return false
			}
		} else {
			// For non-authenticated users, update locally
			setNotes(prevNotes => prevNotes.map(note => 
				note.id === id ? { ...note, content } : note
			))
			return true
		}
	}
	
	const handleNoteDelete = async (id) => {
		if (isAuthenticated && id.length === 24) {
			try {
				await notesAPI.deleteNote(id)
				setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
				return true
			} catch (error) {
				console.error('Error deleting note:', error)
				// Fallback to local delete
				setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
				return false
			}
		} else {
			// For non-authenticated users or temporary notes, delete locally
			setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
			return true
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
								notes={notes}
								onAddNote={handleNoteAdd}
								onUpdateNote={handleNoteUpdate}
								onDeleteNote={handleNoteDelete}
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
			<Toaster 
				position="bottom-right"
				toastOptions={{
					duration: 3000,
					style: {
						background: '#333',
						color: '#fff',
						border: '1px solid #444'
					},
					success: {
						iconTheme: {
							primary: 'var(--accent-color, #97e7aa)',
							secondary: '#fff'
						}
					},
					error: {
						iconTheme: {
							primary: '#ef4444',
							secondary: '#fff'
						}
					}
				}}
			/>
		</div>
	)
}

export default App