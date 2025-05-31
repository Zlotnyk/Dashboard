import React from 'react'
import StaticCard from './static_card'
import AnimatedCard from './animated_card'

const FlipUnitContainer = ({ digit, shuffle, unit, dayOfWeek }) => {
	// Calculate current and previous digits
	let currentDigit = digit
	let previousDigit = digit - 1

	// Handle wrapping for hours and minutes
	if (unit !== 'hours') {
		previousDigit = previousDigit === -1 ? 59 : previousDigit
	} else {
		previousDigit = previousDigit === -1 ? 23 : previousDigit
	}

	// Format digits with leading zeros
	const formattedCurrent =
		currentDigit < 10 ? `0${currentDigit}` : `${currentDigit}`
	const formattedPrevious =
		previousDigit < 10 ? `0${previousDigit}` : `${previousDigit}`

	// Determine which digits to display based on shuffle state
	const digit1 = shuffle ? formattedPrevious : formattedCurrent
	const digit2 = !shuffle ? formattedPrevious : formattedCurrent

	// Determine animations based on shuffle state
	const animation1 = shuffle ? 'fold' : 'unfold'
	const animation2 = !shuffle ? 'fold' : 'unfold'

	return (
		<div className='flip-unit-container'>
			<StaticCard position='upper-card' digit={formattedCurrent} />
			<StaticCard position='lower-card' digit={formattedPrevious} />
			<AnimatedCard digit={digit1} animation={animation1} />
			<AnimatedCard digit={digit2} animation={animation2} />
			{unit === 'minutes' && dayOfWeek && (
				<div className='day-of-week'>{dayOfWeek}</div>
			)}
		</div>
	)
}

export default FlipUnitContainer
