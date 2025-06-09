import React, { useState, useEffect, useRef } from 'react'
import { Settings, Move, Check, X } from 'lucide-react'
import '../App.css'

const GifContainer = () => {
	const [currentGif, setCurrentGif] = useState('Green.gif')
	const [imageError, setImageError] = useState(false)
	const [fallbackColor, setFallbackColor] = useState('#97e7aa')
	const [isSettingsMode, setIsSettingsMode] = useState(false)
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

	const handleSettingsClick = () => {
		setIsSettingsMode(!isSettingsMode)
	}

	const handleMouseDown = (e) => {
		if (!isSettingsMode) return
		
		setIsDragging(true)
		const rect = containerRef.current.getBoundingClientRect()
		setDragStart({
			x: e.clientX - rect.left - imagePosition.x,
			y: e.clientY - rect.top - imagePosition.y
		})
	}

	const handleMouseMove = (e) => {
		if (!isDragging || !isSettingsMode) return

		const rect = containerRef.current.getBoundingClientRect()
		const newX = e.clientX - rect.left - dragStart.x
		const newY = e.clientY - rect.top - dragStart.y

		// Constrain movement within container bounds
		const containerWidth = rect.width
		const containerHeight = rect.height
		const imageWidth = imageRef.current?.offsetWidth || 0
		const imageHeight = imageRef.current?.offsetHeight || 0

		const constrainedX = Math.max(-imageWidth / 2, Math.min(containerWidth - imageWidth / 2, newX))
		const constrainedY = Math.max(-imageHeight / 2, Math.min(containerHeight - imageHeight / 2, newY))

		setImagePosition({ x: constrainedX, y: constrainedY })
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	const handleSavePosition = () => {
		localStorage.setItem('gifPosition', JSON.stringify(imagePosition))
		setIsSettingsMode(false)
	}

	const handleResetPosition = () => {
		setImagePosition({ x: 0, y: 0 })
	}

	const handleCancelSettings = () => {
		// Reset to saved position
		const savedPosition = localStorage.getItem('gifPosition')
		if (savedPosition) {
			setImagePosition(JSON.parse(savedPosition))
		} else {
			setImagePosition({ x: 0, y: 0 })
		}
		setIsSettingsMode(false)
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
	}, [isDragging, dragStart, isSettingsMode])

	return (
		<div 
			ref={containerRef}
			className='gif-container relative overflow-hidden'
		>
			{/* Settings Button */}
			<button
				onClick={handleSettingsClick}
				className={`absolute top-4 right-4 z-20 p-2 rounded-lg transition-all duration-200 ${
					isSettingsMode 
						? 'bg-accent text-white shadow-lg' 
						: 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-white'
				}`}
				title="Adjust image position"
			>
				<Settings size={20} />
			</button>

			{/* Settings Controls */}
			{isSettingsMode && (
				<div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
					<div className="flex items-center gap-1 text-white text-sm">
						<Move size={16} />
						<span>Drag to adjust</span>
					</div>
					<div className="w-px h-6 bg-gray-600"></div>
					<button
						onClick={handleResetPosition}
						className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors"
					>
						Reset
					</button>
					<button
						onClick={handleCancelSettings}
						className="p-1 text-gray-400 hover:text-white transition-colors"
						title="Cancel"
					>
						<X size={16} />
					</button>
					<button
						onClick={handleSavePosition}
						className="p-1 text-green-400 hover:text-green-300 transition-colors"
						title="Save position"
					>
						<Check size={16} />
					</button>
				</div>
			)}

			{/* Settings Mode Overlay */}
			{isSettingsMode && (
				<div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px]">
					<div className="absolute inset-0 border-2 border-dashed border-accent/50"></div>
				</div>
			)}

			{!imageError ? (
				<img
					ref={imageRef}
					src={`src/assets/img/${currentGif}`}
					alt='Background Animation'
					onError={handleImageError}
					onLoad={handleImageLoad}
					onMouseDown={handleMouseDown}
					className={`w-full h-full object-cover transition-all duration-200 ${
						isSettingsMode 
							? 'cursor-move filter brightness-90' 
							: 'cursor-default'
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