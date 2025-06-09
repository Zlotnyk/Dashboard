import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Calendar, MapPin, Clock } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const BigCalendar = ({ events = [], onAddEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'meeting'
  })
  
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
  
  const isToday = (day, isCurrentMonth = true) => {
    if (!isCurrentMonth) return false
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handlePlusClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day)
    setSelectedDay(day)
    setSelectedEvent(null)
    setEventForm({
      title: 'New page',
      date: selectedDate.toISOString().split('T')[0],
      time: '',
      location: '',
      type: 'meeting'
    })
    setIsModalOpen(true)
  }

  const handleEventClick = (event, e) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setEventForm({
      title: event.title,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      type: event.type
    })
    setIsModalOpen(true)
  }

  const handleSaveEvent = () => {
    if (!eventForm.title.trim()) return

    if (selectedEvent) {
      // Update existing event
      const updatedEvent = {
        ...selectedEvent,
        title: eventForm.title,
        date: new Date(eventForm.date),
        time: eventForm.time,
        location: eventForm.location,
        type: eventForm.type
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
        type: eventForm.type
      }
      onAddEvent(newEvent)
    }
    
    setIsModalOpen(false)
    setEventForm({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'meeting'
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

  const getEventsForDay = (day) => {
    const dayDate = new Date(currentYear, currentMonth, day)
    return events.filter(event => 
      event.date.toDateString() === dayDate.toDateString()
    )
  }

  return (
    <>
      <div className="w-full bg-[#1a1a1a] rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-[Libre_Baskerville] italic text-white">
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
            <div key={`prev-${day}`} className="h-32 border-r border-b border-gray-800 bg-gray-900/30 p-2">
              <span className="text-sm text-gray-600">{day}</span>
            </div>
          ))}
          
          {/* Current Month Days */}
          {currentMonthDays.map(day => {
            const dayEvents = getEventsForDay(day)
            
            return (
              <div 
                key={day} 
                className="h-32 border-r border-b border-gray-800 p-2 hover:bg-gray-800/30 cursor-pointer relative group bg-gray-900/10"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    isToday(day) ? 'bg-[#97e7aa] text-white px-2 py-1 rounded-full' : 'text-gray-300'
                  }`}>
                    {day}
                  </span>
                  <Plus 
                    size={12} 
                    className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#97e7aa]" 
                    onClick={() => handlePlusClick(day)}
                  />
                </div>
                
                {/* Events - increased height */}
                <div className="mt-1 space-y-1">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id}
                      className="w-full h-7 bg-gray-600 rounded text-xs text-white px-2 flex items-center truncate cursor-pointer hover:bg-gray-500"
                      title={`${event.title} ${event.time ? `at ${event.time}` : ''}`}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          
          {/* Next Month Days */}
          {nextMonthDays.map(day => (
            <div key={`next-${day}`} className="h-32 border-r border-b border-gray-800 bg-gray-900/30 p-2">
              <span className="text-sm text-gray-600">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal - Redesigned */}
      <Dialog open={isModalOpen} onClose={setIsModalOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-8">
                  <DialogTitle className="text-2xl font-medium text-white">
                    {eventForm.title}
                  </DialogTitle>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Date Field */}
                  <div className="flex items-center gap-4">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Date</div>
                      <input
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-transparent text-white text-base border-none outline-none"
                      />
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
                        onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
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
                        onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Add a property button */}
                  <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
                    <Plus size={16} />
                    Add a property
                  </button>
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
                    className="px-4 py-2 bg-[#97e7aa] text-white rounded-lg hover:bg-[#75b384] transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default BigCalendar