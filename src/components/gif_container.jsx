import React, { useState, useEffect, useRef } from 'react'
import { Lock, Unlock } from 'lucide-react'
import '../App.css'

const GifContainer = () => {
	const [currentGif, setCurrentGif] = useState('Green.gif')
	const [imageError, setImageError] = useState(false)
	const [fallbackColor, setFallbackColor] = useState('#97e7aa')
	const [isLocked, setIsLocked] = useState(true)
	const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
	const containerRef = useRef(null)
	const imageRef = useRef(null)

	useEffect(() => {
		// Load saved background GIF from localStorage
		const savedGif = localStorage.getItem('backgroundGif')
		const savedColor = localStorage.getItem('accentColor')
		const savedPosition = localStorage.getItem('gifPosition')

		if (savedGif) {
			setCurrentGif(savedGif)
		}
		if (savedColor) {
			setFallbackColor(savedColor)
		}
		if (savedPosition) {
			setImagePosition(JSON.parse(savedPosition))
		}

		// Listen for theme changes
		const handleThemeChange = event => {
			const { backgroundGif, accentColor } = event.detail
			setCurrentGif(backgroundGif)
			setFallbackColor(accentColor)
			setImageError(false) // Reset error state when changing theme
		}

		window.addEventListener('themeChange', handleThemeChange)

		return () => {
			window.removeEventListener('themeChange', handleThemeChange)
		}
	}, [])

	const handleImageError = () => {
		setImageError(true)
	}

	const handleImageLoad = () => {
		setImageError(false)
	}

	const handleLockToggle = () => {
		const newLockState = !isLocked
		setIsLocked(newLockState)
		
		// Save position when locking
		if (newLockState) {
			localStorage.setItem('gifPosition', JSON.stringify(imagePosition))
		}
	}

	const handleMouseDown = (e) => {
		if (isLocked) return
		
		setIsDragging(true)
		setDragStart({
			x: e.clientX - imagePosition.x,
			y: e.clientY - imagePosition.y
		})
		
		// Prevent default to avoid image dragging
		e.preventDefault()
	}

	const handleMouseMove = (e) => {
		if (!isDragging || isLocked) return

		const newX = e.clientX - dragStart.x
		const newY = e.clientY - dragStart.y

		setImagePosition({ x: newX, y: newY })
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	// Add global mouse event listeners when dragging
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, dragStart, isLocked])

	return (
		<div 
			ref={containerRef}
			className='gif-container relative overflow-hidden'
		>
			{/* Lock/Unlock Button */}
			<button
				onClick={handleLockToggle}
				className={`absolute top-3 right-3 z-20 p-2 rounded-md transition-all duration-200 ${
					isLocked 
						? 'bg-black/40 text-white/60 hover:bg-black/60 hover:text-white' 
						: 'bg-red-500/80 text-white shadow-lg'
				}`}
				title={isLocked ? "Unlock to move image" : "Lock image position"}
			>
				{isLocked ? <Lock size={16} /> : <Unlock size={16} />}
			</button>

			{!imageError ? (
				<img
					ref={imageRef}
					src={`src/assets/img/${currentGif}`}
					alt='Background Animation'
					onError={handleImageError}
					onLoad={handleImageLoad}
					onMouseDown={handleMouseDown}
					className={`absolute top-0 left-0 min-w-full min-h-full object-cover transition-all duration-200 select-none ${
						isLocked 
							? 'cursor-default' 
							: 'cursor-move'
					}`}
					style={{ 
						display: imageError ? 'none' : 'block',
						transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
						userSelect: 'none'
					}}
					draggable={false}
				/>
			) : (
				<div
					className='w-full h-full flex items-center justify-center'
					style={{
						backgroundColor: fallbackColor,
						background: `linear-gradient(135deg, ${fallbackColor}, ${fallbackColor}dd)`,
					}}
				>
					<div className='text-white text-2xl font-bold opacity-20'>
						{currentGif.replace('.gif', '').toUpperCase()}
					</div>
				</div>
			)}
		</div>
	)
}

export default GifContainer