import React, { useState } from 'react'
import Navbar from '../components/navbar'
import GifContainer from '../components/gif_container'
import WavyLines from '../components/wavy-lines'
import FlipClock from '../components/FlipClock/'
import BigCalendar from '../components/big-calendar'
import '../App.css'

function LifestylePage() {
  const [events, setEvents] = useState([])

  const handleEventAdd = event => {
    setEvents(prevEvents => [...prevEvents, event])
  }

  const handleEventDelete = eventId => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
  }

  return (
    <div>
      {/* Navbar at the very top */}
      <Navbar />

      <header className="relative">
        <GifContainer />
      </header>

      {/* Header content between photo and wavy lines */}
      <div className="bg-[#1a1a1a] py-8">
        <div className="w-full">
          {/* Title and Quote Block - positioned parallel to wavy line */}
          <div className="flex flex-col items-start mb-6 pl-16">
            {/* Title - positioned slightly to the right */}
            <h1 className="text-4xl font-bold text-white mb-4 font-[Libre_Baskerville]">
              Lifestyle
            </h1>
            
            {/* Quote with left border - positioned parallel to wavy line */}
            <div className="flex items-start mb-6 -ml-4">
              <div className="w-0.5 h-8 bg-[#97e7aa] mr-4 flex-shrink-0"></div>
              <blockquote className="text-lg italic text-white/90 font-[Libre_Baskerville] leading-relaxed">
                "Life is what happens when you're busy making other plans."
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      <WavyLines />

      <main className='flex w-full h-screen select-none'>
        {/* Left Section - Clock */}
        <section className='flex flex-col p-4 gap-4' style={{ width: '25%' }}>
          <FlipClock />
        </section>

        {/* Center Section - Calendar */}
        <section className='flex flex-col p-4 gap-4' style={{ width: '75%' }}>
          <BigCalendar 
            events={events}
            onAddEvent={handleEventAdd}
            onDeleteEvent={handleEventDelete}
          />
        </section>
      </main>
    </div>
  )
}

export default LifestylePage