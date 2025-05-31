import React, { useRef } from 'react'

const VerticalResizer = ({ onDrag }) => {
	const isDragging = useRef(false)
	const startX = useRef(0)

	const handleMouseDown = e => {
		isDragging.current = true
		startX.current = e.clientX
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
	}

	const handleMouseMove = e => {
		if (!isDragging.current) return
		const deltaPx = e.clientX - startX.current
		const screenWidth = window.innerWidth
		const deltaPercent = (deltaPx / screenWidth) * 100
		onDrag(deltaPercent)
		startX.current = e.clientX
	}

	const handleMouseUp = () => {
		isDragging.current = false
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', handleMouseUp)
	}

	return (
		<div
			className='w-1 bg-gray-400 cursor-col-resize'
			onMouseDown={handleMouseDown}
		/>
	)
}

export default VerticalResizer
