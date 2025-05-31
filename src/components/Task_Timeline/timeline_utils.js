// Date utility functions
export const getDaysInMonth = (year, month) => {
	return new Date(year, month + 1, 0).getDate()
}

export const isSameDay = (date1, date2) => {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	)
}

export const isDateInRange = (date, startDate, endDate) => {
	return date >= startDate && date <= endDate
}

export const formatShortDate = date => {
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const formatShortDateTime = date => {
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

// Generate mock data for the timeline
export const generateMockTasks = () => {
	return [
		{
			id: 'task-1',
			title: 'Project Research',
			start: new Date(2025, 4, 5),
			end: new Date(2025, 4, 14),
			progress: 70,
			color: '#3B82F6', // blue
		},
		{
			id: 'task-2',
			title: 'Design Phase',
			start: new Date(2025, 4, 8),
			end: new Date(2025, 4, 16),
			progress: 30,
			color: '#10B981', // green
		},
		{
			id: 'task-3',
			title: 'Development',
			start: new Date(2025, 4, 12),
			end: new Date(2025, 4, 22),
			progress: 10,
			color: '#F59E0B', // amber
		},
	]
}
