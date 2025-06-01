import React, { useMemo } from 'react'
import { getDaysInMonth, isSameDay } from './timeline_utils'

const TimelineCalendar = ({ currentDate, selectedDate, onDateSelect }) => {
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

  const getMonthName = monthIndex => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return months[monthIndex]
  }

  return (
    <div className='border-b border-gray-700'>
      <div className='flex'>
        <div className='flex flex-1'>
          {daysGrid.map((dayInfo, index) => {
            const isSelected = isSameDay(dayInfo.date, selectedDate)
            const isToday = isSameDay(dayInfo.date, new Date())

            return (
              <div
                key={`${dayInfo.year}-${dayInfo.month}-${dayInfo.day}`}
                className='w-10 flex flex-col items-center border-r border-gray-700'
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TimelineCalendar