import React, { useState } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import '../../App.css'

function StudyNotebookPage() {
  return (
    <div>
      <div>
        <Navbar />
        <header className='relative'>
          <GifContainer />
        </header>
        <HeaderContent title="Study Notebook" />
        <NavigationLinks />
        <WavyLines />
        <main className='flex w-full min-h-screen select-none'>
          {/* Left Section - 20% */}
          <section
            className='flex flex-col p-4 gap-4'
            style={{ width: '20%' }}
          >
            <FlipClock />
            <QuickLinks />
          </section>

          {/* Right Section - 80% */}
          <section
            className='flex flex-col p-4 gap-4 flex-1'
            style={{ width: '80%' }}
          >
            {/* Study Notebook Content */}
            <div className='bg-[#1a1a1a] rounded-lg p-6 min-h-[600px]'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                  Study Notebook
                </h2>
              </div>

              {/* Horizontal line under header */}
              <div className="w-full h-px bg-gray-700 mb-6"></div>

              {/* Study Notebook Grid */}
              <div className='bg-[#2a2a2a] rounded-lg p-4'>
                <div className='text-center text-gray-300 py-20'>
                  <div className='text-6xl mb-4'>📔</div>
                  <h3 className='text-xl font-medium mb-2'>Study Notebook Coming Soon</h3>
                  <p className='text-gray-400'>
                    We're building a digital study notebook to help you organize your notes and study materials.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default StudyNotebookPage