export const generateMockTasks = () => {
	// Return empty array for clean start
	return []
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

// Utility function to snap date to day boundary
export const snapToDay = (date) => {
	const snapped = new Date(date)
	snapped.setHours(0, 0, 0, 0)
	return snapped
}

// Utility function to calculate task duration in days
export const getTaskDuration = (startDate, endDate) => {
	const start = new Date(startDate)
	const end = new Date(endDate)
	const diffTime = Math.abs(end - start)
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Utility function to check if task overlaps with date range
export const taskOverlapsRange = (task, rangeStart, rangeEnd) => {
	const taskStart = new Date(task.start)
	const taskEnd = new Date(task.end)
	return taskStart <= rangeEnd && taskEnd >= rangeStart
}

// Utility function to check if a date is within a range
export const isDateInRange = (date, rangeStart, rangeEnd) => {
	return date >= rangeStart && date <= rangeEnd
}

// Format date to YYYY-MM-DD string in local timezone
export const formatDateToYYYYMMDD = (date) => {
	if (!date) return '';
	
	const d = new Date(date);
	const year = d.getFullYear();
	// getMonth() is 0-indexed, so add 1 and pad with leading zero if needed
	const month = String(d.getMonth() + 1).padStart(2, '0');
	// getDate() returns the day of month, pad with leading zero if needed
	const day = String(d.getDate()).padStart(2, '0');
	
	return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD string to Date object preserving local date
export const parseYYYYMMDDToDate = (dateString) => {
	if (!dateString) return new Date();
	
	const [year, month, day] = dateString.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	return date;
}