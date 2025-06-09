import React, { useState, useEffect } from 'react'
import '../App.css'

const GifContainer = () => {
  const [currentGif, setCurrentGif] = useState('Green.gif')
  const [imageError, setImageError] = useState(false)
  const [fallbackColor, setFallbackColor] = useState('#97e7aa')

  useEffect(() => {
    // Load saved background GIF from localStorage
    const savedGif = localStorage.getItem('backgroundGif')
    const savedColor = localStorage.getItem('accentColor')
    
    if (savedGif) {
      setCurrentGif(savedGif)
    }
    if (savedColor) {
      setFallbackColor(savedColor)
    }

    // Listen for theme changes
    const handleThemeChange = (event) => {
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

  return (
    <div className='gif-container'>
      {!imageError ? (
        <img 
          src={`src/assets/img/${currentGif}`} 
          alt='Background Animation'
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageError ? 'none' : 'block' }}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ 
            backgroundColor: fallbackColor,
            background: `linear-gradient(135deg, ${fallbackColor}, ${fallbackColor}dd)`
          }}
        >
          <div className="text-white text-2xl font-bold opacity-20">
            {currentGif.replace('.gif', '').toUpperCase()}
          </div>
        </div>
      )}
    </div>
  )
}

export default GifContainer