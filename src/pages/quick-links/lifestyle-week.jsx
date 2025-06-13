import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, Calendar, Clock, X, ChevronLeft, ChevronRight, Info, Edit, Trash2 } from 'lucide-react'
import '../../App.css'

function LifestyleWeekPage() {
  const [showInfoBox, setShowInfoBox] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekSchedule, setWeekSchedule] = useState({})
  const [weekGoals, setWeekGoals] = useState([])
  const [newGoal, setNewGoal] = useState("")
  
  // Time slots for the schedule
  const timeSlots = [
    "5 am", "6 am", "7 am", "8 am", "9 am", "10 am", "11 am",
    "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm",
    "7 pm", "8 pm", "9 pm", "10 pm", "11 pm"
  ]
  
  // Days of the week
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  // Get the start and end of the current week
  const getWeekDates = (date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(date)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return { monday, sunday }
  }
  
  // Format date range for display
  const formatWeekRange = (date) => {
    const { monday, sunday } = getWeekDates(date)
    
    const mondayStr = monday.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric'
    })
    
    const sundayStr = sunday.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
    
    return `${mondayStr} - ${sundayStr}`
  }
  
  // Navigate to previous or next week
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }
  
  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentDate(new Date())
  }
  
  // Load data from localStorage
  useEffect(() => {
    const { monday } = getWeekDates(currentDate)
    const weekKey = monday.toISOString().split('T')[0]
    const savedData = localStorage.getItem(`weekPlanner_${weekKey}`)
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setWeekSchedule(parsedData.weekSchedule || {})
        setWeekGoals(parsedData.weekGoals || [])
      } catch (error) {
        console.error('Error parsing week planner data:', error)
      }
    } else {
      // Reset data for new week
      setWeekSchedule({})
      setWeekGoals([])
    }
  }, [currentDate])
  
  // Save data to localStorage
  useEffect(() => {
    const { monday } = getWeekDates(currentDate)
    const weekKey = monday.toISOString().split('T')[0]
    const dataToSave = {
      weekSchedule,
      weekGoals
    }
    
    localStorage.setItem(`weekPlanner_${weekKey}`, JSON.stringify(dataToSave))
  }, [currentDate, weekSchedule, weekGoals])
  
  const handleScheduleItemChange = (day, timeSlot, value) => {
    setWeekSchedule(prev => ({
      ...prev,
      [`${day}_${timeSlot}`]: value
    }))
  }
  
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setWeekGoals([...weekGoals, { id: crypto.randomUUID(), text: newGoal, completed: false }])
      setNewGoal("")
    }
  }
  
  const handleToggleGoal = (id) => {
    setWeekGoals(weekGoals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }
  
  const handleDeleteGoal = (id) => {
    setWeekGoals(weekGoals.filter(goal => goal.id !== id))
  }

  return (
    <div>
      <Navbar />
      <header className='relative'>
        <GifContainer />
      </header>
      <HeaderContent title="Week Planner" />
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
          {/* Week Planner Content */}
          <div className='rounded-lg p-6 min-h-[600px]'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                Week Planner
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <ChevronLeft size={16} className="text-gray-400" />
                </button>
                <span className="text-white text-base font-medium">
                  {formatWeekRange(currentDate)}
                </span>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-2 hover:bg-gray-700 rounded"
                >
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={goToCurrentWeek}
                  className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                >
                  This Week
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
                    <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Week Planner</p>
                    <p className="text-gray-300 text-sm italic">Plan your entire week in one view. Add tasks to specific days and times, and set weekly goals to stay on track.</p>
                    <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Weekly Goals - 1 column */}
              <div className="lg:col-span-1">
                <div className="bg-[#1a1a1a] rounded-lg p-4 h-full">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Weekly Goals
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {weekGoals.map(goal => (
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
              
              {/* Weekly Schedule - 3 columns */}
              <div className="lg:col-span-3">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Weekly Schedule
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2 text-gray-400 font-medium">Time</th>
                          {weekDays.map(day => (
                            <th key={day} className="text-left p-2 text-gray-400 font-medium">{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map(timeSlot => (
                          <tr key={timeSlot} className="border-t border-gray-700">
                            <td className="p-2 text-gray-300">{timeSlot}</td>
                            {weekDays.map(day => (
                              <td key={`${day}_${timeSlot}`} className="p-2">
                                <input
                                  type="text"
                                  value={weekSchedule[`${day}_${timeSlot}`] || ''}
                                  onChange={(e) => handleScheduleItemChange(day, timeSlot, e.target.value)}
                                  placeholder="Add task"
                                  className="w-full bg-transparent text-white outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default LifestyleWeekPage