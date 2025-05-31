import React from 'react'
import { Plus } from 'lucide-react'

const TimelineToolbar = ({ onAddTask }) => {
	return (
		<div className='px-4 py-3 border-t border-gray-700 flex items-center'>
			<button
				onClick={onAddTask}
				className='flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-500 text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'
			>
				<Plus size={16} />
				<span>New</span>
			</button>
		</div>
	)
}

export default TimelineToolbar
