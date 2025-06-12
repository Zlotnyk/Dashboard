import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import BigCalendar from '../../components/big-calendar'
import { Plus, BookOpen, Calendar, Clock, MapPin, Edit, Trash2, AlertCircle, X, CheckSquare, ChevronDown, ChevronRight, Target } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useAuth } from '../../hooks/useAuth'
import { Notification } from '../../components/ui/notification'
import '../../App.css'

function ExamPreparationPage() {
  const { isAuthenticated, user } = useAuth()
  const [exams, setExams] = useState([])
  const [events, setEvents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(true)
  const [notification, setNotification] = useState(null)
  const [dayBeforeChecklist, setDayBeforeChecklist] = useState([
    { id: 'check-location', text: 'Check Exam location & start time', checked: false },
    { id: 'light-revision', text: 'Do a light revision of your study notes', checked: false },
    { id: 'prepare-clothes', text: 'Prepare your clothes', checked: false },
    { id: 'set-alarm', text: 'Set your alarm', checked: false },
    { id: 'visualize', text: 'Visualize yourself being calm & confident', checked: false },
    { id: 'sleep', text: 'Get a good amount of sleep', checked: false }
  ])
  const [examDayChecklist, setExamDayChecklist] = useState([
    { id: 'breakfast', text: 'Eat a decent breakfast!', checked: false },
    { id: 'student-id', text: 'Student ID Card', checked: false },
    { id: 'personal-id', text: 'Passport or Personal ID Card', checked: false },
    { id: 'study-materials', text: 'Study Notes & Material', checked: false },
    { id: 'textbooks', text: 'Textbooks (if permitted)', checked: false },
    { id: 'stationery', text: 'Pencil, Pen & Eraser', checked: false },
    { id: 'calculator', text: 'Calculator', checked: false },
    { id: 'water', text: 'Water', checked: false },
    { id: 'earplugs', text: 'Earplugs (if study in public)', checked: false }
  ])
  const [newChecklistItem, setNewChecklistItem] = useState({ dayBefore: '', examDay: '' })
  const [editingChecklistItem, setEditingChecklistItem] = useState(null)

  // Editing states for inline editing
  const [editingExam, setEditingExam] = useState(null)
  const [editingValues, setEditingValues] = useState({})

  const [examForm, setExamForm] = useState({
    exam: '',
    date: '',
    time: '',
    location: '',
    targetGrade: '',
    notes: ''
  })

  // Load data from localStorage
  useEffect(() => {
    const savedExams = localStorage.getItem('examPreparationData')
    const savedEvents = localStorage.getItem('examEvents')
    const savedDayBeforeChecklist = localStorage.getItem('dayBeforeChecklist')
    const savedExamDayChecklist = localStorage.getItem('examDayChecklist')
    
    if (savedExams) {
      try {
        const parsedExams = JSON.parse(savedExams).map(exam => ({
          ...exam,
          date: new Date(exam.date)
        }))
        setExams(parsedExams)
      } catch (error) {
        console.error('Error parsing exams:', error)
        showNotification('error', 'Error loading saved exams')
      }
    }
    
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map(event => ({
          ...event,
          date: new Date(event.date)
        }))
        setEvents(parsedEvents)
      } catch (error) {
        console.error('Error parsing events:', error)
        showNotification('error', 'Error loading saved events')
      }
    }
    
    if (savedDayBeforeChecklist) {
      try {
        setDayBeforeChecklist(JSON.parse(savedDayBeforeChecklist))
      } catch (error) {
        console.error('Error parsing day before checklist:', error)
      }
    }
    
    if (savedExamDayChecklist) {
      try {
        setExamDayChecklist(JSON.parse(savedExamDayChecklist))
      } catch (error) {
        console.error('Error parsing exam day checklist:', error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (exams.length > 0) {
      localStorage.setItem('examPreparationData', JSON.stringify(exams))
    }
  }, [exams])

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('examEvents', JSON.stringify(events))
    }
  }, [events])

  useEffect(() => {
    localStorage.setItem('dayBeforeChecklist', JSON.stringify(dayBeforeChecklist))
  }, [dayBeforeChecklist])

  useEffect(() => {
    localStorage.setItem('examDayChecklist', JSON.stringify(examDayChecklist))
  }, [examDayChecklist])

  const validateForm = () => {
    const errors = {}
    
    if (!examForm.exam.trim()) {
      errors.exam = 'Exam name is required'
    }
    
    if (!examForm.date) {
      errors.date = 'Date is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (field, value) => {
    setExamForm(prev => ({ ...prev, [field]: value }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Inline editing functions
  const startEditingExam = (exam) => {
    setEditingExam(exam.id)
    setEditingValues({
      exam: exam.exam,
      date: exam.date.toISOString().split('T')[0],
      time: exam.time || '',
      location: exam.location || '',
      targetGrade: exam.targetGrade || '',
      notes: exam.notes || ''
    })
  }

  const saveInlineEdit = (id) => {
    const updatedExam = {
      ...exams.find(e => e.id === id),
      ...editingValues,
      date: new Date(editingValues.date),
      id: id
    }
    setExams(prev => prev.map(exam => 
      exam.id === id ? updatedExam : exam
    ))
    
    // Also update the corresponding event in the calendar
    const examEvent = events.find(event => event.examId === id)
    if (examEvent) {
      const updatedEvent = {
        ...examEvent,
        title: updatedExam.exam,
        date: new Date(updatedExam.date),
        time: updatedExam.time,
        location: updatedExam.location,
        category: 'exam'
      }
      setEvents(prev => prev.map(event => 
        event.examId === id ? updatedEvent : event
      ))
    }
    
    setEditingExam(null)
    setEditingValues({})
    showNotification('success', 'Exam updated successfully')
  }

  const cancelInlineEdit = () => {
    setEditingExam(null)
    setEditingValues({})
  }

  const addNewExam = () => {
    const newExam = {
      id: crypto.randomUUID(),
      exam: '',
      date: new Date(),
      time: '',
      location: '',
      targetGrade: '',
      notes: '',
      createdAt: new Date().toISOString()
    }

    setExams(prev => [...prev, newExam])
    startEditingExam(newExam)
  }

  const handleDeleteExam = (examId) => {
    setExams(prev => prev.filter(exam => exam.id !== examId))
    
    // Also delete the corresponding event from the calendar
    setEvents(prev => prev.filter(event => event.examId !== examId))
    showNotification('success', 'Exam deleted successfully')
  }

  const handleEditingValueChange = (field, value) => {
    setEditingValues(prev => ({ ...prev, [field]: value }))
  }

  const calculateDaysUntil = (examDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate)
    exam.setHours(0, 0, 0, 0)
    const diffTime = exam - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `${diffDays} days left`
  }

  const handleEventAdd = (event) => {
    // If it's an exam event, also add it to the exams list
    if (event.category === 'exam' && !event.examId) {
      const newExam = {
        id: crypto.randomUUID(),
        exam: event.title,
        date: new Date(event.date),
        time: event.time || '',
        location: event.location || '',
        targetGrade: '',
        notes: '',
        createdAt: new Date().toISOString()
      }
      
      setExams(prev => [...prev, newExam])
      
      // Update the event with the exam ID reference
      const updatedEvent = {
        ...event,
        examId: newExam.id
      }
      
      setEvents(prevEvents => [...prevEvents, updatedEvent])
      showNotification('success', 'Exam event created successfully')
    } else {
      setEvents(prevEvents => [...prevEvents, event])
      showNotification('success', 'Event created successfully')
    }
  }

  const handleEventDelete = (eventId) => {
    const event = events.find(e => e.id === eventId)
    
    // If it's an exam event, also delete the exam
    if (event && event.category === 'exam' && event.examId) {
      setExams(prev => prev.filter(exam => exam.id !== event.examId))
    }
    
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
    showNotification('success', 'Event deleted successfully')
  }

  const handleChecklistItemToggle = (listType, itemId) => {
    if (listType === 'dayBefore') {
      setDayBeforeChecklist(prev => 
        prev.map(item => {
          if (item.id === itemId) {
            const newState = !item.checked
            // Show notification when item is checked
            if (newState) {
              showNotification('success', `Item "${item.text}" marked as completed`)
            }
            return { ...item, checked: newState }
          }
          return item
        })
      )
    } else if (listType === 'examDay') {
      setExamDayChecklist(prev => 
        prev.map(item => {
          if (item.id === itemId) {
            const newState = !item.checked
            // Show notification when item is checked
            if (newState) {
              showNotification('success', `Item "${item.text}" marked as completed`)
            }
            return { ...item, checked: newState }
          }
          return item
        })
      )
    }
  }

  const addNewChecklistItem = (listType) => {
    const text = listType === 'dayBefore' ? newChecklistItem.dayBefore : newChecklistItem.examDay
    
    if (!text.trim()) return
    
    const newItem = {
      id: crypto.randomUUID(),
      text: text,
      checked: false
    }
    
    if (listType === 'dayBefore') {
      setDayBeforeChecklist(prev => [...prev, newItem])
      setNewChecklistItem(prev => ({ ...prev, dayBefore: '' }))
      showNotification('success', 'New checklist item added')
    } else if (listType === 'examDay') {
      setExamDayChecklist(prev => [...prev, newItem])
      setNewChecklistItem(prev => ({ ...prev, examDay: '' }))
      showNotification('success', 'New checklist item added')
    }
  }

  const handleChecklistItemEdit = (listType, itemId, newText) => {
    if (listType === 'dayBefore') {
      setDayBeforeChecklist(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, text: newText } : item
        )
      )
    } else if (listType === 'examDay') {
      setExamDayChecklist(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, text: newText } : item
        )
      )
    }
    showNotification('success', 'Checklist item updated')
  }

  const handleChecklistItemDelete = (listType, itemId) => {
    if (listType === 'dayBefore') {
      setDayBeforeChecklist(prev => prev.filter(item => item.id !== itemId))
    } else if (listType === 'examDay') {
      setExamDayChecklist(prev => prev.filter(item => item.id !== itemId))
    }
    showNotification('success', 'Checklist item deleted')
  }

  // Sync exams with calendar events
  useEffect(() => {
    // For each exam, ensure there's a corresponding calendar event
    exams.forEach(exam => {
      const existingEvent = events.find(event => event.examId === exam.id)
      
      if (!existingEvent) {
        // Create a new event for this exam
        const newEvent = {
          id: crypto.randomUUID(),
          examId: exam.id, // Reference to the exam
          title: exam.exam,
          date: new Date(exam.date),
          time: exam.time,
          location: exam.location,
          category: 'exam'
        }
        
        setEvents(prev => [...prev, newEvent])
      }
    })
  }, [exams])

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  return (
    <div>
      <div>
        <Navbar />
        <header className='relative'>
          <GifContainer />
        </header>
        <HeaderContent title="Exam Preparation" />
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
            {/* Exam Preparation Content */}
            <div className='rounded-lg p-6 min-h-[600px]'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                  Exam Preparation
                </h2>
              </div>

              {/* Horizontal line under header */}
              <div className="w-full h-px bg-gray-700 mb-6"></div>

              {/* Info Box with close button */}
              {showInfoBox && (
                <div className="border rounded-lg p-4 mb-6 relative" style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--accent-color) 20%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)'
                }}>
                  <button
                    onClick={() => setShowInfoBox(false)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-black/20 transition-colors"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-start gap-3 pr-8">
                    <BookOpen size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Prepare for Exams here.</p>
                      <p className="text-gray-300 text-sm italic">To prepare for a new exam, click + New in Exam Preparation Table. Then select Exam Template. Exam template will pop up. From there you can plan your exams in detail. Make sure you fill in all the properties. Your exams will also appear in Exam Calendar. This will help you track deadlines.</p>
                      <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Exam Preparation Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Exam Preparation
                  </h3>
                  <button
                    onClick={addNewExam}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    New
                  </button>
                </div>

                {/* Exam Table */}
                <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2a2a2a]">
                        <tr>
                          <th className="text-left p-4 text-gray-300 font-medium">Exam</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Date</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Time</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Location</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Target Grade</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Notes</th>
                          <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map(exam => {
                          const daysUntil = calculateDaysUntil(exam.date)
                          const isUpcoming = new Date(exam.date) >= new Date()
                          
                          return (
                            <tr key={exam.id} className={`border-t border-gray-700 hover:bg-[#2a2a2a]/50 ${!isUpcoming ? 'opacity-60' : ''}`}>
                              <td className="p-4">
                                {editingExam === exam.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.exam || ''}
                                    onChange={(e) => handleEditingValueChange('exam', e.target.value)}
                                    className="w-full bg-transparent text-white border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Enter exam name"
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-white font-medium">{exam.exam || 'Untitled'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {editingExam === exam.id ? (
                                  <input
                                    type="date"
                                    value={editingValues.date || ''}
                                    onChange={(e) => handleEditingValueChange('date', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  />
                                ) : (
                                  <div>
                                    <div className="text-gray-300">{exam.date.toLocaleDateString()}</div>
                                    <div className={`text-xs ${!isUpcoming ? 'text-red-400' : 'text-gray-500'}`}>
                                      {daysUntil}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                {editingExam === exam.id ? (
                                  <input
                                    type="time"
                                    value={editingValues.time || ''}
                                    onChange={(e) => handleEditingValueChange('time', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  />
                                ) : (
                                  <span className="text-gray-300">{exam.time || '-'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {editingExam === exam.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.location || ''}
                                    onChange={(e) => handleEditingValueChange('location', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Location"
                                  />
                                ) : (
                                  <span className="text-gray-300">{exam.location || '-'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {editingExam === exam.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.targetGrade || ''}
                                    onChange={(e) => handleEditingValueChange('targetGrade', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Target grade"
                                  />
                                ) : (
                                  <span className="text-gray-300">{exam.targetGrade || '-'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {editingExam === exam.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.notes || ''}
                                    onChange={(e) => handleEditingValueChange('notes', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Notes"
                                  />
                                ) : (
                                  <span className="text-gray-300">{exam.notes || '-'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  {editingExam === exam.id ? (
                                    <>
                                      <button
                                        onClick={() => saveInlineEdit(exam.id)}
                                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                                        title="Save"
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={cancelInlineEdit}
                                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                        title="Cancel"
                                      >
                                        ✕
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => startEditingExam(exam)}
                                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteExam(exam.id)}
                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {/* Add new row button */}
                        <tr>
                          <td colSpan="7" className="p-4">
                            <button
                              onClick={addNewExam}
                              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                            >
                              <Plus size={16} />
                              <span className="text-sm">New page</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Exam Checklist Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Target size={18} className="text-gray-400" />
                    <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                      Exam Checklist
                    </h3>
                  </div>
                </div>

                <div className="text-gray-300 text-sm mb-4">
                  This will help you to prepare properly for the upcoming Exams.
                </div>

                {/* Checklists Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* The Day Before Exam */}
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-accent font-[Libre_Baskerville] italic text-lg mb-4">The Day Before Exam</h4>
                    
                    <div className="space-y-3">
                      {dayBeforeChecklist.map(item => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => handleChecklistItemToggle('dayBefore', item.id)}
                              className="w-4 h-4 rounded"
                              style={{ accentColor: 'var(--accent-color)' }}
                            />
                          </div>
                          <div className="flex-1">
                            {editingChecklistItem === item.id ? (
                              <input
                                type="text"
                                value={item.text}
                                onChange={(e) => handleChecklistItemEdit('dayBefore', item.id, e.target.value)}
                                onBlur={() => setEditingChecklistItem(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingChecklistItem(null)
                                  }
                                }}
                                className="w-full bg-transparent text-white border-b border-gray-600 focus:border-accent outline-none text-sm"
                                autoFocus
                              />
                            ) : (
                              <div 
                                className={`text-sm ${item.checked ? 'line-through text-gray-500' : 'text-gray-300'}`}
                                onClick={() => setEditingChecklistItem(item.id)}
                              >
                                {item.text}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleChecklistItemDelete('dayBefore', item.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add new item input */}
                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="text"
                          value={newChecklistItem.dayBefore}
                          onChange={(e) => setNewChecklistItem(prev => ({ ...prev, dayBefore: e.target.value }))}
                          placeholder="Type a text..."
                          className="flex-1 bg-transparent border-b border-gray-600 focus:border-accent outline-none text-white text-sm py-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newChecklistItem.dayBefore.trim()) {
                              addNewChecklistItem('dayBefore')
                            }
                          }}
                        />
                        <button
                          onClick={() => addNewChecklistItem('dayBefore')}
                          disabled={!newChecklistItem.dayBefore.trim()}
                          className="text-gray-400 hover:text-white disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* On the Day of Exam */}
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h4 className="text-accent font-[Libre_Baskerville] italic text-lg mb-4">On the Day of Exam</h4>
                    
                    <div className="space-y-3">
                      {examDayChecklist.map(item => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => handleChecklistItemToggle('examDay', item.id)}
                              className="w-4 h-4 rounded"
                              style={{ accentColor: 'var(--accent-color)' }}
                            />
                          </div>
                          <div className="flex-1">
                            {editingChecklistItem === item.id ? (
                              <input
                                type="text"
                                value={item.text}
                                onChange={(e) => handleChecklistItemEdit('examDay', item.id, e.target.value)}
                                onBlur={() => setEditingChecklistItem(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingChecklistItem(null)
                                  }
                                }}
                                className="w-full bg-transparent text-white border-b border-gray-600 focus:border-accent outline-none text-sm"
                                autoFocus
                              />
                            ) : (
                              <div 
                                className={`text-sm ${item.checked ? 'line-through text-gray-500' : 'text-gray-300'}`}
                                onClick={() => setEditingChecklistItem(item.id)}
                              >
                                {item.text}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleChecklistItemDelete('examDay', item.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add new item input */}
                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="text"
                          value={newChecklistItem.examDay}
                          onChange={(e) => setNewChecklistItem(prev => ({ ...prev, examDay: e.target.value }))}
                          placeholder="Type a text..."
                          className="flex-1 bg-transparent border-b border-gray-600 focus:border-accent outline-none text-white text-sm py-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newChecklistItem.examDay.trim()) {
                              addNewChecklistItem('examDay')
                            }
                          }}
                        />
                        <button
                          onClick={() => addNewChecklistItem('examDay')}
                          disabled={!newChecklistItem.examDay.trim()}
                          className="text-gray-400 hover:text-white disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam Calendar Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Exam Calendar
                  </h3>
                </div>

                {/* Big Calendar Component */}
                <BigCalendar
                  events={events}
                  onAddEvent={handleEventAdd}
                  onDeleteEvent={handleEventDelete}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Notification */}
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default ExamPreparationPage