import React, { useState, useEffect } from 'react'
import '../App.css'

const GifContainer = () => {
  const [currentGif, setCurrentGif] = useState('Green2.gif')

  useEffect(() => {
    // Load saved background GIF from localStorage
    const savedGif = localStorage.getItem('backgroundGif')
    if (savedGif) {
      setCurrentGif(savedGif)
    }

    // Listen for theme changes
    const handleThemeChange = (event) => {
      const { backgroundGif } = event.detail
      setCurrentGif(backgroundGif)
    }

    window.addEventListener('themeChange', handleThemeChange)

    return () => {
      window.removeEventListener('themeChange', handleThemeChange)
    }
  }, [])

  return (
    <div className='gif-container'>
      <img src={`src/assets/img/${currentGif}`} alt='Background Animation' />
    </div>
  )
}

export default GifContainer