import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, PenTool, Calendar, Clock, Flag, Edit, Trash2, AlertCircle, X, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useAuth } from '../../hooks/useAuth'
import '../../App.css'

function EssayPlannerPage() {
  const { isAuthenticated, user } = useAuth()
  const [essays, setEssays] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEssay, setSelectedEssay] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(true)

  // Timeline state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('Month')

  // Editing states for inline editing
  const [editingEssay, setEditingEssay] = useState(null)
  const [editingValues, setEditingValues] = useState({})

  const [essayForm, setEssayForm] = useState({
    topic: '',
    dueDate: '',
    status: 'Not started',
    wordsRequired: '',
    myWordCount: '',
    notes: ''
  })

  const statusOptions = [
    { value: 'Not started', label: 'Not started', color: '#6b7280' },
    { value: 'Planning', label: 'Planning', color: '#f59e0b' },
    { value: 'Researching', label: 'Researching', color: '#3b82f6' },
    { value: 'Writing', label: 'Writing', color: '#8b5cf6' },
    { value: 'Editing', label: 'Editing', color: '#06b6d4' },
    { value: 'Completed', label: 'Completed', color: '#10b981' }
  ]

  // Load data from localStorage
  useEffect(() => {
    const savedEssays = localStorage.getItem('essayPlannerData')
    
    if (savedEssays) {
      try {
        const parsedEssays = JSON.parse(savedEssays).map(essay => ({
          ...essay,
          dueDate: new Date(essay.dueDate)
        }))
        setEssays(parsedEssays)
      } catch (error) {
        console.error('Error parsing essays:', error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (essays.length > 0) {
      localStorage.setItem('essayPlannerData', JSON.stringify(essays))
    }
  }, [essays])

  // Timeline calculations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const getDaysToShow = () => {
    if (viewMode === 'Week') {
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      startOfWeek.setDate(startOfWeek.getDate() - day - 7)
      
      const days = []
      for (let i = 0; i < 21; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        days.push(date)
      }
      return days
    } else {
      const startDate = new Date(currentYear, currentMonth, 1)
      startDate.setDate(startDate.getDate() - 15)
      
      const endDate = new Date(currentYear, currentMonth + 1, 0)
      endDate.setDate(endDate.getDate() + 15)
      
      const days = []
      const currentDay = new Date(startDate)
      
      while (currentDay <= endDate) {
        days.push(new Date(currentDay))
        currentDay.setDate(currentDay.getDate() + 1)
      }
      
      return days
    }
  }

  const daysToShow = getDaysToShow()
  const today = new Date()
  const dayWidth = viewMode === 'Week' ? 120 : 40
  const totalWidth = daysToShow.length * dayWidth

  const navigateTime = (direction) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'Week') {
      newDate.setDate(currentDate.getDate() + (direction * 7))
    } else {
      newDate.setMonth(currentMonth + direction)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getTodayPosition = () => {
    const todayIndex = daysToShow.findIndex(date => 
      date.toDateString() === today.toDateString()
    )
    return todayIndex >= 0 ? todayIndex * dayWidth : -1
  }

  const getDayPosition = (date) => {
    const dayIndex = daysToShow.findIndex(d => d.toDateString() === date.toDateString())
    return dayIndex >= 0 ? dayIndex * dayWidth : 0
  }

  const getEssayWidth = (essay) => {
    // For essays, we'll just show them on their due date
    const dayIndex = daysToShow.findIndex(d => d.toDateString() === essay.dueDate.toDateString())
    return dayIndex >= 0 ? dayWidth : 0
  }

  const getVisibleEssays = () => {
    const visibleStart = daysToShow[0]
    const visibleEnd = daysToShow[daysToShow.length - 1]
    
    return essays.filter(essay => {
      const essayDueDate = new Date(essay.dueDate)
      return essayDueDate >= visibleStart && essayDueDate <= visibleEnd
    })
  }

  const visibleEssays = getVisibleEssays()

  const getHeaderText = () => {
    if (viewMode === 'Week') {
      const centerIndex = Math.floor(daysToShow.length / 2)
      const centerDate = daysToShow[centerIndex]
      const weekStart = new Date(centerDate)
      weekStart.setDate(centerDate.getDate() - centerDate.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`
      } else {
        return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
      }
    } else {
      return `${monthNames[currentMonth]} ${currentYear}`
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!essayForm.topic.trim()) {
      errors.topic = 'Essay topic is required'
    }
    
    if (!essayForm.dueDate) {
      errors.dueDate = 'Due date is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (field, value) => {
    setEssayForm(prev => ({ ...prev, [field]: value }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Inline editing functions
  const startEditingEssay = (essay) => {
    setEditingEssay(essay.id)
    setEditingValues({
      topic: essay.topic,
      dueDate: essay.dueDate.toISOString().split('T')[0],
      status: essay.status,
      wordsRequired: essay.wordsRequired || '',
      myWordCount: essay.myWordCount || '',
      notes: essay.notes || ''
    })
  }

  const saveInlineEdit = (id) => {
    const updatedEssay = {
      ...essays.find(e => e.id === id),
      ...editingValues,
      dueDate: new Date(editingValues.dueDate),
      id: id
    }
    setEssays(prev => prev.map(essay => 
      essay.id === id ? updatedEssay : essay
    ))
    setEditingEssay(null)
    setEditingValues({})
  }

  const cancelInlineEdit = () => {
    setEditingEssay(null)
    setEditingValues({})
  }

  const addNewEssay = () => {
    const newEssay = {
      id: crypto.randomUUID(),
      topic: '',
      dueDate: new Date(),
      status: 'Not started',
      wordsRequired: '',
      myWordCount: '',
      notes: '',
      createdAt: new Date().toISOString()
    }

    setEssays(prev => [...prev, newEssay])
    startEditingEssay(newEssay)
  }

  const handleDeleteEssay = (essayId) => {
    setEssays(prev => prev.filter(essay => essay.id !== essayId))
  }

  const handleEditingValueChange = (field, value) => {
    setEditingValues(prev => ({ ...prev, [field]: value }))
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.color : '#6b7280'
  }

  const calculateDaysUntil = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    return `${diffDays} days left`
  }

  const calculateCompletionPercentage = (essay) => {
    if (!essay.wordsRequired || !essay.myWordCount) return 0
    const required = parseInt(essay.wordsRequired)
    const current = parseInt(essay.myWordCount)
    if (isNaN(required) || isNaN(current) || required === 0) return 0
    return Math.min(100, Math.round((current / required) * 100))
  }

  // Get month labels for month view
  const getMonthLabels = () => {
    const labels = []
    let currentMonthLabel = null
    let currentMonthStart = 0
    
    daysToShow.forEach((date, index) => {
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      
      if (monthYear !== currentMonthLabel) {
        if (currentMonthLabel) {
          labels.push({
            label: currentMonthLabel,
            start: currentMonthStart,
            width: (index - currentMonthStart) * dayWidth
          })
        }
        currentMonthLabel = monthYear
        currentMonthStart = index
      }
    })
    
    if (currentMonthLabel) {
      labels.push({
        label: currentMonthLabel,
        start: currentMonthStart,
        width: (daysToShow.length - currentMonthStart) * dayWidth
      })
    }
    
    return labels
  }

  const monthLabels = viewMode === 'Month' ? getMonthLabels() : []

  // Implement drag and drop for essays in timeline
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedEssay: null,
    startX: 0,
    originalDueDate: null,
    hasMoved: false
  })

  const handleEssayMouseDown = (e, essay) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragState({
      isDragging: true,
      draggedEssay: essay,
      startX: e.clientX,
      originalDueDate: new Date(essay.dueDate),
      hasMoved: false
    })
    
    document.body.style.userSelect = 'none'
  }

  const handleEssayClick = (essay, e) => {
    e.stopPropagation()
    
    if (!dragState.isDragging && !dragState.hasMoved) {
      startEditingEssay(essay)
    }
  }

  // Global mouse handlers for essay dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState.isDragging || !dragState.draggedEssay) return
      
      const deltaX = e.clientX - dragState.startX
      
      if (Math.abs(deltaX) > 5) {
        setDragState(prev => ({ ...prev, hasMoved: true }))
      }
      
      const daysDelta = Math.round(deltaX / dayWidth)
      
      if (daysDelta === 0) return
      
      const { draggedEssay, originalDueDate } = dragState
      let newDueDate = new Date(originalDueDate)
      newDueDate.setDate(originalDueDate.getDate() + daysDelta)
      
      const updatedEssay = {
        ...draggedEssay,
        dueDate: newDueDate
      }
      
      setEssays(prev => prev.map(essay => 
        essay.id === draggedEssay.id ? updatedEssay : essay
      ))
    }
    
    const handleMouseUp = () => {
      const hadMoved = dragState.hasMoved
      
      setDragState({
        isDragging: false,
        draggedEssay: null,
        startX: 0,
        originalDueDate: null,
        hasMoved: hadMoved
      })
      
      if (hadMoved) {
        setTimeout(() => {
          setDragState(prev => ({ ...prev, hasMoved: false }))
        }, 100)
      }
      
      document.body.style.userSelect = ''
    }
    
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, dayWidth])

  return (
    <div>
      <div>
        <Navbar />
        <header className='relative'>
          <GifContainer />
        </header>
        <HeaderContent title="Essay Planner" />
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
            {/* Essay Planner Content */}
            <div className='rounded-lg p-6 min-h-[600px]'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                  Essay Planner
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
                    <PenTool size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Essay Writing.</p>
                      <p className="text-gray-300 text-sm italic">To plan a new essay, click + New in Essay Planner Table. Then select Essay Template. Essay template will pop up. From there you can plan your essay in detail. Make sure you fill in all the properties. To enter Start and End Date of the essay, click on the Start - End Date Property. Then in the calendar popup, turn on End Date. Your essay will also appear in Essay Pipeline. This will help you track deadlines.</p>
                      <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Essay Planner Table */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Essay Planner
                  </h3>
                  <button
                    onClick={addNewEssay}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    New
                  </button>
                </div>

                {/* Essay Table */}
                <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2a2a2a]">
                        <tr>
                          <th className="text-left p-4 text-gray-300 font-medium">Topic</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Due Date</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                          <th className="text-center p-4 text-gray-300 font-medium">Words Required</th>
                          <th className="text-center p-4 text-gray-300 font-medium">My Word Count</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Notes</th>
                          <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {essays.map(essay => {
                          const daysUntil = calculateDaysUntil(essay.dueDate)
                          const isOverdue = essay.dueDate < new Date() && essay.status !== 'Completed'
                          const completionPercentage = calculateCompletionPercentage(essay)
                          
                          return (
                            <tr key={essay.id} className="border-t border-gray-700 hover:bg-[#2a2a2a]/50">
                              <td className="p-4">
                                {editingEssay === essay.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.topic || ''}
                                    onChange={(e) => handleEditingValueChange('topic', e.target.value)}
                                    className="w-full bg-transparent text-white border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Enter essay topic"
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-white font-medium">{essay.topic || 'New page'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {editingEssay === essay.id ? (
                                  <input
                                    type="date"
                                    value={editingValues.dueDate || ''}
                                    onChange={(e) => handleEditingValueChange('dueDate', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  />
                                ) : (
                                  <div>
                                    <div className="text-gray-300">{essay.dueDate.toLocaleDateString()}</div>
                                    <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
                                      {daysUntil}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                {editingEssay === essay.id ? (
                                  <select
                                    value={editingValues.status || 'Not started'}
                                    onChange={(e) => handleEditingValueChange('status', e.target.value)}
                                    className="w-full bg-[#2a2a2a] text-white border border-gray-600 rounded px-2 py-1 focus:border-accent outline-none"
                                  >
                                    {statusOptions.map(option => (
                                      <option key={option.value} value={option.value} className="bg-[#2a2a2a]">
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: getStatusColor(essay.status) }}
                                    />
                                    <span className="text-gray-300">{essay.status}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {editingEssay === essay.id ? (
                                  <input
                                    type="number"
                                    value={editingValues.wordsRequired || ''}
                                    onChange={(e) => handleEditingValueChange('wordsRequired', e.target.value)}
                                    className="w-full bg-transparent text-center text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="text-gray-300">{essay.wordsRequired || '-'}</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {editingEssay === essay.id ? (
                                  <input
                                    type="number"
                                    value={editingValues.myWordCount || ''}
                                    onChange={(e) => handleEditingValueChange('myWordCount', e.target.value)}
                                    className="w-full bg-transparent text-center text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="0"
                                  />
                                ) : (
                                  <div>
                                    <span className="text-gray-300">{essay.myWordCount || '-'}</span>
                                    {essay.wordsRequired && essay.myWordCount && (
                                      <div className="mt-1 w-full bg-gray-700 rounded-full h-1.5">
                                        <div 
                                          className="h-1.5 rounded-full" 
                                          style={{ 
                                            width: `${completionPercentage}%`,
                                            backgroundColor: getStatusColor(essay.status)
                                          }}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                {editingEssay === essay.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.notes || ''}
                                    onChange={(e) => handleEditingValueChange('notes', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Notes"
                                  />
                                ) : (
                                  <span className="text-gray-300">{essay.notes || '-'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  {editingEssay === essay.id ? (
                                    <>
                                      <button
                                        onClick={() => saveInlineEdit(essay.id)}
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
                                        onClick={() => startEditingEssay(essay)}
                                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEssay(essay.id)}
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
                              onClick={addNewEssay}
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

              {/* Essay Pipeline Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Essay Pipeline
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTime(-1)}
                        className="p-2 hover:bg-gray-700 rounded"
                        disabled={loading}
                      >
                        <ChevronLeft size={16} className="text-gray-400" />
                      </button>
                      <span className="text-white text-base font-medium min-w-[200px] text-center">
                        {getHeaderText()}
                      </span>
                      <button
                        onClick={() => navigateTime(1)}
                        className="p-2 hover:bg-gray-700 rounded"
                        disabled={loading}
                      >
                        <ChevronRight size={16} className="text-gray-400" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        className={`px-3 py-1 text-sm rounded ${
                          viewMode === 'Month' 
                            ? 'text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                        style={viewMode === 'Month' ? { backgroundColor: 'var(--accent-color, #97e7aa)' } : {}}
                        onClick={() => setViewMode('Month')}
                        disabled={loading}
                      >
                        Month
                      </button>
                      <button 
                        className={`px-3 py-1 text-sm rounded ${
                          viewMode === 'Week' 
                            ? 'text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                        style={viewMode === 'Week' ? { backgroundColor: 'var(--accent-color, #97e7aa)' } : {}}
                        onClick={() => setViewMode('Week')}
                        disabled={loading}
                      >
                        Week
                      </button>
                      <button 
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded"
                        onClick={goToToday}
                        disabled={loading}
                      >
                        Today
                      </button>
                      <button
                        onClick={addNewEssay}
                        className="flex items-center gap-2 px-3 py-1 text-white rounded text-sm hover:opacity-80 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--accent-color, #97e7aa)' }}
                        disabled={loading}
                      >
                        <Plus size={14} />
                        New
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="w-full bg-[#1a1a1a] rounded-lg h-[300px] flex flex-col">
                  <div className="relative flex-1 overflow-hidden">
                    <div className="h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
                      <div 
                        className="relative h-full cursor-pointer select-none"
                        style={{ width: `${totalWidth}px` }}
                      >
                        {/* Month Labels (only for month view) */}
                        {viewMode === 'Month' && (
                          <div 
                            className="flex h-8 bg-[#1a1a1a] sticky top-0 z-20 border-b border-gray-600"
                            style={{ width: `${totalWidth}px` }}
                          >
                            {monthLabels.map((month, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-center text-sm font-medium text-gray-300"
                                style={{ 
                                  left: `${month.start * dayWidth}px`,
                                  width: `${month.width}px`,
                                  position: 'absolute'
                                }}
                              >
                                {month.label}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Days Header */}
                        <div 
                          className="flex h-10 bg-[#1a1a1a] sticky z-10 border-b border-gray-700"
                          style={{ 
                            width: `${totalWidth}px`,
                            top: viewMode === 'Month' ? '32px' : '0px'
                          }}
                        >
                          {daysToShow.map((date, i) => {
                            const isToday = date.toDateString() === today.toDateString()
                            const dayText = viewMode === 'Week' 
                              ? `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getDate()}`
                              : date.getDate().toString()
                            
                            return (
                              <div
                                key={i}
                                className={`flex items-center justify-center text-sm relative ${
                                  isToday
                                    ? 'text-white font-semibold' 
                                    : 'text-gray-300'
                                }`}
                                style={{ 
                                  width: `${dayWidth}px`,
                                  backgroundColor: isToday ? 'var(--accent-color, #97e7aa)' : 'transparent'
                                }}
                              >
                                {dayText}
                              </div>
                            )
                          })}
                        </div>

                        {/* Vertical lines for each day */}
                        {daysToShow.map((_, i) => (
                          <div
                            key={`vertical-line-${i}`}
                            className="absolute bottom-0 w-px bg-gray-800 z-0"
                            style={{ 
                              left: `${(i + 1) * dayWidth}px`,
                              top: viewMode === 'Month' ? '72px' : '40px'
                            }}
                          />
                        ))}

                        {/* Today Marker Line */}
                        {(() => {
                          const todayPosition = getTodayPosition()
                          if (todayPosition >= 0) {
                            return (
                              <div
                                className="absolute bottom-0 w-0.5 z-20 pointer-events-none"
                                style={{ 
                                  left: `${todayPosition + dayWidth / 2}px`,
                                  top: viewMode === 'Month' ? '72px' : '40px',
                                  backgroundColor: 'var(--accent-color, #97e7aa)'
                                }}
                              />
                            )
                          }
                          return null
                        })()}

                        {/* Essays Area */}
                        <div 
                          className="relative h-full pt-4 pb-4 overflow-y-auto custom-scrollbar z-10"
                          style={{ marginTop: viewMode === 'Month' ? '32px' : '0px' }}
                        >
                          {visibleEssays.map((essay, index) => {
                            const statusColor = getStatusColor(essay.status)
                            const isDraggedEssay = dragState.draggedEssay && dragState.draggedEssay.id === essay.id
                            
                            return (
                              <div
                                key={essay.id}
                                className={`absolute h-10 rounded cursor-pointer transition-all duration-200 group z-20 select-none ${
                                  isDraggedEssay ? 'opacity-80 shadow-lg z-30' : ''
                                }`}
                                style={{
                                  left: `${getDayPosition(essay.dueDate)}px`,
                                  width: `${dayWidth}px`,
                                  top: `${index * 44 + 8}px`,
                                  backgroundColor: statusColor
                                }}
                                onClick={(e) => handleEssayClick(essay, e)}
                                onMouseDown={(e) => handleEssayMouseDown(e, essay)}
                              >
                                <div className="flex items-center h-full px-3 text-white text-sm pointer-events-none">
                                  <span className="truncate">
                                    {essay.topic || 'New page'}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default EssayPlannerPage