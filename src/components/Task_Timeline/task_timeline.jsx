import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter, X } from 'lucide-react'
import TaskDrawer from './task_drawer'
import { useAuth } from '../../hooks/useAuth'
import { tasksAPI } from '../../services/api'

const TaskTimeline = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const { isAuthenticated } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState(null)
  const [viewMode, setViewMode] = useState('Month')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTask, setDrawerTask] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Enhanced filter state
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    priorities: ['normal', 'urgent'],
    statuses: ['Not started', 'In progress', 'Completed', 'On hold']
  })
  
  // SIMPLIFIED DRAG STATE
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedTask: null,
    dragMode: null, // 'move', 'resize-left', 'resize-right'
    startX: 0,
    originalStart: null,
    originalEnd: null,
    hasMoved: false
  })
  
  const timelineRef = useRef(null)
  const scrollRef = useRef(null)
  const timelineContentRef = useRef(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Improved days calculation
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
    setTimeout(() => {
      if (scrollRef.current) {
        const todayPosition = getTodayPosition()
        if (todayPosition >= 0) {
          const containerWidth = scrollRef.current.clientWidth
          const scrollPosition = Math.max(0, todayPosition - containerWidth / 2)
          scrollRef.current.scrollLeft = scrollPosition
        }
      }
    }, 100)
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

  const getTaskWidth = (task) => {
    const startIndex = daysToShow.findIndex(d => d.toDateString() === task.start.toDateString())
    const endIndex = daysToShow.findIndex(d => d.toDateString() === task.end.toDateString())
    
    if (startIndex >= 0 && endIndex >= 0) {
      return Math.max(dayWidth, (endIndex - startIndex + 1) * dayWidth)
    }
    
    const taskStart = new Date(task.start)
    const taskEnd = new Date(task.end)
    const visibleStart = daysToShow[0]
    const visibleEnd = daysToShow[daysToShow.length - 1]
    
    if (taskStart <= visibleEnd && taskEnd >= visibleStart) {
      const effectiveStart = taskStart < visibleStart ? visibleStart : taskStart
      const effectiveEnd = taskEnd > visibleEnd ? visibleEnd : taskEnd
      
      const startIdx = daysToShow.findIndex(d => d.toDateString() === effectiveStart.toDateString())
      const endIdx = daysToShow.findIndex(d => d.toDateString() === effectiveEnd.toDateString())
      
      if (startIdx >= 0 && endIdx >= 0) {
        return Math.max(dayWidth, (endIdx - startIdx + 1) * dayWidth)
      }
    }
    
    return dayWidth
  }

  // DRAG SYSTEM
  const handleTaskMouseDown = (e, task) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const taskWidth = rect.width
    
    // Determine drag mode based on click position
    let mode = 'move'
    if (clickX < 20) {
      mode = 'resize-left'
    } else if (clickX > taskWidth - 20) {
      mode = 'resize-right'
    }
    
    setDragState({
      isDragging: true,
      draggedTask: task,
      dragMode: mode,
      startX: e.clientX,
      originalStart: new Date(task.start),
      originalEnd: new Date(task.end),
      hasMoved: false
    })
    
    document.body.style.userSelect = 'none'
  }

  const handleTaskClick = (task, e) => {
    e.stopPropagation()
    
    if (!dragState.isDragging && !dragState.hasMoved) {
      setDrawerTask(task)
      setIsDrawerOpen(true)
    }
  }

  const handleAddTask = async () => {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2) // 3 days duration
    
    const newTask = {
      title: 'New Task',
      start: startDate,
      end: endDate,
      progress: 0,
      status: 'Not started',
      priority: 'normal',
      description: '',
      color: 'var(--accent-color, #97e7aa)'
    }

    if (isAuthenticated) {
      try {
        setLoading(true)
        const response = await tasksAPI.createTask({
          title: newTask.title,
          startDate: newTask.start,
          endDate: newTask.end,
          status: newTask.status,
          priority: newTask.priority,
          description: newTask.description
        })
        
        const createdTask = {
          ...response.data.data,
          id: response.data.data._id,
          start: new Date(response.data.data.startDate),
          end: new Date(response.data.data.endDate),
          color: newTask.color
        }
        
        onAddTask(createdTask)
        setDrawerTask(createdTask)
        setIsDrawerOpen(true)
      } catch (error) {
        console.error('Error creating task:', error)
        const localTask = { ...newTask, id: crypto.randomUUID() }
        onAddTask(localTask)
        setDrawerTask(localTask)
        setIsDrawerOpen(true)
      } finally {
        setLoading(false)
      }
    } else {
      const localTask = { ...newTask, id: crypto.randomUUID() }
      onAddTask(localTask)
      setDrawerTask(localTask)
      setIsDrawerOpen(true)
    }
  }

  // FIXED: Accurate timeline click handler with proper date creation
  const handleTimelineClick = async (e) => {
    if (dragState.isDragging || dragState.hasMoved) return
    
    if (e.target === timelineContentRef.current || e.target.closest('.timeline-background')) {
      const scrollContainer = scrollRef.current
      if (!scrollContainer) return
      
      const containerRect = scrollContainer.getBoundingClientRect()
      const relativeClickX = e.clientX - containerRect.left
      const scrollLeft = scrollContainer.scrollLeft
      const absoluteClickX = relativeClickX + scrollLeft
      
      const dayIndex = Math.floor(absoluteClickX / dayWidth)
      
      console.log('Timeline click debug:', {
        relativeClickX,
        scrollLeft,
        absoluteClickX,
        dayWidth,
        dayIndex,
        totalDays: daysToShow.length,
        clickedDate: dayIndex >= 0 && dayIndex < daysToShow.length ? daysToShow[dayIndex].toDateString() : 'Invalid'
      })
      
      if (dayIndex >= 0 && dayIndex < daysToShow.length) {
        const selectedDate = daysToShow[dayIndex]
        
        // FIXED: Create dates properly to avoid timezone issues
        const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
        const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 2) // 3 days duration
        
        console.log('Creating task for date range:', {
          selectedDate: selectedDate.toDateString(),
          startDate: startDate.toDateString(),
          endDate: endDate.toDateString()
        })
        
        const newTask = {
          title: 'New Task',
          start: startDate,
          end: endDate,
          progress: 0,
          status: 'Not started',
          priority: 'normal',
          description: '',
          color: 'var(--accent-color, #97e7aa)'
        }

        if (isAuthenticated) {
          try {
            setLoading(true)
            const response = await tasksAPI.createTask({
              title: newTask.title,
              startDate: newTask.start,
              endDate: newTask.end,
              status: newTask.status,
              priority: newTask.priority,
              description: newTask.description
            })
            
            const createdTask = {
              ...response.data.data,
              id: response.data.data._id,
              start: new Date(response.data.data.startDate),
              end: new Date(response.data.data.endDate),
              color: newTask.color
            }
            
            onAddTask(createdTask)
            setDrawerTask(createdTask)
            setIsDrawerOpen(true)
          } catch (error) {
            console.error('Error creating task:', error)
            const localTask = { ...newTask, id: crypto.randomUUID() }
            onAddTask(localTask)
            setDrawerTask(localTask)
            setIsDrawerOpen(true)
          } finally {
            setLoading(false)
          }
        } else {
          const localTask = { ...newTask, id: crypto.randomUUID() }
          onAddTask(localTask)
          setDrawerTask(localTask)
          setIsDrawerOpen(true)
        }
      } else {
        console.warn('Click outside valid day range:', dayIndex, 'Total days:', daysToShow.length)
      }
    }
  }

  // GLOBAL MOUSE HANDLERS
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState.isDragging || !dragState.draggedTask) return
      
      const deltaX = e.clientX - dragState.startX
      
      if (Math.abs(deltaX) > 5) {
        setDragState(prev => ({ ...prev, hasMoved: true }))
      }
      
      const daysDelta = Math.round(deltaX / dayWidth)
      
      if (daysDelta === 0) return
      
      const { draggedTask, dragMode, originalStart, originalEnd } = dragState
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
      
      const updatedTask = {
        ...draggedTask,
        start: newStart,
        end: newEnd
      }
      
      onUpdateTask(updatedTask)
    }
    
    const handleMouseUp = async () => {
      if (dragState.isDragging && dragState.draggedTask && isAuthenticated) {
        try {
          const taskId = dragState.draggedTask.id || dragState.draggedTask._id
          await tasksAPI.updateTask(taskId, {
            startDate: dragState.draggedTask.start,
            endDate: dragState.draggedTask.end
          })
        } catch (error) {
          console.error('Error updating task:', error)
        }
      }
      
      const hadMoved = dragState.hasMoved
      
      setDragState({
        isDragging: false,
        draggedTask: null,
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
  }, [dragState, dayWidth, onUpdateTask, isAuthenticated])

  // Enhanced filter functions
  const togglePriorityFilter = (priority) => {
    setActiveFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }))
  }

  const toggleStatusFilter = (status) => {
    setActiveFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }))
  }

  const clearAllFilters = () => {
    setActiveFilters({
      priorities: ['normal', 'urgent'],
      statuses: ['Not started', 'In progress', 'Completed', 'On hold']
    })
  }

  const getVisibleTasks = () => {
    const visibleStart = daysToShow[0]
    const visibleEnd = daysToShow[daysToShow.length - 1]
    
    const visibleTasks = tasks.filter(task => {
      const taskStart = new Date(task.start)
      const taskEnd = new Date(task.end)
      
      return taskStart <= visibleEnd && taskEnd >= visibleStart
    })
    
    // Apply filters
    return visibleTasks.filter(task => {
      const priorityMatch = activeFilters.priorities.includes(task.priority)
      const statusMatch = activeFilters.statuses.includes(task.status)
      return priorityMatch && statusMatch
    })
  }

  const visibleTasks = getVisibleTasks()

  const handleDrawerSave = async (updatedTask) => {
    if (isAuthenticated) {
      try {
        setLoading(true)
        const taskId = updatedTask.id || updatedTask._id
        const response = await tasksAPI.updateTask(taskId, {
          title: updatedTask.title,
          description: updatedTask.description,
          startDate: updatedTask.start,
          endDate: updatedTask.end,
          status: updatedTask.status,
          priority: updatedTask.priority
        })
        
        const backendTask = {
          ...response.data.data,
          id: response.data.data._id,
          start: new Date(response.data.data.startDate),
          end: new Date(response.data.data.endDate),
          color: updatedTask.color
        }
        
        onUpdateTask(backendTask)
      } catch (error) {
        console.error('Error updating task:', error)
        onUpdateTask(updatedTask)
      } finally {
        setLoading(false)
      }
    } else {
      onUpdateTask(updatedTask)
    }
    
    setIsDrawerOpen(false)
    setDrawerTask(null)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setDrawerTask(null)
  }

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

  // Auto-scroll to today on initial load
  useEffect(() => {
    if (scrollRef.current) {
      const todayPosition = getTodayPosition()
      if (todayPosition >= 0) {
        const containerWidth = scrollRef.current.clientWidth
        const scrollPosition = Math.max(0, todayPosition - containerWidth / 2)
        scrollRef.current.scrollLeft = scrollPosition
      }
    }
  }, [viewMode, currentDate])

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

  // Check if any filters are active
  const hasActiveFilters = activeFilters.priorities.length < 2 || activeFilters.statuses.length < 4

  return (
    <>
      <div className="w-full bg-[#1a1a1a] rounded-lg h-[400px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-white text-lg font-medium">Task Timeline</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Enhanced Filter Button */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--accent-color, #97e7aa)' }}
              >
                <Filter size={14} />
                Filter
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-white opacity-80"></span>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTime(-1)}
                className="p-2 hover:bg-gray-700 rounded transition-colors"
                disabled={loading}
              >
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
              <span className="text-white text-base font-medium min-w-[200px] text-center">
                {getHeaderText()}
              </span>
              <button
                onClick={() => navigateTime(1)}
                className="p-2 hover:bg-gray-700 rounded transition-colors"
                disabled={loading}
              >
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className={`px-3 py-1 text-sm rounded transition-colors ${
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
                className={`px-3 py-1 text-sm rounded transition-colors ${
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
                className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded transition-colors"
                onClick={goToToday}
                disabled={loading}
              >
                Today
              </button>
              <button
                onClick={handleAddTask}
                className="flex items-center gap-2 px-3 py-1 text-white rounded text-sm hover:opacity-80 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: 'var(--accent-color, #97e7aa)' }}
                disabled={loading}
              >
                <Plus size={14} />
                {loading ? 'Adding...' : 'New'}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Panel */}
        {filterOpen && (
          <div className="mx-4 mb-2 p-4 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold">Filter Tasks</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-white text-sm font-medium mb-2">Priority</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => togglePriorityFilter('normal')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      activeFilters.priorities.includes('normal')
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => togglePriorityFilter('urgent')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      activeFilters.priorities.includes('urgent')
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🔥 Urgent
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-white text-sm font-medium mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['Not started', 'In progress', 'Completed', 'On hold'].map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`px-3 py-1 text-xs rounded transition-all ${
                        activeFilters.statuses.includes(status)
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Filter Summary */}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs text-gray-400">
                Showing {visibleTasks.length} of {tasks.length} tasks
              </p>
            </div>
          </div>
        )}

        {/* Calendar Grid with Horizontal Scroll */}
        <div className="relative flex-1 overflow-hidden">
          <div 
            ref={scrollRef}
            className="h-full overflow-x-auto overflow-y-hidden custom-scrollbar"
          >
            <div 
              ref={timelineContentRef}
              className="relative h-full timeline-background cursor-pointer select-none"
              style={{ width: `${totalWidth}px` }}
              onClick={handleTimelineClick}
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

              {/* Tasks Area */}
              <div 
                className="relative h-full pt-4 pb-4 overflow-y-auto custom-scrollbar z-10"
                style={{ marginTop: viewMode === 'Month' ? '32px' : '0px' }}
              >
                {visibleTasks.map((task, index) => {
                  const isUrgent = task.priority === 'urgent'
                  const taskColor = isUrgent ? '#ff6b35' : 'var(--accent-color, #97e7aa)'
                  const taskWidth = getTaskWidth(task)
                  const taskId = task.id || task._id
                  const isDraggedTask = dragState.draggedTask && (dragState.draggedTask.id === taskId || dragState.draggedTask._id === taskId)
                  
                  return (
                    <div
                      key={taskId}
                      className={`absolute h-10 rounded cursor-pointer transition-all duration-200 group z-20 select-none ${
                        isDraggedTask ? 'opacity-80 shadow-lg z-30' : ''
                      }`}
                      style={{
                        left: `${getDayPosition(task.start)}px`,
                        width: `${taskWidth}px`,
                        top: `${index * 44 + 8}px`,
                        backgroundColor: taskColor
                      }}
                      onClick={(e) => handleTaskClick(task, e)}
                      onMouseDown={(e) => handleTaskMouseDown(e, task)}
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
                        <span className="truncate flex-1">
                          {task.title}
                        </span>
                        <span className="ml-2 text-xs opacity-75 hidden sm:block">
                          {task.status}
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

      {/* Task Drawer */}
      <TaskDrawer
        isOpen={isDrawerOpen}
        task={drawerTask}
        onSave={handleDrawerSave}
        onClose={handleDrawerClose}
        onDelete={() => {
          if (drawerTask) {
            const taskId = drawerTask.id || drawerTask._id
            onDeleteTask(taskId)
            handleDrawerClose()
          }
        }}
      />
    </>
  )
}

export default TaskTimeline