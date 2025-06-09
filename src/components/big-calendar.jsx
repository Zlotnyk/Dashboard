import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Calendar, MapPin, Clock, ChevronDown, AlertCircle } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const BigCalendar = ({ events = [], onAddEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false)
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    category: 'meeting'
  })
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  // Changed to start with Monday
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
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

  const navigateYear = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(currentYear + direction)
    setCurrentDate(newDate)
  }

  const selectYear = (year) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(year)
    setCurrentDate(newDate)
    setIsYearPickerOpen(false)
  }

  const selectMonth = (monthIndex) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(monthIndex)
    setCurrentDate(newDate)
    setIsMonthPickerOpen(false)
  }

  // Generate year options (current year ± 10 years)
  const yearOptions = []
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    yearOptions.push(i)
  }
  
  const isToday = (day, isCurrentMonth = true) => {
    if (!isCurrentMonth) return false
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const validateForm = () => {
    const errors = {}
    
    if (!eventForm.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!eventForm.date) {
      errors.date = 'Date is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (field, value) => {
    setEventForm(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handlePlusClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day)
    setSelectedDay(day)
    setSelectedEvent(null)
    setValidationErrors({})
    setEventForm({
      title: 'New page',
      date: selectedDate.toISOString().split('T')[0],
      time: '',
      location: '',
      category: 'meeting'
    })
    setIsModalOpen(true)
  }

  const handleEventClick = (event, e) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setValidationErrors({})
    setEventForm({
      title: event.title,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      category: event.category
    })
    setIsModalOpen(true)
  }

  const handleSaveEvent = () => {
    if (!validateForm()) {
      return
    }

    if (selectedEvent) {
      // Update existing event
      const updatedEvent = {
        ...selectedEvent,
        title: eventForm.title,
        date: new Date(eventForm.date),
        time: eventForm.time,
        location: eventForm.location,
        category: eventForm.category,
        // Keep birthday flag if it was a birthday
        isBirthday: selectedEvent.isBirthday || eventForm.category === 'birthday',
        // Keep original birth year for age calculation
        originalBirthYear: selectedEvent.originalBirthYear || (eventForm.category === 'birthday' ? new Date(eventForm.date).getFullYear() : null)
      }
      onAddEvent(updatedEvent) // This should be onUpdateEvent, but using onAddEvent for now
    } else {
      // Create new event
      const newEvent = {
        id: crypto.randomUUID(),
        title: eventForm.title,
        date: new Date(eventForm.date),
        time: eventForm.time,
        location: eventForm.location,
        category: eventForm.category,
        // Mark as birthday if category is birthday
        isBirthday: eventForm.category === 'birthday',
        // Store original birth year for age calculation
        originalBirthYear: eventForm.category === 'birthday' ? new Date(eventForm.date).getFullYear() : null
      }
      onAddEvent(newEvent)
    }
    
    setIsModalOpen(false)
    setValidationErrors({})
    setEventForm({
      title: '',
      date: '',
      time: '',
      location: '',
      category: 'meeting'
    })
    setSelectedEvent(null)
  }

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      onDeleteEvent(selectedEvent.id)
      setIsModalOpen(false)
      setSelectedEvent(null)
    }
  }

  // Enhanced function to get events for a day, including recurring birthdays
  const getEventsForDay = (day) => {
    const dayDate = new Date(currentYear, currentMonth, day)
    
    // Get regular events for this exact date
    const regularEvents = events.filter(event => 
      !event.isBirthday && event.date.toDateString() === dayDate.toDateString()
    )
    
    // Get birthday events that should repeat yearly
    const birthdayEvents = events
      .filter(event => event.isBirthday || event.category === 'birthday')
      .filter(event => {
        const eventDate = new Date(event.date)
        // Check if month and day match (yearly repeat)
        return eventDate.getMonth() === dayDate.getMonth() && 
               eventDate.getDate() === dayDate.getDate()
      })
      .map(event => {
        // Calculate current age if it's a birthday
        let ageText = ''
        if (event.originalBirthYear) {
          const currentAge = currentYear - event.originalBirthYear
          ageText = ` (${currentAge})`
        }
        
        return {
          ...event,
          // Update the display title to include age
          displayTitle: `${event.title}${ageText}`,
          // Keep the original date for reference but mark as current year occurrence
          currentYearDate: dayDate,
          // Create unique ID for this year's occurrence
          yearlyId: `${event.id}-${currentYear}`
        }
      })
    
    return [...regularEvents, ...birthdayEvents]
  }

  return (
    <>
      <div className="w-full bg-transparent rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-[Libre_Baskerville] italic text-white">
              Calendar
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Year Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateYear(-1)}
                className="p-2 hover:bg-gray-700 rounded"
              >
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                  className="flex items-center gap-1 px-3 py-1 hover:bg-gray-700 rounded text-white text-base font-medium min-w-[80px] justify-center"
                >
                  {currentYear}
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                
                {isYearPickerOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {yearOptions.map(year => (
                      <button
                        key={year}
                        onClick={() => selectYear(year)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${
                          year === currentYear ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigateYear(1)}
                className="p-2 hover:bg-gray-700 rounded"
              >
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-700 rounded"
              >
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                  className="flex items-center gap-1 px-3 py-1 hover:bg-gray-700 rounded text-white text-base font-medium min-w-[120px] justify-center"
                >
                  {monthNames[currentMonth]}
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                
                {isMonthPickerOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {monthNames.map((month, index) => (
                      <button
                        key={month}
                        onClick={() => selectMonth(index)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${
                          index === currentMonth ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

        {/* Horizontal line under header */}
        <div className="w-full h-px bg-gray-700 mb-4"></div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className="h-10 flex items-center justify-center border-b border-gray-700">
              <span className="text-sm font-medium text-gray-400">{day}</span>
            </div>
          ))}
          
          {/* Previous Month Days */}
          {prevMonthDays.map(day => (
            <div key={`prev-${day}`} className="h-32 border-b border-gray-800 p-2" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color) 3%, transparent)' }}>
              <span className="text-sm" style={{ color: 'color-mix(in srgb, var(--accent-color) 25%, white)' }}>{day}</span>
            </div>
          ))}
          
          {/* Current Month Days */}
          {currentMonthDays.map(day => {
            const dayEvents = getEventsForDay(day)
            
            return (
              <div 
                key={day} 
                className="h-32 border-b border-gray-800 p-2 hover:bg-gray-800/30 cursor-pointer relative group bg-gray-900/10"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    isToday(day) ? 'bg-accent text-white px-2 py-1 rounded-full' : 'text-gray-300'
                  }`}>
                    {day}
                  </span>
                  <Plus 
                    size={12} 
                    className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-accent" 
                    onClick={() => handlePlusClick(day)}
                  />
                </div>
                
                {/* Events - increased height */}
                <div className="mt-1 space-y-1">
                  {dayEvents.map(event => {
                    const isBirthday = event.isBirthday || event.category === 'birthday'
                    const eventTitle = event.displayTitle || event.title
                    
                    return (
                      <div 
                        key={event.yearlyId || event.id}
                        className={`w-full h-10 rounded text-xs text-white px-2 flex items-center truncate cursor-pointer transition-colors ${
                          isBirthday 
                            ? 'bg-pink-600 hover:bg-pink-500' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                        title={`${eventTitle} ${event.time ? `at ${event.time}` : ''} ${isBirthday ? '🎂' : ''}`}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-center gap-1 w-full">
                          {isBirthday && <span className="text-xs">🎂</span>}
                          <span className="truncate flex-1">{eventTitle}</span>
                          {isBirthday && (
                            <span className="text-xs opacity-75 ml-1">Birthday</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          
          {/* Next Month Days */}
          {nextMonthDays.map(day => (
            <div key={`next-${day}`} className="h-32 border-b border-gray-800 p-2" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color) 3%, transparent)' }}>
              <span className="text-sm" style={{ color: 'color-mix(in srgb, var(--accent-color) 25%, white)' }}>{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal - Redesigned */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in w-full max-w-lg data-closed:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      className={`text-2xl font-medium bg-transparent border-none outline-none flex-1 w-full ${
                        validationErrors.title ? 'text-red-400' : 'text-white'
                      }`}
                      placeholder="New page"
                    />
                    {validationErrors.title && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{validationErrors.title}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white ml-4"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Date Field */}
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Date</div>
                      <input
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                        className={`w-full bg-transparent text-base border-none outline-none ${
                          validationErrors.date ? 'text-red-400' : 'text-white'
                        }`}
                      />
                      {validationErrors.date && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{validationErrors.date}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Field */}
                  <div className="flex items-center gap-4">
                    <MapPin size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Location</div>
                      <input
                        type="text"
                        value={eventForm.location}
                        onChange={(e) => handleFormChange('location', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Time Field */}
                  <div className="flex items-center gap-4">
                    <Clock size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Time</div>
                      <input
                        type="time"
                        value={eventForm.time}
                        onChange={(e) => handleFormChange('time', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Category Field */}
                  <div className="flex items-center gap-4">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Category</div>
                      <select
                        value={eventForm.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className="w-full bg-transparent text-white text-base border-none outline-none"
                      >
                        <option value="meeting" className="bg-[#1a1a1a]">Meeting</option>
                        <option value="birthday" className="bg-[#1a1a1a]">Birthday</option>
                        <option value="event" className="bg-[#1a1a1a]">Event</option>
                        <option value="other" className="bg-[#1a1a1a]">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Birthday Info */}
                  {eventForm.category === 'birthday' && (
                    <div className="bg-pink-900/20 border border-pink-700/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-pink-400">🎂</span>
                        <span className="text-pink-400 font-medium">Birthday Event</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        This event will repeat every year on the same date.
                        {eventForm.date && (
                          <div className="mt-1">
                            Age in {currentYear}: {currentYear - new Date(eventForm.date).getFullYear()} years
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with action buttons */}
              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex gap-3">
                  {selectedEvent && (
                    <button
                      onClick={handleDeleteEvent}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Click outside handlers */}
      {isYearPickerOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsYearPickerOpen(false)}
        />
      )}
      {isMonthPickerOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMonthPickerOpen(false)}
        />
      )}
    </>
  )
}

export default BigCalendar