import React from 'react'
import { isDateInRange } from './timeline_utils'

const TaskDiagram = ({ tasks, currentDate }) => {
	const currentMonth = currentDate.getMonth()
	const currentYear = currentDate.getFullYear()
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

	// Створюємо масив днів для заголовків
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

	// Фільтруємо завдання, які потрапляють у поточний місяць
	const visibleTasks = tasks.filter(task => {
		const taskStart = new Date(task.start)
		const taskEnd = new Date(task.end)
		const monthStart = new Date(currentYear, currentMonth, 1)
		const monthEnd = new Date(currentYear, currentMonth, daysInMonth)
		return (
			isDateInRange(taskStart, monthStart, monthEnd) ||
			isDateInRange(taskEnd, monthStart, monthEnd) ||
			(taskStart <= monthStart && taskEnd >= monthEnd)
		)
	})

	return (
		<div className='p-4'>
			{/* Заголовки днів */}
			<div className='flex border-b border-gray-700'>
				<div className='w-48 flex-shrink-0' /> {/* Місце для назви завдання */}
				{days.map(day => (
					<div
						key={day}
						className='w-10 flex-shrink-0 text-center text-gray-400 text-sm'
					>
						{day}
					</div>
				))}
			</div>

			{/* Діаграма завдань */}
			<div className='space-y-2 mt-2'>
				{visibleTasks.map(task => {
					const taskStart = new Date(task.start)
					const taskEnd = new Date(task.end)
					const startDay =
						taskStart.getMonth() === currentMonth ? taskStart.getDate() : 1
					const endDay =
						taskEnd.getMonth() === currentMonth
							? taskEnd.getDate()
							: daysInMonth
					const width = (endDay - startDay + 1) * 40 // 40px на день
					const offset = (startDay - 1) * 40 // Зсув у пікселях

					return (
						<div key={task.id} className='flex items-center'>
							{/* Назва завдання та статус */}
							<div className='w-48 flex-shrink-0 flex items-center gap-2 text-gray-200'>
								<span>{task.title}</span>
								<span className='text-gray-400 text-sm flex items-center gap-1'>
									<span className='w-2 h-2 rounded-full bg-gray-400' />
									Not started
								</span>
							</div>
							{/* Смуга завдання */}
							<div className='relative flex-1'>
								<div
									className='h-8 rounded bg-gray-700'
									style={{
										width: `${width}px`,
										marginLeft: `${offset}px`,
									}}
								/>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default TaskDiagram
