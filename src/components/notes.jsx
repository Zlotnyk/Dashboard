import React, { useState, useEffect } from 'react'
import { notesAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function Notes() {
	const { isAuthenticated, user } = useAuth()
	const [notes, setNotes] = useState([])
	const [loading, setLoading] = useState(false)

	// Load notes when component mounts
	useEffect(() => {
		if (isAuthenticated && user) {
			loadNotes()
		} else {
			// For non-authenticated users, load from localStorage
			loadLocalNotes()
		}
	}, [isAuthenticated, user])

	// Load notes from backend
	const loadNotes = async () => {
		try {
			setLoading(true)
			const response = await notesAPI.getTodaysNotes()
			
			if (response.data && response.data.data) {
				// Convert backend notes to the format we use
				const backendNotes = response.data.data.map(note => ({
					id: note._id,
					content: note.content
				}))
				
				setNotes(backendNotes)
			} else {
				// If no notes found, initialize with empty notes
				setNotes(Array.from({ length: 5 }, () => ({
					id: crypto.randomUUID(),
					content: 'Note',
				})))
			}
		} catch (error) {
			console.error('Error loading notes:', error)
			// Fallback to local notes
			loadLocalNotes()
		} finally {
			setLoading(false)
		}
	}

	// Load notes from localStorage
	const loadLocalNotes = () => {
		const savedNotes = localStorage.getItem('todaysNotes')
		
		if (savedNotes) {
			try {
				setNotes(JSON.parse(savedNotes))
			} catch (error) {
				console.error('Error parsing saved notes:', error)
				setNotes(Array.from({ length: 5 }, () => ({
					id: crypto.randomUUID(),
					content: 'Note',
				})))
			}
		} else {
			// Initialize with empty notes
			setNotes(Array.from({ length: 5 }, () => ({
				id: crypto.randomUUID(),
				content: 'Note',
			})))
		}
	}

	// Save notes to backend or localStorage
	const saveNotes = async (updatedNotes) => {
		if (isAuthenticated) {
			try {
				// For each note, either create or update
				for (const note of updatedNotes) {
					if (note.id.length < 24) {
						// This is a new note (not from MongoDB)
						await notesAPI.createNote({
							content: note.content,
							category: 'daily'
						})
					} else {
						// This is an existing note
						await notesAPI.updateNote(note.id, {
							content: note.content
						})
					}
				}
			} catch (error) {
				console.error('Error saving notes to backend:', error)
			}
		} else {
			// For non-authenticated users, save to localStorage
			localStorage.setItem('todaysNotes', JSON.stringify(updatedNotes))
		}
	}

	// Adds one note
	const addNote = async () => {
		const newNote = {
			id: crypto.randomUUID(),
			content: 'Note',
		}
		
		const updatedNotes = [...notes, newNote]
		setNotes(updatedNotes)
		
		// Save to backend or localStorage
		await saveNotes(updatedNotes)
	}

	const handleContentChange = async (id, value) => {
		const updatedNotes = notes.map(note => 
			note.id === id ? { ...note, content: value } : note
		)
		
		setNotes(updatedNotes)
		
		// Debounce saving to reduce API calls
		if (isAuthenticated) {
			const noteToUpdate = updatedNotes.find(note => note.id === id)
			try {
				if (noteToUpdate.id.length < 24) {
					// This is a new note (not from MongoDB)
					const response = await notesAPI.createNote({
						content: noteToUpdate.content,
						category: 'daily'
					})
					
					// Update the ID to the MongoDB ID
					setNotes(prev => prev.map(note => 
						note.id === id ? { ...note, id: response.data.data._id } : note
					))
				} else {
					// This is an existing note
					await notesAPI.updateNote(id, {
						content: noteToUpdate.content
					})
				}
			} catch (error) {
				console.error('Error updating note:', error)
			}
		} else {
			// For non-authenticated users, save to localStorage
			localStorage.setItem('todaysNotes', JSON.stringify(updatedNotes))
		}
	}

	const handleKeyDown = async (id, content, e) => {
		if (e.key === 'Backspace' && content.trim() === '') {
			const updatedNotes = notes.filter(note => note.id !== id)
			setNotes(updatedNotes)
			
			// Delete from backend if authenticated
			if (isAuthenticated && id.length === 24) {
				try {
					await notesAPI.deleteNote(id)
				} catch (error) {
					console.error('Error deleting note:', error)
				}
			} else {
				// For non-authenticated users, save to localStorage
				localStorage.setItem('todaysNotes', JSON.stringify(updatedNotes))
			}
			
			e.preventDefault()
		}
	}

	if (loading) {
		return (
			<div className='w-full min-h-[400px] rounded-lg p-5 flex items-center justify-center'>
				<div className="text-white">Loading notes...</div>
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