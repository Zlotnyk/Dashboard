import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, X, Clock, User, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { useAuth } from '../../hooks/useAuth'
import '../../App.css'

function TimetablePage() {
  const { isAuthenticated, user } = useAuth()
  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [classForm, setClassForm] = useState({
    title: '',
    weekDay: '',
    classroom: '',
    professor: '',
    startTime: '',
    endTime: ''
  })

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Load schedule from localStorage
  useEffect(() => {
    const savedSchedule = localStorage.getItem('timetableSchedule')
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule))
    }
  }, [isAuthenticated, user])

  // Save schedule to localStorage
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('timetableSchedule', JSON.stringify(schedule))
    }
  }, [schedule, isAuthenticated])

  // Listen for quick add events from QuickLinks
  useEffect(() => {
    const handleQuickAddClass = (event) => {
      const { day } = event.detail
      handleAddClass(day)
    }

    window.addEventListener('quickAddClass', handleQuickAddClass)
    
    return () => {
      window.removeEventListener('quickAddClass', handleQuickAddClass)
    }
  }, [isAuthenticated])

  const validateForm = () => {
    const errors = {}
    
    if (!classForm.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!classForm.weekDay) {
      errors.weekDay = 'Week day is required'
    }
    
    if (!classForm.startTime) {
      errors.startTime = 'Start time is required'
    }
    
    if (!classForm.endTime) {
      errors.endTime = 'End time is required'
    }
    
    if (classForm.startTime && classForm.endTime && classForm.startTime >= classForm.endTime) {
      errors.endTime = 'End time must be after start time'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (field, value) => {
    setClassForm(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddClass = (day) => {
    if (!isAuthenticated) {
      alert('Please sign in to add classes')
      return
    }
    
    setSelectedDay(day)
    setSelectedClass(null)
    setValidationErrors({})
    setClassForm({
      title: '',
      weekDay: day,
      classroom: '',
      professor: '',
      startTime: '',
      endTime: ''
    })
    setIsDrawerOpen(true)
  }

  const handleEditClass = (cls) => {
    if (!isAuthenticated) {
      alert('Please sign in to edit classes')
      return
    }
    
    setSelectedClass(cls)
    setSelectedDay(cls.weekDay)
    setValidationErrors({})
    setClassForm({
      title: cls.title,
      weekDay: cls.weekDay,
      classroom: cls.classroom || '',
      professor: cls.professor || '',
      startTime: cls.startTime || '',
      endTime: cls.endTime || ''
    })
    setIsDrawerOpen(true)
  }

  const handleSaveClass = () => {
    if (!validateForm()) {
      return
    }

    if (selectedClass) {
      // Update existing class
      const updatedClass = {
        ...selectedClass,
        title: classForm.title,
        weekDay: classForm.weekDay,
        classroom: classForm.classroom,
        professor: classForm.professor,
        startTime: classForm.startTime,
        endTime: classForm.endTime
      }

      setSchedule(prev => ({
        ...prev,
        [selectedClass.weekDay]: prev[selectedClass.weekDay].filter(cls => cls.id !== selectedClass.id),
        [classForm.weekDay]: [...prev[classForm.weekDay], updatedClass].sort((a, b) => a.startTime.localeCompare(b.startTime))
      }))
    } else {
      // Create new class
      const newClass = {
        id: crypto.randomUUID(),
        title: classForm.title,
        weekDay: classForm.weekDay,
        classroom: classForm.classroom,
        professor: classForm.professor,
        startTime: classForm.startTime,
        endTime: classForm.endTime
      }

      setSchedule(prev => ({
        ...prev,
        [classForm.weekDay]: [...prev[classForm.weekDay], newClass].sort((a, b) => a.startTime.localeCompare(b.startTime))
      }))
    }

    setIsDrawerOpen(false)
    setValidationErrors({})
    setClassForm({
      title: '',
      weekDay: '',
      classroom: '',
      professor: '',
      startTime: '',
      endTime: ''
    })
    setSelectedClass(null)
  }

  const handleDeleteClass = (day, classId, e) => {
    e.stopPropagation() // Prevent triggering edit when clicking delete
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter(cls => cls.id !== classId)
    }))
  }

  const handleDeleteCurrentClass = () => {
    if (selectedClass) {
      setSchedule(prev => ({
        ...prev,
        [selectedClass.weekDay]: prev[selectedClass.weekDay].filter(cls => cls.id !== selectedClass.id)
      }))
      setIsDrawerOpen(false)
      setSelectedClass(null)
    }
  }

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
  }

  return (
    <div>
      <div>
        <Navbar />
        <header className='relative'>
          <GifContainer />
        </header>
        <HeaderContent title="Timetable" />
        <NavigationLinks />
        <WavyLines />
        <main className='flex w-full min-h-screen select-none'>
          {/* Left Section - 20% */}
          <section
            className='flex flex-col p-4 gap-4'
            style={{ width: '20%' }}
          >
            <FlipClock />
            <QuickLinks />
          </section>

          {/* Right Section - 80% */}
          <section
            className='flex flex-col p-4 gap-4 flex-1'
            style={{ width: '80%' }}
          >
            {/* Timetable Content */}
            <div className='rounded-lg p-6 min-h-[600px]'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                  Timetable
                </h2>
                {/* Quick Add Button */}
                <button
                  onClick={() => handleAddClass('Monday')}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Quick Add Class
                </button>
              </div>

              {/* Horizontal line under header */}
              <div className="w-full h-px bg-gray-700 mb-6"></div>

              {/* Timetable Grid */}
              <div className='grid grid-cols-7 gap-4'>
                {weekDays.map(day => (
                  <div key={day} className='rounded-lg p-4 min-h-[400px]'>
                    {/* Day Header */}
                    <div className='mb-4'>
                      <h3 className='text-white font-medium text-lg mb-2'>{day}</h3>
                      <div className="w-full h-px bg-gray-600"></div>
                    </div>

                    {/* Classes */}
                    <div className='space-y-3 mb-4'>
                      {schedule[day].map(cls => (
                        <div 
                          key={cls.id}
                          className='bg-[#3a3a3a] rounded-lg p-3 hover:bg-[#4a4a4a] transition-colors group cursor-pointer'
                          onClick={() => handleEditClass(cls)}
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <h4 className='text-white text-sm font-medium truncate flex-1'>
                              {cls.title}
                            </h4>
                            <button
                              onClick={(e) => handleDeleteClass(day, cls.id, e)}
                              className='opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all'
                            >
                              <X size={14} />
                            </button>
                          </div>
                          
                          {cls.startTime && cls.endTime && (
                            <div className='flex items-center gap-1 mb-1'>
                              <Clock size={12} className='text-gray-400' />
                              <span className='text-gray-300 text-xs'>
                                {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                              </span>
                            </div>
                          )}
                          
                          {cls.classroom && (
                            <div className='flex items-center gap-1 mb-1'>
                              <MapPin size={12} className='text-gray-400' />
                              <span className='text-gray-300 text-xs'>{cls.classroom}</span>
                            </div>
                          )}
                          
                          {cls.professor && (
                            <div className='flex items-center gap-1'>
                              <User size={12} className='text-gray-400' />
                              <span className='text-gray-300 text-xs'>{cls.professor}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add New Class Button */}
                    <button
                      onClick={() => handleAddClass(day)}
                      className='w-full flex items-center justify-center gap-2 py-3 px-3 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors'
                    >
                      <Plus size={16} />
                      <span className='text-sm'>New page</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Class Drawer */}
      <Dialog open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto relative w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full"
              >
                <TransitionChild>
                  <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-300 ease-in-out data-[closed]:opacity-0 sm:-ml-10 sm:pr-4">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <span className="absolute -inset-2.5" />
                      <span className="sr-only">Close panel</span>
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </TransitionChild>

                <div className="flex h-full flex-col overflow-y-scroll bg-[#1a1a1a] border-l border-gray-700 shadow-2xl">
                  <div className="px-4 sm:px-6 py-6 border-b border-gray-700">
                    <DialogTitle className="text-lg font-semibold text-white">
                      {selectedClass ? 'Edit Class' : 'Create Subject'}
                    </DialogTitle>
                  </div>

                  <div className="flex-1 px-4 sm:px-6 space-y-6 overflow-y-auto py-6">
                    {/* Title */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Calendar size={16} />
                        Title
                      </label>
                      <input
                        type="text"
                        value={classForm.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        className={`w-full px-3 py-3 bg-transparent border-2 border-solid border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors ${
                          validationErrors.title ? 'border-red-400' : ''
                        }`}
                        placeholder="Enter class title"
                        autoFocus
                      />
                      {validationErrors.title && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{validationErrors.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Week Day */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Calendar size={16} />
                        Week Day
                      </label>
                      <div className="relative">
                        <select
                          value={classForm.weekDay}
                          onChange={(e) => handleFormChange('weekDay', e.target.value)}
                          className={`w-full px-3 py-3 bg-[#2a2a2a] border-2 border-solid border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent appearance-none ${
                            validationErrors.weekDay ? 'border-red-400' : ''
                          }`}
                        >
                          {weekDays.map(day => (
                            <option key={day} value={day} className="bg-[#2a2a2a]">{day}</option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.weekDay && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{validationErrors.weekDay}</span>
                        </div>
                      )}
                    </div>

                    {/* Classroom */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <MapPin size={16} />
                        Classroom
                      </label>
                      <input
                        type="text"
                        value={classForm.classroom}
                        onChange={(e) => handleFormChange('classroom', e.target.value)}
                        className="w-full px-3 py-3 bg-transparent border-2 border-solid border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                        placeholder="Enter classroom"
                      />
                    </div>

                    {/* Professor */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <User size={16} />
                        Professor
                      </label>
                      <input
                        type="text"
                        value={classForm.professor}
                        onChange={(e) => handleFormChange('professor', e.target.value)}
                        className="w-full px-3 py-3 bg-transparent border-2 border-solid border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                        placeholder="Enter professor name"
                      />
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Clock size={16} />
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={classForm.startTime}
                        onChange={(e) => handleFormChange('startTime', e.target.value)}
                        className={`w-full px-3 py-3 bg-transparent border-2 border-solid border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors ${
                          validationErrors.startTime ? 'border-red-400' : ''
                        }`}
                      />
                      {validationErrors.startTime && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{validationErrors.startTime}</span>
                        </div>
                      )}
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Clock size={16} />
                        End Time
                      </label>
                      <input
                        type="time"
                        value={classForm.endTime}
                        onChange={(e) => handleFormChange('endTime', e.target.value)}
                        className={`w-full px-3 py-3 bg-transparent border-2 border-solid border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors ${
                          validationErrors.endTime ? 'border-red-400' : ''
                        }`}
                      />
                      {validationErrors.endTime && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{validationErrors.endTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-700 flex gap-3">
                    {selectedClass && (
                      <button
                        onClick={handleDeleteCurrentClass}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveClass}
                      className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors"
                    >
                      {selectedClass ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default TimetablePage