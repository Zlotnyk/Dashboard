import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, Calendar, ChevronLeft, ChevronRight, Info, X, Edit, Trash2, Target } from 'lucide-react'
import '../../App.css'

function LifestyleYearPage() {
  const [showInfoBox, setShowInfoBox] = useState(true)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [yearGoals, setYearGoals] = useState([])
  const [yearHighlights, setYearHighlights] = useState({})
  const [newGoal, setNewGoal] = useState("")
  const [newHighlight, setNewHighlight] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(null)
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  // Navigate to previous or next year
  const navigateYear = (direction) => {
    setCurrentYear(currentYear + direction)
  }
  
  // Go to current year
  const goToCurrentYear = () => {
    setCurrentYear(new Date().getFullYear())
  }
  
  // Load data from localStorage
  useEffect(() => {
    const yearKey = `yearPlanner_${currentYear}`
    const savedData = localStorage.getItem(yearKey)
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setYearGoals(parsedData.yearGoals || [])
        setYearHighlights(parsedData.yearHighlights || {})
      } catch (error) {
        console.error('Error parsing year planner data:', error)
      }
    } else {
      // Reset data for new year
      setYearGoals([])
      setYearHighlights({})
    }
  }, [currentYear])
  
  // Save data to localStorage
  useEffect(() => {
    const yearKey = `yearPlanner_${currentYear}`
    const dataToSave = {
      yearGoals,
      yearHighlights
    }
    
    localStorage.setItem(yearKey, JSON.stringify(dataToSave))
  }, [currentYear, yearGoals, yearHighlights])
  
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setYearGoals([...yearGoals, { id: crypto.randomUUID(), text: newGoal, completed: false }])
      setNewGoal("")
    }
  }
  
  const handleToggleGoal = (id) => {
    setYearGoals(yearGoals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }
  
  const handleDeleteGoal = (id) => {
    setYearGoals(yearGoals.filter(goal => goal.id !== id))
  }
  
  const handleAddHighlight = () => {
    if (selectedMonth && newHighlight.trim()) {
      setYearHighlights(prev => ({
        ...prev,
        [selectedMonth]: [...(prev[selectedMonth] || []), { 
          id: crypto.randomUUID(), 
          text: newHighlight 
        }]
      }))
      setNewHighlight("")
    }
  }
  
  const handleDeleteHighlight = (month, id) => {
    setYearHighlights(prev => ({
      ...prev,
      [month]: prev[month].filter(highlight => highlight.id !== id)
    }))
  }
  
  // Check if a month is the current month
  const isCurrentMonth = (monthIndex) => {
    const today = new Date()
    return monthIndex === today.getMonth() && currentYear === today.getFullYear()
  }

  return (
    <div>
      <Navbar />
      <header className='relative'>
        <GifContainer />
      </header>
      <HeaderContent title="Year Planner" />
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
          {/* Year Planner Content */}
          <div className='rounded-lg p-6 min-h-[600px]'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                Year Planner
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateYear(-1)}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <ChevronLeft size={16} className="text-gray-400" />
                </button>
                <span className="text-white text-base font-medium">
                  {currentYear}
                </span>
                <button
                  onClick={() => navigateYear(1)}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={goToCurrentYear}
                  className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                >
                  This Year
                </button>
              </div>
            </div>

            {/* Horizontal line under header */}
            <div className="w-full h-px bg-gray-700 mb-6"></div>

            {/* Info Box with close button */}
            {showInfoBox && (
              <div className="border rounded-lg p-4 mb-6 relative" style={{ 
                backgroundColor: 'color-mix(in srgb, var(--accent-color) 20%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)'
              }}>
                <button
                  onClick={() => setShowInfoBox(false)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-black/20 transition-colors"
                  style={{ color: 'var(--accent-color)' }}
                >
                  <X size={16} />
                </button>
                <div className="flex items-start gap-3 pr-8">
                  <Info size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Year Planner</p>
                    <p className="text-gray-300 text-sm italic">Plan your entire year at a glance. Set yearly goals and add key highlights for each month. Click on a month to add highlights.</p>
                    <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Yearly Goals - 1 column */}
              <div className="lg:col-span-1">
                <div className="bg-[#1a1a1a] rounded-lg p-4 h-full">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    {currentYear} Goals
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {yearGoals.map(goal => (
                      <div key={goal.id} className="flex items-center gap-2 group">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={() => handleToggleGoal(goal.id)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: 'var(--accent-color)' }}
                        />
                        <div className={`text-gray-300 flex-1 ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                          {goal.text}
                        </div>
                        <button 
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white hover:bg-accent transition-colors"
                      onClick={handleAddGoal}
                    >
                      <Plus size={14} />
                    </button>
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add a new goal"
                      className="flex-1 bg-transparent border-b border-gray-600 focus:border-accent outline-none text-white py-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newGoal.trim()) {
                          handleAddGoal()
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Year Overview - 3 columns */}
              <div className="lg:col-span-3">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Year Overview
                  </h3>
                  
                  {/* Month Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {monthNames.map((month, index) => {
                      const isSelected = selectedMonth === index
                      const isCurrent = isCurrentMonth(index)
                      const highlights = yearHighlights[index] || []
                      
                      return (
                        <div 
                          key={month} 
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-accent/20 border border-accent/40' 
                              : isCurrent 
                                ? 'bg-[#2a2a2a] border border-accent/30' 
                                : 'bg-[#2a2a2a] border border-gray-700 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedMonth(index)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-medium ${isCurrent ? 'text-accent' : 'text-white'}`}>
                              {month}
                            </h4>
                            <Calendar size={14} className={isCurrent ? 'text-accent' : 'text-gray-400'} />
                          </div>
                          
                          <div className="space-y-1">
                            {highlights.length > 0 ? (
                              highlights.map(highlight => (
                                <div key={highlight.id} className="flex items-center gap-2 group">
                                  <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0"></div>
                                  <div className="text-gray-300 text-sm flex-1">{highlight.text}</div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteHighlight(index, highlight.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500 text-sm italic">No highlights</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Add Highlight Section */}
                  {selectedMonth !== null && (
                    <div className="bg-[#2a2a2a] rounded-lg p-4 border border-gray-700">
                      <h4 className="text-white font-medium mb-3">
                        Add Highlight for {monthNames[selectedMonth]}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-gray-400" />
                        <input
                          type="text"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          placeholder="Add a key event or highlight"
                          className="flex-1 bg-transparent border-b border-gray-600 focus:border-accent outline-none text-white py-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newHighlight.trim()) {
                              handleAddHighlight()
                            }
                          }}
                        />
                        <button 
                          className="px-3 py-1 bg-accent text-white rounded hover:bg-accent-80 transition-colors text-sm"
                          onClick={handleAddHighlight}
                          disabled={!newHighlight.trim()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LifestyleYearPage