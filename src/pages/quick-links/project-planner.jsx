import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, Target, Calendar, Clock, Flag, Edit, Trash2, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useAuth } from '../../hooks/useAuth'
import '../../App.css'

function ProjectPlannerPage() {
  const { isAuthenticated, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(true)

  // Timeline state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('Month')

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not started',
    priority: 'normal',
    category: '',
    teamMembers: '',
    budget: '',
    notes: ''
  })

  const statusOptions = [
    { value: 'Not started', label: 'Not started', color: '#6b7280' },
    { value: 'Planning', label: 'Planning', color: '#f59e0b' },
    { value: 'In progress', label: 'In progress', color: '#3b82f6' },
    { value: 'On hold', label: 'On hold', color: '#ef4444' },
    { value: 'Completed', label: 'Completed', color: '#10b981' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#6b7280' },
    { value: 'normal', label: 'Normal', color: '#3b82f6' },
    { value: 'high', label: 'High', color: '#f59e0b' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' }
  ]

  // Load data from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projectPlannerData')
    
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects).map(project => ({
          ...project,
          startDate: new Date(project.startDate),
          endDate: new Date(project.endDate)
        }))
        setProjects(parsedProjects)
      } catch (error) {
        console.error('Error parsing projects:', error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('projectPlannerData', JSON.stringify(projects))
    }
  }, [projects])

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

  const getProjectWidth = (project) => {
    const startIndex = daysToShow.findIndex(d => d.toDateString() === project.startDate.toDateString())
    const endIndex = daysToShow.findIndex(d => d.toDateString() === project.endDate.toDateString())
    
    if (startIndex >= 0 && endIndex >= 0) {
      return Math.max(dayWidth, (endIndex - startIndex + 1) * dayWidth)
    }
    
    const projectStart = new Date(project.startDate)
    const projectEnd = new Date(project.endDate)
    const visibleStart = daysToShow[0]
    const visibleEnd = daysToShow[daysToShow.length - 1]
    
    if (projectStart <= visibleEnd && projectEnd >= visibleStart) {
      const effectiveStart = projectStart < visibleStart ? visibleStart : projectStart
      const effectiveEnd = projectEnd > visibleEnd ? visibleEnd : projectEnd
      
      const startIdx = daysToShow.findIndex(d => d.toDateString() === effectiveStart.toDateString())
      const endIdx = daysToShow.findIndex(d => d.toDateString() === effectiveEnd.toDateString())
      
      if (startIdx >= 0 && endIdx >= 0) {
        return Math.max(dayWidth, (endIdx - startIdx + 1) * dayWidth)
      }
    }
    
    return dayWidth
  }

  const getVisibleProjects = () => {
    const visibleStart = daysToShow[0]
    const visibleEnd = daysToShow[daysToShow.length - 1]
    
    return projects.filter(project => {
      const projectStart = new Date(project.startDate)
      const projectEnd = new Date(project.endDate)
      
      return projectStart <= visibleEnd && projectEnd >= visibleStart
    })
  }

  const visibleProjects = getVisibleProjects()

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
    
    if (!projectForm.title.trim()) {
      errors.title = 'Project title is required'
    }
    
    if (!projectForm.startDate) {
      errors.startDate = 'Start date is required'
    }
    
    if (!projectForm.endDate) {
      errors.endDate = 'End date is required'
    }
    
    if (projectForm.startDate && projectForm.endDate) {
      const start = new Date(projectForm.startDate)
      const end = new Date(projectForm.endDate)
      if (end < start) {
        errors.endDate = 'End date must be after start date'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (field, value) => {
    setProjectForm(prev => ({ ...prev, [field]: value }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddProject = () => {
    setSelectedProject(null)
    setValidationErrors({})
    setProjectForm({
      title: 'New page',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Not started',
      priority: 'normal',
      category: '',
      teamMembers: '',
      budget: '',
      notes: ''
    })
    setIsModalOpen(true)
  }

  const handleEditProject = (project) => {
    setSelectedProject(project)
    setValidationErrors({})
    setProjectForm({
      title: project.title,
      description: project.description || '',
      startDate: project.startDate.toISOString().split('T')[0],
      endDate: project.endDate.toISOString().split('T')[0],
      status: project.status,
      priority: project.priority,
      category: project.category || '',
      teamMembers: project.teamMembers || '',
      budget: project.budget || '',
      notes: project.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleSaveProject = () => {
    if (!validateForm()) {
      return
    }

    const projectData = {
      title: projectForm.title,
      description: projectForm.description,
      startDate: new Date(projectForm.startDate),
      endDate: new Date(projectForm.endDate),
      status: projectForm.status,
      priority: projectForm.priority,
      category: projectForm.category,
      teamMembers: projectForm.teamMembers,
      budget: projectForm.budget,
      notes: projectForm.notes
    }

    if (selectedProject) {
      // Update existing project
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id ? { ...project, ...projectData } : project
      ))
    } else {
      // Add new project
      const newProject = {
        id: crypto.randomUUID(),
        ...projectData,
        createdAt: new Date().toISOString()
      }
      setProjects(prev => [...prev, newProject])
    }

    setIsModalOpen(false)
    setValidationErrors({})
    setProjectForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Not started',
      priority: 'normal',
      category: '',
      teamMembers: '',
      budget: '',
      notes: ''
    })
    setSelectedProject(null)
  }

  const handleDeleteProject = () => {
    if (selectedProject) {
      setProjects(prev => prev.filter(project => project.id !== selectedProject.id))
      setIsModalOpen(false)
      setSelectedProject(null)
    }
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.color : '#6b7280'
  }

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority)
    return priorityOption ? priorityOption.color : '#6b7280'
  }

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
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

  const sortedProjects = projects.sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  )

  // Implement drag and drop for projects in timeline
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedProject: null,
    dragMode: null, // 'move', 'resize-left', 'resize-right'
    startX: 0,
    originalStart: null,
    originalEnd: null,
    hasMoved: false
  })

  const handleProjectMouseDown = (e, project) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const projectWidth = rect.width
    
    // Determine drag mode based on click position
    let mode = 'move'
    if (clickX < 20) {
      mode = 'resize-left'
    } else if (clickX > projectWidth - 20) {
      mode = 'resize-right'
    }
    
    setDragState({
      isDragging: true,
      draggedProject: project,
      dragMode: mode,
      startX: e.clientX,
      originalStart: new Date(project.startDate),
      originalEnd: new Date(project.endDate),
      hasMoved: false
    })
    
    document.body.style.userSelect = 'none'
  }

  const handleProjectClick = (project, e) => {
    e.stopPropagation()
    
    if (!dragState.isDragging && !dragState.hasMoved) {
      handleEditProject(project)
    }
  }

  // Global mouse handlers for project dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState.isDragging || !dragState.draggedProject) return
      
      const deltaX = e.clientX - dragState.startX
      
      if (Math.abs(deltaX) > 5) {
        setDragState(prev => ({ ...prev, hasMoved: true }))
      }
      
      const daysDelta = Math.round(deltaX / dayWidth)
      
      if (daysDelta === 0) return
      
      const { draggedProject, dragMode, originalStart, originalEnd } = dragState
      let newStart = new Date(originalStart)
      let newEnd = new Date(originalEnd)
      
      if (dragMode === 'move') {
        newStart.setDate(originalStart.getDate() + daysDelta)
        newEnd.setDate(originalEnd.getDate() + daysDelta)
      } else if (dragMode === 'resize-left') {
        newStart.setDate(originalStart.getDate() + daysDelta)
        if (newStart >= originalEnd) {
          newStart = new Date(originalEnd)
          newStart.setDate(newStart.getDate() - 1)
        }
      } else if (dragMode === 'resize-right') {
        newEnd.setDate(originalEnd.getDate() + daysDelta)
        if (newEnd <= originalStart) {
          newEnd = new Date(originalStart)
          newEnd.setDate(newEnd.getDate() + 1)
        }
      }
      
      const updatedProject = {
        ...draggedProject,
        startDate: newStart,
        endDate: newEnd
      }
      
      setProjects(prev => prev.map(project => 
        project.id === draggedProject.id ? updatedProject : project
      ))
    }
    
    const handleMouseUp = () => {
      const hadMoved = dragState.hasMoved
      
      setDragState({
        isDragging: false,
        draggedProject: null,
        dragMode: null,
        startX: 0,
        originalStart: null,
        originalEnd: null,
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
        <HeaderContent title="Project Planner" />
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
            {/* Project Planner Content */}
            <div className='rounded-lg p-6 min-h-[600px]'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                  Project Planner
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
                    <Target size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Plan your study projects here.</p>
                      <p className="text-gray-300 text-sm italic">To add a new project, click + New in Project Planner Section. Then select Project Template. Project template will pop up. From there you can plan your projects in detail. To add a project image, at the top of the project page, click Add Cover. Make sure you fill in all the properties. To enter Start and End Date of the project, click on the Start - End Date Property. Then in the calendar popup, turn on End Date. Your projects will also appear in Project Pipeline. This will help you track project deadlines.</p>
                      <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Planner Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Project Planner
                  </h3>
                  <button
                    onClick={handleAddProject}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    New
                  </button>
                </div>

                {/* Projects Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
                  {sortedProjects.map(project => {
                    const duration = calculateDuration(project.startDate, project.endDate)
                    const daysUntil = calculateDaysUntil(project.startDate)
                    const statusColor = getStatusColor(project.status)
                    const priorityColor = getPriorityColor(project.priority)

                    return (
                      <div
                        key={project.id}
                        className='bg-[#2a2a2a] rounded-lg overflow-hidden hover:bg-[#333333] transition-colors cursor-pointer group'
                        onClick={() => handleEditProject(project)}
                      >
                        {/* Project Header */}
                        <div className='p-4'>
                          {/* Project Title */}
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='text-white font-medium text-base truncate flex-1'>
                              {project.title}
                            </h4>
                            <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  handleEditProject(project)
                                }}
                                className='p-1 hover:bg-blue-600 rounded transition-all'
                                title='Edit'
                              >
                                <Edit size={12} className='text-white' />
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          {project.description && (
                            <div className='mb-2'>
                              <p className='text-gray-300 text-sm truncate'>
                                {project.description}
                              </p>
                            </div>
                          )}

                          {/* Dates */}
                          <div className='flex items-center gap-2 mb-2'>
                            <Calendar size={14} className='text-gray-400' />
                            <span className='text-gray-300 text-sm'>
                              {project.startDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              -{' '}
                              {project.endDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          {/* Duration */}
                          <div className='flex items-center gap-2 mb-2'>
                            <Clock size={14} className='text-gray-400' />
                            <span className='text-gray-300 text-sm'>
                              {duration} {duration === 1 ? 'day' : 'days'}
                            </span>
                          </div>

                          {/* Status and Priority */}
                          <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center gap-2'>
                              <div
                                className='w-2 h-2 rounded-full'
                                style={{ backgroundColor: statusColor }}
                              />
                              <span className='text-gray-300 text-sm'>
                                {project.status}
                              </span>
                            </div>

                            <div className='flex items-center gap-2'>
                              <Flag size={12} style={{ color: priorityColor }} />
                              <span className='text-gray-300 text-xs'>
                                {project.priority}
                              </span>
                            </div>
                          </div>

                          {/* Days until */}
                          <div className='text-right'>
                            <span className='text-gray-400 text-xs'>{daysUntil}</span>
                          </div>

                          {/* Category and Team */}
                          {(project.category || project.teamMembers) && (
                            <div className='mt-2 pt-2 border-t border-gray-700'>
                              {project.category && (
                                <div className='text-gray-400 text-xs mb-1'>
                                  Category: {project.category}
                                </div>
                              )}
                              {project.teamMembers && (
                                <div className='text-gray-400 text-xs'>
                                  Team: {project.teamMembers}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Add New Project Card */}
                  <button
                    onClick={handleAddProject}
                    className='bg-[#2a2a2a] border-2 border-solid border-gray-500 rounded-lg p-4 hover:border-gray-400 hover:bg-[#333333] transition-colors flex flex-col items-center justify-center min-h-[200px] group'
                  >
                    <Plus
                      size={24}
                      className='text-gray-400 group-hover:text-white mb-2'
                    />
                    <span className='text-gray-400 group-hover:text-white text-sm'>
                      New page
                    </span>
                  </button>
                </div>
              </div>

              {/* Project Pipeline Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Project Pipeline
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
                        {/* Days Header */}
                        <div 
                          className="flex h-10 bg-[#1a1a1a] sticky top-0 z-10 border-b border-gray-700"
                          style={{ width: `${totalWidth}px` }}
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
                              top: '40px'
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
                                  top: '40px',
                                  backgroundColor: 'var(--accent-color, #97e7aa)'
                                }}
                              />
                            )
                          }
                          return null
                        })()}

                        {/* Projects Area */}
                        <div className="relative h-full pt-4 pb-4 overflow-y-auto custom-scrollbar z-10">
                          {visibleProjects.map((project, index) => {
                            const isUrgent = project.priority === 'urgent'
                            const projectColor = isUrgent ? '#ff6b35' : getStatusColor(project.status)
                            const projectWidth = getProjectWidth(project)
                            const isDraggedProject = dragState.draggedProject && dragState.draggedProject.id === project.id
                            
                            return (
                              <div
                                key={project.id}
                                className={`absolute h-10 rounded cursor-pointer transition-all duration-200 group z-20 select-none ${
                                  isDraggedProject ? 'opacity-80 shadow-lg z-30' : ''
                                }`}
                                style={{
                                  left: `${getDayPosition(project.startDate)}px`,
                                  width: `${projectWidth}px`,
                                  top: `${index * 44 + 8}px`,
                                  backgroundColor: projectColor
                                }}
                                onClick={(e) => handleProjectClick(project, e)}
                                onMouseDown={(e) => handleProjectMouseDown(e, project)}
                              >
                                {/* Resize indicators */}
                                <div 
                                  className="absolute left-0 top-0 h-full w-5 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-20 rounded-l transition-opacity flex items-center justify-center"
                                >
                                  <div className="w-1 h-4 bg-white opacity-80 rounded"></div>
                                </div>
                                <div 
                                  className="absolute right-0 top-0 h-full w-5 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-20 rounded-r transition-opacity flex items-center justify-center"
                                >
                                  <div className="w-1 h-4 bg-white opacity-80 rounded"></div>
                                </div>
                                
                                <div className="flex items-center h-full px-3 text-white text-sm pointer-events-none">
                                  {isUrgent && <span className="mr-1">🔥</span>}
                                  <span className="truncate">
                                    {project.title}
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

      {/* Project Modal */}
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
                      value={projectForm.title}
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
                  {/* Start - End Date */}
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Start - End Date</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={projectForm.startDate}
                          onChange={(e) => handleFormChange('startDate', e.target.value)}
                          className={`w-full bg-transparent text-base border-none outline-none ${
                            validationErrors.startDate ? 'text-red-400' : 'text-white'
                          }`}
                        />
                        <input
                          type="date"
                          value={projectForm.endDate}
                          onChange={(e) => handleFormChange('endDate', e.target.value)}
                          min={projectForm.startDate}
                          className={`w-full bg-transparent text-base border-none outline-none ${
                            validationErrors.endDate ? 'text-red-400' : 'text-white'
                          }`}
                        />
                      </div>
                      {(validationErrors.startDate || validationErrors.endDate) && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">
                            {validationErrors.startDate || validationErrors.endDate}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Status */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getStatusColor(projectForm.status) }}
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Project Status</div>
                      <select
                        value={projectForm.status}
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

                  {/* Description */}
                  <div className="flex items-start gap-4">
                    <Edit size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Description</div>
                      <textarea
                        value={projectForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Empty"
                        rows={3}
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-4">
                    <Flag size={20} style={{ color: getPriorityColor(projectForm.priority) }} className="flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Priority</div>
                      <select
                        value={projectForm.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                        className="w-full bg-transparent text-white text-base border-none outline-none"
                      >
                        {priorityOptions.map(option => (
                          <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-4">
                    <Target size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Category</div>
                      <input
                        type="text"
                        value={projectForm.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-xl flex-shrink-0">👥</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Team Members</div>
                      <input
                        type="text"
                        value={projectForm.teamMembers}
                        onChange={(e) => handleFormChange('teamMembers', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-xl flex-shrink-0">💰</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Budget</div>
                      <input
                        type="text"
                        value={projectForm.budget}
                        onChange={(e) => handleFormChange('budget', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="flex items-start gap-4">
                    <Edit size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Notes</div>
                      <textarea
                        value={projectForm.notes}
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
                  {selectedProject && (
                    <button
                      onClick={handleDeleteProject}
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
                    onClick={handleSaveProject}
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
    </div>
  )
}

export default ProjectPlannerPage