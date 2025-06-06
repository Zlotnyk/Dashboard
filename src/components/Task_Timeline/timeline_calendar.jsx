import React, { useMemo, useState } from 'react'
import { getDaysInMonth, isSameDay } from './timeline_utils'
import { Plus } from 'lucide-react'

const TimelineCalendar = ({ currentDate, selectedDate, onDateSelect, onAddTask }) => {
  const [hoveredDate, setHoveredDate] = useState(null)
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const daysGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const result = []

    // Get all days of the current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      result.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      })
    }

    return result
  }, [currentYear, currentMonth])

  const handleAddTaskOnDate = (date, e) => {
    e.stopPropagation()
    const newTask = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      start: new Date(date),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      progress: 0,
      color: '#3B82F6',
    }
    onAddTask(newTask)
  }

  return (
    <div className='border-b border-gray-700'>
      <div className='flex'>
        <div className='flex flex-1'>
          {daysGrid.map((dayInfo, index) => {
            const isSelected = isSameDay(dayInfo.date, selectedDate)
            const isToday = isSameDay(dayInfo.date, new Date())
            const isHovered = hoveredDate && isSameDay(hoveredDate, dayInfo.date)

            return (
              <div
                key={`${dayInfo.year}-${dayInfo.month}-${dayInfo.day}`}
                className='w-10 flex flex-col items-center border-r border-gray-700 relative'
                onMouseEnter={() => setHoveredDate(dayInfo.date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <button
                  onClick={() => onDateSelect(dayInfo.date)}
                  className={`w-10 h-10 flex items-center justify-center relative
                    ${
                      isSelected
                        ? 'font-medium text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }
                    transition-colors`}
                >
                  {dayInfo.day}
                  {isSelected && (
                    <div className='absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full'></div>
                  )}
                </button>
                
                {isHovered && (
                  <button
                    onClick={(e) => handleAddTaskOnDate(dayInfo.date, e)}
                    className='absolute top-10 w-8 h-6 bg-gray-600 bg-opacity-70 hover:bg-opacity-90 rounded flex items-center justify-center transition-all z-10'
                    title='Add task on this date'
                  >
                    <Plus size={12} className='text-white' />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TimelineCalendar