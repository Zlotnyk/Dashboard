import React, { useState, useEffect } from 'react'
import { Edit, Trash2 } from 'lucide-react'

export default function Notes({ notes = [], onAddNote, onUpdateNote, onDeleteNote }) {
	const [loading, setLoading] = useState(false)
	const [editingId, setEditingId] = useState(null)
	const [editingContent, setEditingContent] = useState('')

	// Don't auto-create notes anymore
	// This was causing the issue with notes being added when navigating

	const handleContentChange = async (id, value) => {
		onUpdateNote(id, value)
	}

	const handleKeyDown = async (id, content, e) => {
		if (e.key === 'Backspace' && content.trim() === '') {
			onDeleteNote(id)
			e.preventDefault()
		}
	}

	const startEditing = (id, content) => {
		setEditingId(id)
		setEditingContent(content)
	}

	const saveEditing = () => {
		if (editingId) {
			onUpdateNote(editingId, editingContent)
			setEditingId(null)
			setEditingContent('')
		}
	}

	const handleDelete = (id, e) => {
		e.stopPropagation()
		onDeleteNote(id)
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
					onClick={onAddNote}
					className='px-3 py-1 bg-accent text-white rounded hover:bg-accent-80 text-sm'
				>
					Add a new note
				</button>
			</div>

			{/* Horizontal line under header */}
			<div className="w-full h-px bg-gray-700 mb-4"></div>

			{notes.length === 0 ? (
				<div className="text-gray-500 text-center py-8">
					No notes yet. Click "Add a new note" to get started.
				</div>
			) : (
				<ul className='list-disc pl-6 space-y-3'>
					{notes.map(note => (
						<li key={note.id} className='text-white group relative'>
							{editingId === note.id ? (
								<div className="flex flex-col gap-2">
									<textarea
										className='w-full bg-transparent text-white outline-none border border-gray-600 rounded p-2 focus:border-accent'
										value={editingContent}
										onChange={e => setEditingContent(e.target.value)}
										onBlur={saveEditing}
										onKeyDown={e => {
											if (e.key === 'Enter' && !e.shiftKey) {
												e.preventDefault()
												saveEditing()
											}
										}}
										autoFocus
										rows={3}
									/>
									<div className="flex justify-end">
										<button 
											onClick={saveEditing}
											className="text-xs bg-accent text-white px-2 py-1 rounded"
										>
											Save
										</button>
									</div>
								</div>
							) : (
								<div className="flex items-start">
									<input
										className='w-full bg-transparent text-white outline-none cursor-text'
										value={note.content}
										onChange={e => handleContentChange(note.id, e.target.value)}
										onKeyDown={e => handleKeyDown(note.id, note.content, e)}
										onClick={() => startEditing(note.id, note.content)}
										readOnly
									/>
									<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<button 
											onClick={() => startEditing(note.id, note.content)}
											className="text-gray-400 hover:text-white p-1"
											title="Edit note"
										>
											<Edit size={14} />
										</button>
										<button 
											onClick={(e) => handleDelete(note.id, e)}
											className="text-gray-400 hover:text-red-400 p-1"
											title="Delete note"
										>
											<Trash2 size={14} />
										</button>
									</div>
								</div>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}