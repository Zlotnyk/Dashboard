import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, Calendar, ChevronLeft, ChevronRight, Info, X, Edit, Trash2 } from 'lucide-react'
import '../../App.css'

function LifestyleMonthPage() {
  const [showInfoBox, setShowInfoBox] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthGoals, setMonthGoals] = useState([])
  const [monthNotes, setMonthNotes] = useState({})
  const [newGoal, setNewGoal] = useState("")
  
  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  // Day names
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    
    // Adjust first day to make Monday = 0
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1
    
    // Get days from previous month
    const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1)
    const prevMonthDays = []
    for (let i = 0; i < firstDayIndex; i++) {
      prevMonthDays.push({
        day: daysInPrevMonth - firstDayIndex + i + 1,
        month: currentMonth - 1,
        year: currentYear,
        isCurrentMonth: false
      })
    }
    
    // Get days for current month
    const currentMonthDays = []
    for (let day = 1; day <= daysInMonth; day++) {
      currentMonthDays.push({
        day,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      })
    }
    
    // Get days for next month
    const nextMonthDays = []
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length
    const remainingDays = 42 - totalDaysDisplayed // 6 rows of 7 days
    
    for (let day = 1; day <= remainingDays; day++) {
      nextMonthDays.push({
        day,
        month: currentMonth + 1,
        year: currentYear,
        isCurrentMonth: false
      })
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
  }
  
  // Navigate to previous or next month
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentMonth + direction)
    setCurrentDate(newDate)
  }
  
  // Go to current month
  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }
  
  // Check if a day is today
  const isToday = (day, month, year) => {
    const today = new Date()
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }
  
  // Format date key for storage
  const getDateKey = (day, month, year) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  
  // Load data from localStorage
  useEffect(() => {
    const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
    const savedData = localStorage.getItem(`monthPlanner_${monthKey}`)
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setMonthGoals(parsedData.monthGoals || [])
        setMonthNotes(parsedData.monthNotes || {})
      } catch (error) {
        console.error('Error parsing month planner data:', error)
      }
    } else {
      // Reset data for new month
      setMonthGoals([])
      setMonthNotes({})
    }
  }, [currentMonth, currentYear])
  
  // Save data to localStorage
  useEffect(() => {
    const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
    const dataToSave = {
      monthGoals,
      monthNotes
    }
    
    localStorage.setItem(`monthPlanner_${monthKey}`, JSON.stringify(dataToSave))
  }, [currentMonth, currentYear, monthGoals, monthNotes])
  
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setMonthGoals([...monthGoals, { id: crypto.randomUUID(), text: newGoal, completed: false }])
      setNewGoal("")
    }
  }
  
  const handleToggleGoal = (id) => {
    setMonthGoals(monthGoals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }
  
  const handleDeleteGoal = (id) => {
    setMonthGoals(monthGoals.filter(goal => goal.id !== id))
  }
  
  const handleDayNoteChange = (dateKey, note) => {
    setMonthNotes(prev => ({
      ...prev,
      [dateKey]: note
    }))
  }
  
  const calendarDays = generateCalendarDays()

  return (
    <div>
      <Navbar />
      <header className='relative'>
        <GifContainer />
      </header>
      <HeaderContent title="Month Planner" />
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
          {/* Month Planner Content */}
          <div className='rounded-lg p-6 min-h-[600px]'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                Month Planner
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <ChevronLeft size={16} className="text-gray-400" />
                </button>
                <span className="text-white text-base font-medium">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={goToCurrentMonth}
                  className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                >
                  This Month
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
                    <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Month Planner</p>
                    <p className="text-gray-300 text-sm italic">Get a bird's eye view of your month. Set monthly goals and add notes to specific days. Click on any day to add notes.</p>
                    <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Monthly Goals - 1 column */}
              <div className="lg:col-span-1">
                <div className="bg-[#1a1a1a] rounded-lg p-4 h-full">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Monthly Goals
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {monthGoals.map(goal => (
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
              
              {/* Monthly Calendar - 3 columns */}
              <div className="lg:col-span-3">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Monthly Calendar
                  </h3>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day Headers */}
                    {dayNames.map(day => (
                      <div key={day} className="text-center p-2 text-gray-400 font-medium">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar Days */}
                    {calendarDays.map((dayInfo, index) => {
                      const dateKey = getDateKey(dayInfo.day, dayInfo.month, dayInfo.year)
                      const dayNote = monthNotes[dateKey] || ''
                      const isCurrentDay = isToday(dayInfo.day, dayInfo.month, dayInfo.year)
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-2 min-h-[100px] rounded border ${
                            dayInfo.isCurrentMonth 
                              ? 'border-gray-700 bg-[#2a2a2a]' 
                              : 'border-gray-800 bg-[#222222] opacity-50'
                          } ${
                            isCurrentDay ? 'border-accent' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-medium ${
                              isCurrentDay 
                                ? 'text-accent' 
                                : dayInfo.isCurrentMonth ? 'text-white' : 'text-gray-500'
                            }`}>
                              {dayInfo.day}
                            </span>
                          </div>
                          
                          <textarea
                            value={dayNote}
                            onChange={(e) => handleDayNoteChange(dateKey, e.target.value)}
                            placeholder="Add note"
                            className="w-full h-[70px] bg-transparent text-xs text-gray-300 resize-none outline-none"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LifestyleMonthPage