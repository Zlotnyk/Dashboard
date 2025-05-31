import React from 'react'
import FlipUnitContainer from './flip_unit_container'
import '../../App.css'
import { useFlipClock } from './use_flipclock'

const FlipClock = () => {
	const { time, flips } = useFlipClock()

	return (
		<div className='flex flex-col items-center'>
			<div className='flip-clock-container p-2'>
				<FlipUnitContainer
					unit='hours'
					digit={time.hours}
					shuffle={flips.hoursShuffle}
				/>
				<FlipUnitContainer
					unit='minutes'
					digit={time.minutes}
					shuffle={flips.minutesShuffle}
					dayOfWeek={time.dayOfWeek}
				/>
			</div>
		</div>
	)
}

export default FlipClock
