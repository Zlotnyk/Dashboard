import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { notesAPI } from '../services/api'

export default function Notes() {
	const { isAuthenticated, user } = useAuth()
	const [notes, setNotes] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	// Load notes when component mounts or authentication state changes
	useEffect(() => {
		if (isAuthenticated && user) {
			loadNotesFromBackend()
		} else {
			loadNotesFromLocalStorage()
		}
	}, [isAuthenticated, user])

	// Load notes from backend for authenticated users
	const loadNotesFromBackend = async () => {
		try {
			setLoading(true)
			setError(null)
			const response = await notesAPI.getTodaysNotes()
			
			if (response.data && response.data.data) {
				// Map backend notes to the format used in the component
				const backendNotes = response.data.data.map(note => ({
					id: note._id,
					content: note.content
				}))
				setNotes(backendNotes)
			} else {
				// If no notes found, initialize with empty array
				setNotes([])
			}
		} catch (error) {
			console.error('Error loading notes from backend:', error)
			setError('Failed to load notes. Please try again.')
			// Fallback to localStorage if backend fails
			loadNotesFromLocalStorage()
		} finally {
			setLoading(false)
		}
	}

	// Load notes from localStorage for non-authenticated users
	const loadNotesFromLocalStorage = () => {
		const savedNotes = localStorage.getItem('todaysNotes')
		if (savedNotes) {
			try {
				setNotes(JSON.parse(savedNotes))
			} catch (error) {
				console.error('Error parsing saved notes:', error)
				setNotes([])
			}
		} else {
			// Initialize with 5 empty notes if nothing is saved
			const initialNotes = Array.from({ length: 5 }, () => ({
				id: crypto.randomUUID(),
				content: 'Note',
			}))
			setNotes(initialNotes)
		}
	}

	// Save notes to backend for authenticated users
	const saveNotesToBackend = async (updatedNotes) => {
		if (!isAuthenticated) return

		try {
			// First, get existing notes to determine what needs to be created/updated/deleted
			const response = await notesAPI.getTodaysNotes()
			const existingNotes = response.data.data || []
			
			// Map existing notes by ID for easier lookup
			const existingNotesMap = existingNotes.reduce((map, note) => {
				map[note._id] = note
				return map
			}, {})
			
			// Process each note in the updated list
			for (const note of updatedNotes) {
				if (note.id && existingNotesMap[note.id]) {
					// Update existing note
					await notesAPI.updateNote(note.id, {
						content: note.content,
						category: 'daily'
					})
				} else {
					// Create new note
					const response = await notesAPI.createNote({
						content: note.content,
						category: 'daily',
						date: new Date()
					})
					
					// Update the note ID with the one from the backend
					note.id = response.data.data._id
				}
			}
			
			// Delete notes that exist in backend but not in updated list
			const updatedNoteIds = updatedNotes.map(note => note.id).filter(Boolean)
			for (const existingNote of existingNotes) {
				if (!updatedNoteIds.includes(existingNote._id)) {
					await notesAPI.deleteNote(existingNote._id)
				}
			}
		} catch (error) {
			console.error('Error saving notes to backend:', error)
			// Fallback to localStorage if backend fails
			localStorage.setItem('todaysNotes', JSON.stringify(updatedNotes))
		}
	}

	// Save notes to localStorage for non-authenticated users
	const saveNotesToLocalStorage = (updatedNotes) => {
		localStorage.setItem('todaysNotes', JSON.stringify(updatedNotes))
	}

	// Adds one note
	const addNote = async () => {
		const newNote = {
			id: crypto.randomUUID(), // Temporary ID for new notes
			content: 'Note',
		}
		
		const updatedNotes = [...notes, newNote]
		setNotes(updatedNotes)
		
		// Save to appropriate storage
		if (isAuthenticated) {
			try {
				const response = await notesAPI.createNote({
					content: newNote.content,
					category: 'daily',
					date: new Date()
				})
				
				// Update the note with the ID from the backend
				setNotes(prev => prev.map(note => 
					note.id === newNote.id ? { ...note, id: response.data.data._id } : note
				))
			} catch (error) {
				console.error('Error creating note:', error)
				saveNotesToLocalStorage(updatedNotes)
			}
		} else {
			saveNotesToLocalStorage(updatedNotes)
		}
	}

	const handleContentChange = async (id, value) => {
		const updatedNotes = notes.map(note => 
			note.id === id ? { ...note, content: value } : note
		)
		setNotes(updatedNotes)
		
		// Debounce saving to reduce API calls
		if (isAuthenticated) {
			// For authenticated users, update in backend
			const noteToUpdate = updatedNotes.find(note => note.id === id)
			try {
				await notesAPI.updateNote(id, {
					content: noteToUpdate.content,
					category: 'daily'
				})
			} catch (error) {
				console.error('Error updating note:', error)
				saveNotesToLocalStorage(updatedNotes)
			}
		} else {
			// For non-authenticated users, save to localStorage
			saveNotesToLocalStorage(updatedNotes)
		}
	}

	const handleKeyDown = async (id, content, e) => {
		if (e.key === 'Backspace' && content.trim() === '') {
			const updatedNotes = notes.filter(note => note.id !== id)
			setNotes(updatedNotes)
			e.preventDefault()
			
			if (isAuthenticated) {
				try {
					await notesAPI.deleteNote(id)
				} catch (error) {
					console.error('Error deleting note:', error)
					saveNotesToLocalStorage(updatedNotes)
				}
			} else {
				saveNotesToLocalStorage(updatedNotes)
			}
		}
	}

	if (loading) {
		return (
			<div className='w-full min-h-[400px] rounded-lg p-5 flex items-center justify-center'>
				<div className="text-white">Loading notes...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='w-full min-h-[400px] rounded-lg p-5'>
				<div className="text-red-400 mb-4">{error}</div>
				<button 
					onClick={loadNotesFromBackend}
					className='px-3 py-1 bg-accent text-white rounded hover:bg-accent-80 text-sm'
				>
					Try Again
				</button>
			</div>
		)
	}

	return (
		<div className='w-full min-h-[400px] rounded-lg p-5'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-[Libre_Baskerville] italic text-white'>
					Today's Notes
				</h2>
				<button
					onClick={addNote}
					className='px-3 py-1 bg-accent text-white rounded hover:bg-accent-80 text-sm'
				>
					Add a new note
				</button>
			</div>

			{/* Horizontal line under header */}
			<div className="w-full h-px bg-gray-700 mb-4"></div>

			<ul className='list-disc pl-6 space-y-3'>
				{notes.map(note => (
					<li key={note.id} className='text-white'>
						<input
							className='w-full bg-transparent text-white outline-none'
							value={note.content}
							onChange={e => handleContentChange(note.id, e.target.value)}
							onKeyDown={e => handleKeyDown(note.id, note.content, e)}
						/>
					</li>
				))}
			</ul>
		</div>
	)
}