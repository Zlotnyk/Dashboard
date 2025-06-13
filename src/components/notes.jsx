import React, { useState } from 'react'

export default function Notes({ notes = [], onAddNote, onUpdateNote, onDeleteNote }) {
	const [loading, setLoading] = useState(false)

	const handleContentChange = async (id, value) => {
		onUpdateNote(id, value)
	}

	const handleKeyDown = async (id, content, e) => {
		if (e.key === 'Backspace' && content.trim() === '') {
			onDeleteNote(id)
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
					onClick={onAddNote}
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