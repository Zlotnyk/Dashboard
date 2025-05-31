import React from 'react'
import { isSameDay } from './timeline_utils'

const TaskList = ({ tasks, selectedDate }) => {
	// Filter tasks that match the selected date
	const visibleTasks = tasks.filter(
		task =>
			isSameDay(task.start, selectedDate) || isSameDay(task.end, selectedDate)
	)

	return (
		<div className='p-4'>
			<h3 className='text-lg font-medium mb-2'>
				Tasks for{' '}
				{selectedDate.toLocaleDateString('en-US', {
					weekday: 'long',
					month: 'long',
					day: 'numeric',
					year: 'numeric',
				})}
			</h3>
			{visibleTasks.length === 0 ? (
				<p className='text-gray-400'>No tasks for this day.</p>
			) : (
				<div className='space-y-2'>
					{visibleTasks.map(task => (
						<div
							key={task.id}
							className='flex items-center p-2 rounded bg-gray-800'
						>
							<div
								className='w-4 h-4 rounded mr-2'
								style={{ backgroundColor: task.color || '#3B82F6' }}
							></div>
							<span className='text-gray-200'>{task.title}</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default TaskList
