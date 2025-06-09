import React, { useState, useEffect } from 'react'
import { Plus, Calendar, MapPin, Clock, X, Settings, Trash2, Edit, Filter, AlertCircle, Users, Palette } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const UpcomingEvents = ({ events = [] }) => {
  const [filteredEvents, setFilteredEvents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState(30) // Default to 30 days
  const [validationErrors, setValidationErrors] = useState({})
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    dressCode: '',
    location: '',
    numberOfGuests: '',
    theme: '',
    comments: ''
  })

  const filterOptions = [
    { label: '30 days (1 month)', value: 30 },
    { label: '60 days (2 months)', value: 60 },
    { label: '90 days (3 months)', value: 90 },
    { label: '120 days (4 months)', value: 120 }
  ]

  // Calculate days until event
  const calculateDaysUntil = (eventDate) => {
    const today = new Date()
    const event = new Date(eventDate)
    const diffTime = event - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `${diffDays} days`
  }

  // Filter events from calendar that are event, meeting, or other (not birthday)
  useEffect(() => {
    const today = new Date()
    
    const relevantEvents = events
      .filter(event => 
        event.category === 'event' || 
        event.category === 'meeting' || 
        event.category === 'other'
      )
      .map(event => {
        const daysUntil = Math.ceil((new Date(event.date) - today) / (1000 * 60 * 60 * 24))
        return {
          ...event,
          daysUntil: daysUntil
        }
      })
      .filter(event => event.daysUntil <= selectedFilter && event.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)

    setFilteredEvents(relevantEvents)
  }, [events, selectedFilter])

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

  const handleAddEvent = () => {
    setSelectedEvent(null)
    setValidationErrors({})
    setEventForm({
      title: 'New page',
      date: '',
      dressCode: '',
      location: '',
      numberOfGuests: '',
      theme: '',
      comments: ''
    })
    setIsModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setValidationErrors({})
    setEventForm({
      title: event.title,
      date: event.date.toISOString().split('T')[0],
      dressCode: event.dressCode || '',
      location: event.location || '',
      numberOfGuests: event.numberOfGuests || '',
      theme: event.theme || '',
      comments: event.comments || ''
    })
    setIsModalOpen(true)
  }

  const handleSaveEvent = () => {
    if (!validateForm()) {
      return
    }

    // This would typically call a parent function to add/update the event
    // For now, we'll just close the modal
    console.log('Event saved:', eventForm)
    
    setIsModalOpen(false)
    setValidationErrors({})
    setEventForm({
      title: '',
      date: '',
      dressCode: '',
      location: '',
      numberOfGuests: '',
      theme: '',
      comments: ''
    })
    setSelectedEvent(null)
  }

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      // This would typically call a parent function to delete the event
      console.log('Event deleted:', selectedEvent.id)
      setIsModalOpen(false)
      setSelectedEvent(null)
    }
  }

  const formatDaysUntil = (days) => {
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow'
    return `${days} days`
  }

  const getFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter)
    return option ? option.label : `${selectedFilter} days`
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meeting':
        return '🤝'
      case 'event':
        return '🎉'
      case 'other':
        return '📅'
      default:
        return '📅'
    }
  }

  return (
    <>
      <div className="w-full h-full bg-[#1a1a1a] rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-[Libre_Baskerville] italic text-white">
            Upcoming Events
          </h3>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Horizontal line under header */}
        <div className="w-full h-px bg-gray-700 mb-4"></div>

        {/* Filter Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar size={16} />
            <span>Next {getFilterLabel()}</span>
          </div>
          
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(Number(e.target.value))}
              className="bg-transparent text-sm text-white focus:outline-none appearance-none pr-8"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-[#2a2a2a]">
                  {option.label}
                </option>
              ))}
            </select>
            <Filter size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Events list */}
        <div className="space-y-2">
          {filteredEvents.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No upcoming events in the next {selectedFilter} days
            </div>
          ) : (
            filteredEvents.map(event => (
              <div 
                key={event.id}
                className="bg-[#2a2a2a] rounded-lg p-3 hover:bg-[#333333] transition-colors group cursor-pointer"
                onClick={() => handleEditEvent(event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(event.category)}</span>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {event.title}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {event.date.toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {event.time && ` at ${event.time}`}
                      </div>
                      {event.location && (
                        <div className="text-gray-500 text-xs flex items-center gap-1">
                          <MapPin size={10} />
                          {event.location}
                        </div>
                      )}
                      <div className="text-gray-500 text-xs">
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)} • {formatDaysUntil(event.daysUntil)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditEvent(event)
                      }}
                      className="p-1 hover:bg-blue-600 rounded transition-all"
                      title="Edit"
                    >
                      <Edit size={12} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* New page button */}
          <button
            onClick={handleAddEvent}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">New page</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <Dialog open={isModalOpen} onClose={setIsModalOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
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

                <div className="space-y-4">
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

                  {/* Dress Code Field */}
                  <div className="flex items-center gap-4">
                    <Clock size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Dress Code</div>
                      <input
                        type="text"
                        value={eventForm.dressCode}
                        onChange={(e) => handleFormChange('dressCode', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
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
                        onChange={(e) => handleFormChange('location', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Number of Guests Field */}
                  <div className="flex items-center gap-4">
                    <Users size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Number of Guests</div>
                      <input
                        type="number"
                        value={eventForm.numberOfGuests}
                        onChange={(e) => handleFormChange('numberOfGuests', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Theme Field */}
                  <div className="flex items-center gap-4">
                    <Palette size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Theme</div>
                      <input
                        type="text"
                        value={eventForm.theme}
                        onChange={(e) => handleFormChange('theme', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Comments Field */}
                  <div className="flex items-start gap-4">
                    <Edit size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Comments</div>
                      <textarea
                        value={eventForm.comments}
                        onChange={(e) => handleFormChange('comments', e.target.value)}
                        placeholder="Empty"
                        rows={3}
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500 resize-none"
                      />
                    </div>
                  </div>
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

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onClose={setIsSettingsOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    Event Settings
                  </DialogTitle>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Filter Settings */}
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Filter Settings</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">
                        Currently showing: <span className="text-white">{getFilterLabel()}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Change the filter in the main view to see events for different time periods.
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Statistics</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Total events:</span>
                        <span>{events.filter(e => e.category !== 'birthday').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meetings:</span>
                        <span>{events.filter(e => e.category === 'meeting').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Events:</span>
                        <span>{events.filter(e => e.category === 'event').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other:</span>
                        <span>{events.filter(e => e.category === 'other').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In current filter:</span>
                        <span>{filteredEvents.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This week:</span>
                        <span>{filteredEvents.filter(e => e.daysUntil <= 7).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <div className="text-sm text-gray-300">
                      <div className="font-medium text-blue-400 mb-2">How it works:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Shows events, meetings, and other calendar items</li>
                        <li>• Excludes birthday events (shown in separate widget)</li>
                        <li>• Use the filter to see events for different time periods</li>
                        <li>• Events are sorted by date (closest first)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Close
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

export default UpcomingEvents