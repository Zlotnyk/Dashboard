import React, { useMemo } from 'react'
import { getDaysInMonth, isSameDay, isDateInRange } from './timeline_utils'

const TimelineCalendar = ({
  currentDate,
  selectedDate,
  onDateSelect,
  tasks,
}) => {
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const daysGrid = useMemo(() => {
    const prevMonth = new Date(currentYear, currentMonth - 1, 1)
    const nextMonth = new Date(currentYear, currentMonth + 1, 1)

    const daysInPrevMonth = getDaysInMonth(
      prevMonth.getFullYear(),
      prevMonth.getMonth()
    )
    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth)

    const result = []

    // Previous month days
    for (let i = daysInPrevMonth - 4; i <= daysInPrevMonth; i++) {
      result.push({
        day: i,
        month: prevMonth.getMonth(),
        year: prevMonth.getFullYear(),
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      result.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      })
    }

    // Next month days
    for (let i = 1; i <= 5; i++) {
      result.push({
        day: i,
        month: nextMonth.getMonth(),
        year: nextMonth.getFullYear(),
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i),
        isCurrentMonth: false,
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
    <div className='overflow-x-auto border-b border-gray-700'>
      <div className='min-w-max'>
        <div className='flex border-b border-gray-700 pl-16'>
          <div className='font-medium px-4 py-2 flex-1'>
            {getMonthName(currentMonth)} {currentYear}
          </div>
        </div>

        <div className='relative'>
          {/* Days grid */}
          <div className='flex'>
            <div className='flex flex-1'>
              {daysGrid.map((dayInfo, index) => {
                const isSelected = isSameDay(dayInfo.date, selectedDate)
                const isToday = isSameDay(dayInfo.date, new Date())

                let monthLabel = null
                if (index > 0) {
                  const prevDay = daysGrid[index - 1]
                  if (prevDay.month !== dayInfo.month) {
                    monthLabel = getMonthName(dayInfo.month)
                  }
                }

                return (
                  <div
                    key={`${dayInfo.year}-${dayInfo.month}-${dayInfo.day}`}
                    className={`w-10 flex flex-col items-center border-r border-gray-700
                      ${!dayInfo.isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    {monthLabel && (
                      <div className='text-xs text-gray-400 w-full text-center mt-1'>
                        {monthLabel}
                      </div>
                    )}
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

          {/* Tasks timeline */}
          <div className='absolute top-12 left-0 right-0 p-2'>
            {tasks.map((task, index) => {
              const startIndex = daysGrid.findIndex(day =>
                isSameDay(day.date, task.start)
              )
              const endIndex = daysGrid.findIndex(day =>
                isSameDay(day.date, task.end)
              )
              
              if (startIndex === -1 || endIndex === -1) return null

              const width = (endIndex - startIndex + 1) * 40 // 40px is the width of each day column
              const left = startIndex * 40

              return (
                <div
                  key={task.id}
                  className='absolute h-8 rounded-full flex items-center px-3 text-sm text-white'
                  style={{
                    backgroundColor: task.color,
                    width: `${width}px`,
                    left: `${left}px`,
                    top: `${index * 40}px`,
                  }}
                >
                  <span className='truncate'>{task.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineCalendar