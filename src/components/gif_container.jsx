import React, { useState, useEffect, useRef } from 'react'
import { Lock, Unlock, Check, X, RotateCcw } from 'lucide-react'
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
		
		// Prevent default to avoid image dragging
		e.preventDefault()
	}

	const handleMouseMove = (e) => {
		if (!isDragging || !isSettingsMode) return

		const rect = containerRef.current.getBoundingClientRect()
		const newX = e.clientX - rect.left - dragStart.x
		const newY = e.clientY - rect.top - dragStart.y

		// Allow movement beyond container bounds for better positioning
		setImagePosition({ x: newX, y: newY })
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

	// Change cursor when in settings mode
	useEffect(() => {
		if (isSettingsMode) {
			document.body.style.cursor = 'move'
		} else {
			document.body.style.cursor = 'default'
		}

		return () => {
			document.body.style.cursor = 'default'
		}
	}, [isSettingsMode])

	return (
		<div 
			ref={containerRef}
			className='gif-container relative overflow-hidden'
		>
			{/* Lock/Unlock Button */}
			<button
				onClick={handleSettingsClick}
				className={`absolute top-3 right-3 z-20 p-1.5 rounded-md transition-all duration-200 ${
					isSettingsMode 
						? 'bg-red-500/80 text-white shadow-lg scale-110' 
						: 'bg-black/40 text-white/60 hover:bg-black/60 hover:text-white hover:scale-105'
				}`}
				title={isSettingsMode ? "Lock position" : "Unlock to adjust position"}
			>
				{isSettingsMode ? <Unlock size={14} /> : <Lock size={14} />}
			</button>

			{/* Settings Controls */}
			{isSettingsMode && (
				<div className="absolute top-3 left-3 z-20 bg-black/90 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 shadow-lg">
					<div className="flex items-center gap-1 text-white text-xs">
						<span>🖱️</span>
						<span>Drag to move</span>
					</div>
					<div className="w-px h-4 bg-gray-600"></div>
					<button
						onClick={handleResetPosition}
						className="p-1 text-gray-400 hover:text-white transition-colors"
						title="Reset position"
					>
						<RotateCcw size={12} />
					</button>
					<button
						onClick={handleCancelSettings}
						className="p-1 text-red-400 hover:text-red-300 transition-colors"
						title="Cancel"
					>
						<X size={12} />
					</button>
					<button
						onClick={handleSavePosition}
						className="p-1 text-green-400 hover:text-green-300 transition-colors"
						title="Save & lock position"
					>
						<Check size={12} />
					</button>
				</div>
			)}

			{/* Settings Mode Overlay - No blur, just subtle border */}
			{isSettingsMode && (
				<div className="absolute inset-0 z-10 pointer-events-none">
					<div className="absolute inset-2 border-2 border-dashed border-red-400/60 rounded-lg"></div>
					{/* Helper text */}
					<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded-full">
						Drag the image to reposition
					</div>
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
					className={`w-full h-full object-cover transition-all duration-200 select-none ${
						isSettingsMode 
							? 'cursor-move' 
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