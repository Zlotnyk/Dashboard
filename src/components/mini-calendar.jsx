import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MiniCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  // Changed to start with Monday
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const today = new Date()
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Adjust starting day to make Monday = 0
  let startingDayOfWeek = firstDayOfMonth.getDay()
  startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
  
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

  return (
    <div className="w-full bg-[#1a1a1a] rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <ChevronLeft size={14} className="text-gray-400" />
        </button>
        <span className="text-white text-sm font-medium">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <ChevronRight size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="h-6 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-400">{day}</span>
          </div>
        ))}
        
        {/* Previous Month Days */}
        {prevMonthDays.map(day => (
          <div key={`prev-${day}`} className="h-6 flex items-center justify-center">
            <span className="text-xs text-gray-600">{day}</span>
          </div>
        ))}
        
        {/* Current Month Days */}
        {currentMonthDays.map(day => (
          <div 
            key={day} 
            className={`h-6 flex items-center justify-center cursor-pointer rounded ${
              isToday(day) 
                ? 'bg-accent text-white font-bold' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xs">{day}</span>
          </div>
        ))}
        
        {/* Next Month Days */}
        {nextMonthDays.map(day => (
          <div key={`next-${day}`} className="h-6 flex items-center justify-center">
            <span className="text-xs text-gray-600">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MiniCalendar