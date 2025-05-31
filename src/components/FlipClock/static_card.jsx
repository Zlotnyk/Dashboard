import React from 'react'

const StaticCard = ({ position, digit }) => {
	return (
		<div className={`static-card ${position}`}>
			<span>{digit}</span>
		</div>
	)
}

export default StaticCard
