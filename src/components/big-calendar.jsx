import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

const BigCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const today = new Date()
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Get days from previous month to fill the grid
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()
  const prevMonthDays = []
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i)
  }
  
  // Get days for current month
  const currentMonthDays = []
  for (let day = 1; day <= daysInMonth; day++) {
    currentMonthDays.push(day)
  }
  
  // Get days from next month to fill the grid
  const totalCells = 42 // 6 rows × 7 days
  const remainingCells = totalCells - prevMonthDays.length - currentMonthDays.length
  const nextMonthDays = []
  for (let day = 1; day <= remainingCells; day++) {
    nextMonthDays.push(day)
  }
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentMonth + direction)
    setCurrentDate(newDate)
  }
  
  const isToday = (day) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="w-full bg-[#1a1a1a] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl font-[Libre_Baskerville] italic text-[#e0e0e0]">
            Upcoming Meetings
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <ChevronLeft size={16} className="text-gray-400" />
            </button>
            <span className="text-white text-base font-medium min-w-[120px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          
          <button 
            className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded"
            onClick={goToToday}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="h-10 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-400">{day}</span>
          </div>
        ))}
        
        {/* Previous Month Days */}
        {prevMonthDays.map(day => (
          <div key={`prev-${day}`} className="h-20 border border-gray-800 bg-gray-900/50 p-2">
            <span className="text-sm text-gray-600">{day}</span>
          </div>
        ))}
        
        {/* Current Month Days */}
        {currentMonthDays.map(day => (
          <div 
            key={day} 
            className={`h-20 border border-gray-800 p-2 hover:bg-gray-800/50 cursor-pointer relative group ${
              isToday(day) ? 'bg-[#97e7aa]/20 border-[#97e7aa]' : 'bg-gray-900/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                isToday(day) ? 'text-[#97e7aa] font-bold' : 'text-gray-300'
              }`}>
                {day}
              </span>
              <Plus 
                size={12} 
                className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#97e7aa]" 
              />
            </div>
            
            {/* Sample events */}
            {day === 9 && (
              <div className="mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            )}
          </div>
        ))}
        
        {/* Next Month Days */}
        {nextMonthDays.map(day => (
          <div key={`next-${day}`} className="h-20 border border-gray-800 bg-gray-900/50 p-2">
            <span className="text-sm text-gray-600">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BigCalendar