import React, { useState } from 'react'
import { Plus, FileText, Pencil } from 'lucide-react'

export default function TodoList({
	onAddTask,
	onUpdateTask,
	onDeleteTask,
	tasks,
	selectedDate,
}) {
	const [editingId, setEditingId] = useState(null)
	const [editingText, setEditingText] = useState('')
	const [editingStart, setEditingStart] = useState('')
	const [editingEnd, setEditingEnd] = useState('')

	const addTodo = () => {
		const newTodo = {
			id: crypto.randomUUID(),
			title: 'New Task',
			start: new Date(selectedDate),
			end: new Date(selectedDate),
			progress: 0,
			color: '#3B82F6',
		}
		onAddTask(newTodo)
	}

	const startEditing = task => {
		setEditingId(task.id)
		setEditingText(task.title)
		setEditingStart(task.start.toISOString().split('T')[0])
		setEditingEnd(task.end.toISOString().split('T')[0])
	}

	const finishEditing = () => {
		if (!editingText.trim()) return
		onUpdateTask({
			id: editingId,
			title: editingText,
			start: new Date(editingStart),
			end: new Date(editingEnd),
			progress: 0,
			color: '#3B82F6',
		})
		setEditingId(null)
		setEditingText('')
		setEditingStart('')
		setEditingEnd('')
	}

	return (
		<div className='w-full min-h-[400px] rounded-lg p-5'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl font-[Libre_Baskerville] italic text-[#e0e0e0]'>
					To-Do List
				</h2>
				<button
					className='flex items-center gap-2 px-4 py-2 bg-[#97e7aa] text-white rounded-lg hover:bg-[#75b384] text-base'
					onClick={addTodo}
				>
					<Plus size={20} />
					New
				</button>
			</div>

			<div className='space-y-3'>
				{tasks.map(task => (
					<div
						key={task.id}
						className='flex items-center justify-between p-2 rounded'
					>
						<div className='flex items-center gap-2 flex-1'>
							<FileText size={20} className='text-[#a0a0a0]' />
							{editingId === task.id ? (
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
										className='bg-transparent outline-none text-[#a0a0a0] w-full text-base'
									/>
									<input
										type='date'
										value={editingStart}
										onChange={e => setEditingStart(e.target.value)}
										className='bg-transparent outline-none text-[#a0a0a0] text-base'
									/>
									<input
										type='date'
										value={editingEnd}
										onChange={e => setEditingEnd(e.target.value)}
										className='bg-transparent outline-none text-[#a0a0a0] text-base'
									/>
								</div>
							) : (
								<div className='flex flex-col'>
									<span className='text-[#a0a0a0] text-base'>{task.title}</span>
									<span className='text-[#a0a0a0] text-sm'>
										{task.start.toLocaleDateString()}
									</span>
								</div>
							)}
							{editingId !== task.id && (
								<button
									onClick={() => startEditing(task)}
									className='border border-gray-500 rounded p-1 hover:bg-gray-700 ml-2'
									title='Edit'
								>
									<Pencil size={16} className='text-gray-400' />
								</button>
							)}
						</div>

						<input
							type='checkbox'
							onChange={() => onDeleteTask(task.id)}
							className='w-4 h-4 cursor-pointer bg-transparent appearance-none border border-gray-400 rounded checked:bg-blue-500 checked:border-transparent'
							title='Delete'
						/>
					</div>
				))}

				<div
					className='flex items-center gap-3 p-2 hover:bg-[#333] rounded cursor-pointer'
					onClick={addTodo}
				>
					<Plus size={20} className='text-[#a0a0a0]' />
					<span className='text-[#a0a0a0] text-base'>New task</span>
				</div>
			</div>
		</div>
	)
}
