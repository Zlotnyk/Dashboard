import { useState, useEffect } from 'react'

export const useFlipClock = () => {
	const [time, setTime] = useState({
		hours: 0,
		minutes: 0,
		dayOfWeek: '',
	})

	const [flips, setFlips] = useState({
		hoursShuffle: true,
		minutesShuffle: true,
	})

	useEffect(() => {
		const updateTime = () => {
			const now = new Date()
			const newHours = now.getHours()
			const newMinutes = now.getMinutes()
			const newDayOfWeek = now.toLocaleString('en-US', { weekday: 'long' })

			// Only update time state if values have actually changed
			if (newHours !== time.hours || 
				newMinutes !== time.minutes || 
				newDayOfWeek !== time.dayOfWeek) {
				
				// Update flip animations if hours or minutes changed
				if (newHours !== time.hours) {
					setFlips(prev => ({ ...prev, hoursShuffle: !prev.hoursShuffle }))
				}

				if (newMinutes !== time.minutes) {
					setFlips(prev => ({ ...prev, minutesShuffle: !prev.minutesShuffle }))
				}

				// Update time values
				setTime({
					hours: newHours,
					minutes: newMinutes,
					dayOfWeek: newDayOfWeek,
				})
			}
		}

		updateTime() // Initial update

		const timerID = setInterval(updateTime, 1000)

		return () => clearInterval(timerID) // Cleanup
	}, []) // Remove time from dependencies since we're accessing it inside updateTime

	return { time, flips }
}