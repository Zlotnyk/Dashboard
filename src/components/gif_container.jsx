import React, { useState, useEffect } from 'react'
import '../App.css'
import { useAuth } from '../hooks/useAuth'

const GifContainer = () => {
	const { theme } = useAuth()
	const [imageError, setImageError] = useState(false)

	const handleImageError = () => {
		setImageError(true)
	}

	const handleImageLoad = () => {
		setImageError(false)
	}

	return (
		<div className='gif-container'>
			{!imageError ? (
				<img
					src={`src/assets/img/${theme.backgroundGif}`}
					alt='Background Animation'
					onError={handleImageError}
					onLoad={handleImageLoad}
					style={{ display: imageError ? 'none' : 'block' }}
				/>
			) : (
				<div
					className='w-full h-full flex items-center justify-center'
					style={{
						backgroundColor: theme.accentColor,
						background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentColor}dd)`,
					}}
				>
					<div className='text-white text-2xl font-bold opacity-20'>
						{theme.backgroundGif.replace('.gif', '').toUpperCase()}
					</div>
				</div>
			)}
		</div>
	)
}

export default GifContainer