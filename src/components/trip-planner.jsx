import React, { useState, useEffect } from 'react'
import { Plus, Calendar, MapPin, Clock, X, Edit, Trash2, Plane, AlertCircle, Camera, Upload } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useAuth } from '../hooks/useAuth'

const TripPlanner = () => {
  const { isAuthenticated, user } = useAuth()
  const [trips, setTrips] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [tripForm, setTripForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    status: 'Planning',
    budget: '',
    notes: '',
    photos: []
  })

  const statusOptions = [
    { value: 'Planning', label: 'Planning', color: '#6b7280' },
    { value: 'Booked', label: 'Booked', color: '#3b82f6' },
    { value: 'In Progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'Completed', label: 'Completed', color: '#10b981' },
    { value: 'Cancelled', label: 'Cancelled', color: '#ef4444' }
  ]

  // Load trips from localStorage on component mount
  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]')
    const tripsWithDates = savedTrips.map(trip => ({
      ...trip,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      photos: trip.photos || []
    }))
    setTrips(tripsWithDates)
  }, [isAuthenticated, user])

  // Save trips to localStorage whenever trips change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('trips', JSON.stringify(trips))
    }
  }, [trips, isAuthenticated])

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Include both start and end days
  }

  const calculateDaysUntil = (startDate) => {
    const today = new Date()
    const start = new Date(startDate)
    const diffTime = start - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `${diffDays} days`
  }

  const validateForm = () => {
    const errors = {}
    
    if (!tripForm.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!tripForm.destination.trim()) {
      errors.destination = 'Destination is required'
    }
    
    if (!tripForm.startDate) {
      errors.startDate = 'Start date is required'
    }
    
    if (!tripForm.endDate) {
      errors.endDate = 'End date is required'
    }
    
    if (tripForm.startDate && tripForm.endDate) {
      const start = new Date(tripForm.startDate)
      const end = new Date(tripForm.endDate)
      if (end < start) {
        errors.endDate = 'End date must be after start date'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddTrip = () => {
    if (!isAuthenticated) {
      alert('Please sign in to add trips')
      return
    }
    
    setSelectedTrip(null)
    setValidationErrors({})
    setTripForm({
      title: 'New page',
      destination: '',
      startDate: '',
      endDate: '',
      status: 'Planning',
      budget: '',
      notes: '',
      photos: []
    })
    setIsModalOpen(true)
  }

  const handleEditTrip = (trip) => {
    if (!isAuthenticated) {
      alert('Please sign in to edit trips')
      return
    }
    
    setSelectedTrip(trip)
    setValidationErrors({})
    setTripForm({
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate.toISOString().split('T')[0],
      endDate: trip.endDate.toISOString().split('T')[0],
      status: trip.status,
      budget: trip.budget || '',
      notes: trip.notes || '',
      photos: trip.photos || []
    })
    setIsModalOpen(true)
  }

  const handleSaveTrip = () => {
    if (!validateForm()) {
      return
    }

    const tripData = {
      title: tripForm.title,
      destination: tripForm.destination,
      startDate: new Date(tripForm.startDate),
      endDate: new Date(tripForm.endDate),
      status: tripForm.status,
      budget: tripForm.budget,
      notes: tripForm.notes,
      photos: tripForm.photos
    }

    if (selectedTrip) {
      // Update existing trip
      setTrips(prev => prev.map(trip => 
        trip.id === selectedTrip.id 
          ? { ...trip, ...tripData }
          : trip
      ))
    } else {
      // Add new trip
      const newTrip = {
        id: crypto.randomUUID(),
        ...tripData
      }
      setTrips(prev => [...prev, newTrip])
    }

    setIsModalOpen(false)
    setValidationErrors({})
    setTripForm({
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      status: 'Planning',
      budget: '',
      notes: '',
      photos: []
    })
    setSelectedTrip(null)
  }

  const handleDeleteTrip = () => {
    if (selectedTrip) {
      setTrips(prev => prev.filter(trip => trip.id !== selectedTrip.id))
      setIsModalOpen(false)
      setSelectedTrip(null)
    }
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.color : '#6b7280'
  }

  const handleFormChange = (field, value) => {
    setTripForm(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files)
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newPhoto = {
            id: crypto.randomUUID(),
            url: e.target.result,
            name: file.name,
            size: file.size
          }
          setTripForm(prev => ({
            ...prev,
            photos: [...prev.photos, newPhoto]
          }))
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemovePhoto = (photoId) => {
    setTripForm(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }))
  }

  const sortedTrips = trips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  return (
    <>
      <div className="w-full h-full bg-[#1a1a1a] rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Plane size={18} className="text-gray-400" />
            <h3 className="text-lg font-[Libre_Baskerville] italic text-white">
              Trip Planner
            </h3>
          </div>
        </div>

        {/* Horizontal line under header */}
        <div className="w-full h-px bg-gray-700 mb-4"></div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {sortedTrips.map(trip => {
            const duration = calculateDuration(trip.startDate, trip.endDate)
            const daysUntil = calculateDaysUntil(trip.startDate)
            const statusColor = getStatusColor(trip.status)
            
            return (
              <div 
                key={trip.id}
                className="bg-[#2a2a2a] rounded-lg overflow-hidden hover:bg-[#333333] transition-colors cursor-pointer group"
                onClick={() => handleEditTrip(trip)}
              >
                {/* Photo Section */}
                {trip.photos && trip.photos.length > 0 ? (
                  <div className="h-32 overflow-hidden relative">
                    <img 
                      src={trip.photos[0].url} 
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    {trip.photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        +{trip.photos.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-32 bg-gray-700/50 flex items-center justify-center">
                    <Camera size={24} className="text-gray-500" />
                  </div>
                )}

                <div className="p-4">
                  {/* Trip Title */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium text-base truncate flex-1">
                      {trip.title}
                    </h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTrip(trip)
                        }}
                        className="p-1 hover:bg-blue-600 rounded transition-all"
                        title="Edit"
                      >
                        <Edit size={12} className="text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Destination */}
                  {trip.destination && (
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-gray-300 text-sm truncate">
                        {trip.destination}
                      </span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      {trip.startDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })} - {trip.endDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      {duration} {duration === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      <span className="text-gray-300 text-sm">
                        {trip.status}
                      </span>
                    </div>
                    
                    {/* Days until */}
                    <span className="text-gray-400 text-xs">
                      {daysUntil}
                    </span>
                  </div>

                  {/* Budget */}
                  {trip.budget && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <span className="text-gray-400 text-xs">
                        Budget: ${trip.budget}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add New Trip Card */}
          <button
            onClick={handleAddTrip}
            className="bg-[#2a2a2a] border-2 border-solid border-gray-500 rounded-lg p-4 hover:border-gray-400 hover:bg-[#333333] transition-colors flex flex-col items-center justify-center min-h-[200px] group"
          >
            <Plus size={24} className="text-gray-400 group-hover:text-white mb-2" />
            <span className="text-gray-400 group-hover:text-white text-sm">
              New page
            </span>
          </button>
        </div>
      </div>

      {/* Trip Modal */}
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
                      value={tripForm.title}
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
                  {/* Destination Field */}
                  <div className="flex items-start gap-4">
                    <MapPin size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Destination</div>
                      <input
                        type="text"
                        value={tripForm.destination}
                        onChange={(e) => handleFormChange('destination', e.target.value)}
                        placeholder="Empty"
                        className={`w-full bg-transparent text-base border-none outline-none placeholder-gray-500 ${
                          validationErrors.destination ? 'text-red-400' : 'text-white'
                        }`}
                      />
                      {validationErrors.destination && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{validationErrors.destination}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Start Date Field */}
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Start date</div>
                      <input
                        type="date"
                        value={tripForm.startDate}
                        onChange={(e) => handleFormChange('startDate', e.target.value)}
                        className={`w-full bg-transparent text-base border-none outline-none ${
                          validationErrors.startDate ? 'text-red-400' : 'text-white'
                        }`}
                      />
                      {validationErrors.startDate && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{validationErrors.startDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* End Date Field */}
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">End date</div>
                      <input
                        type="date"
                        value={tripForm.endDate}
                        onChange={(e) => handleFormChange('endDate', e.target.value)}
                        min={tripForm.startDate}
                        className={`w-full bg-transparent text-base border-none outline-none ${
                          validationErrors.endDate ? 'text-red-400' : 'text-white'
                        }`}
                      />
                      {validationErrors.endDate && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{validationErrors.endDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration Display */}
                  {tripForm.startDate && tripForm.endDate && !validationErrors.startDate && !validationErrors.endDate && (
                    <div className="flex items-center gap-4">
                      <Clock size={20} className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">Duration (Days)</div>
                        <div className="text-white text-base">
                          {calculateDuration(tripForm.startDate, tripForm.endDate)} days
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Field */}
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getStatusColor(tripForm.status) }}
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Status</div>
                      <select
                        value={tripForm.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                        className="w-full bg-transparent text-white text-base border-none outline-none"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Budget Field */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-xl flex-shrink-0">$</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Budget</div>
                      <input
                        type="number"
                        value={tripForm.budget}
                        onChange={(e) => handleFormChange('budget', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Photos Section */}
                  <div className="flex items-start gap-4">
                    <Camera size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-2">Photos</div>
                      
                      {/* Photo Upload */}
                      <div className="mb-3">
                        <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                          <Upload size={16} className="text-gray-400" />
                          <span className="text-gray-300 text-sm">Upload Photos</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Photo Grid */}
                      {tripForm.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {tripForm.photos.map(photo => (
                            <div key={photo.id} className="relative group">
                              <img 
                                src={photo.url} 
                                alt={photo.name}
                                className="w-full h-16 object-cover rounded"
                              />
                              <button
                                onClick={() => handleRemovePhoto(photo.id)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div className="flex items-start gap-4">
                    <Edit size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Notes</div>
                      <textarea
                        value={tripForm.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
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
                  {selectedTrip && (
                    <button
                      onClick={handleDeleteTrip}
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
                    onClick={handleSaveTrip}
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
    </>
  )
}

export default TripPlanner