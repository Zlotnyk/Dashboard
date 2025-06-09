export const generateMockTasks = () => {
	return [
		{
			id: '1',
			title: '12314',
			start: new Date(2025, 5, 6), // June 6, 2025
			end: new Date(2025, 5, 10), // June 10, 2025
			progress: 0,
			status: 'Not started',
			color: '#97e7aa'
		},
		{
			id: '2',
			title: 'New page',
			start: new Date(2025, 5, 1), // June 1, 2025
			end: new Date(2025, 5, 4), // June 4, 2025
			progress: 0,
			status: 'Not started',
			color: '#97e7aa'
		},
		{
			id: '3',
			title: 'New page',
			start: new Date(2025, 5, 1), // June 1, 2025
			end: new Date(2025, 5, 3), // June 3, 2025
			progress: 0,
			status: 'Not started',
			color: '#97e7aa'
		}
	]
}

export const formatDate = (date) => {
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	})
}

export const getDaysInMonth = (year, month) => {
	return new Date(year, month + 1, 0).getDate()
}

export const getMonthName = (month) => {
	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	]
	return monthNames[month]
}