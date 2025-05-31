import React from 'react'

const AnimatedCard = ({ digit, animation }) => {
	return (
		<div className={`animated-card ${animation}`}>
			<span>{digit}</span>
		</div>
	)
}

export default AnimatedCard
