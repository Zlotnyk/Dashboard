import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
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
      title: '',
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

      {/* Event Modal */}
      <Dialog open={isModalOpen} onClose={setIsModalOpen} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1a1a1a] rounded-lg w-full max-w-lg">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <DialogTitle className="text-xl font-semibold text-white">
                  {selectedEvent ? 'Edit Event' : 'Create Event'}
                </DialogTitle>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                    placeholder="Enter event title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                    placeholder="Enter location..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Type
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="birthday">Birthday</option>
                    <option value="appointment">Appointment</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex gap-3">
              {selectedEvent && (
                <button
                  onClick={handleDeleteEvent}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex-1 px-6 py-3 bg-[#97e7aa] text-white rounded-lg hover:bg-[#75b384] transition-colors"
              >
                {selectedEvent ? 'Update Event' : 'Save Event'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default BigCalendar