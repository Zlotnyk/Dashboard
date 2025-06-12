import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react'
import TaskDrawer from './task_drawer'
import { useAuth } from '../../hooks/useAuth'
import { tasksAPI } from '../../services/api'

const TaskTimeline = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const { isAuthenticated } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragMode, setDragMode] = useState(null)
  const [viewMode, setViewMode] = useState('Month')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTask, setDrawerTask] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [originalTaskData, setOriginalTaskData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 })
  const [dragThreshold] = useState(5) // Minimum pixels to start drag
  const [hasDragStarted, setHasDragStarted] = useState(false)
  const timelineRef = useRef(null)
  const scrollRef = useRef(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Improved days calculation with better scaling
  const getDaysToShow = () => {
    if (viewMode === 'Week') {
      // Week view: Show 3 weeks with current week in center
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      startOfWeek.setDate(startOfWeek.getDate() - day - 7) // Start 1 week earlier
      
      const days = []
      for (let i = 0; i < 21; i++) { // 3 weeks = 21 days
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        days.push(date)
      }
      return days
    } else {
      // Month view: Show current month + 15 days on each side for better context
      const startDate = new Date(currentYear, currentMonth, 1)
      startDate.setDate(startDate.getDate() - 15) // 15 days before month start
      
      const endDate = new Date(currentYear, currentMonth + 1, 0)
      endDate.setDate(endDate.getDate() + 15) // 15 days after month end
      
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
  
  // Larger day width for better precision
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
    
    // Handle tasks that extend beyond visible range
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

  const handleTaskClick = (task, e) => {
    e.stopPropagation()
    if (!hasDragStarted) {
      setDrawerTask(task)
      setIsDrawerOpen(true)
    }
  }

  const handleAddTask = async () => {
    const newTask = {
      title: 'New Task',
      start: new Date(),
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
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

  // Improved drag handling with proper threshold
  const handleMouseDown = (e, task) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const taskWidth = rect.width
    
    // Store initial mouse position
    setDragStartPosition({ x: e.clientX, y: e.clientY })
    setHasDragStarted(false)
    
    setOriginalTaskData({
      start: new Date(task.start),
      end: new Date(task.end)
    })
    
    // Smaller resize zones for better precision (10px fixed width)
    const resizeZoneWidth = 10
    
    if (clickX < resizeZoneWidth) {
      setDragMode('resize-start')
    } else if (clickX > taskWidth - resizeZoneWidth) {
      setDragMode('resize-end')
    } else {
      setDragMode('move')
    }
    
    setDraggedTask(task)
    setIsDragging(true)
  }

  // Snap-to-grid timeline click
  const handleTimelineClick = async (e) => {
    if (!isDragging && !hasDragStarted && (e.target === timelineRef.current || e.target.closest('.timeline-background'))) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0)
      
      // Snap to day grid
      const dayIndex = Math.floor(clickX / dayWidth)
      
      if (dayIndex >= 0 && dayIndex < daysToShow.length) {
        const clickDay = daysToShow[dayIndex]
        const endDay = new Date(clickDay)
        endDay.setDate(clickDay.getDate() + 1) // Default 1 day duration
        
        const newTask = {
          title: 'New Task',
          start: new Date(clickDay),
          end: endDay,
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
    }
  }

  const handleMouseMove = (e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  // Enhanced drag handling with proper threshold and snap-to-grid
  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      if (!draggedTask || !timelineRef.current || !originalTaskData) return

      // Check if we've moved enough to start dragging
      if (!hasDragStarted) {
        const deltaX = Math.abs(e.clientX - dragStartPosition.x)
        const deltaY = Math.abs(e.clientY - dragStartPosition.y)
        
        if (deltaX > dragThreshold || deltaY > dragThreshold) {
          setHasDragStarted(true)
        } else {
          return // Don't start dragging yet
        }
      }

      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0)
      
      // Snap to day grid with better precision
      const dayIndex = Math.max(0, Math.min(daysToShow.length - 1, Math.round(x / dayWidth)))
      
      let updatedTask = { ...draggedTask }

      if (dragMode === 'move') {
        const originalDuration = Math.ceil((originalTaskData.end - originalTaskData.start) / (1000 * 60 * 60 * 24))
        const newStartDay = daysToShow[dayIndex]
        const newEndDay = new Date(newStartDay)
        newEndDay.setDate(newStartDay.getDate() + originalDuration - 1)
        
        updatedTask.start = new Date(newStartDay)
        updatedTask.end = newEndDay
        
      } else if (dragMode === 'resize-start') {
        const newStartDay = daysToShow[dayIndex]
        if (newStartDay < originalTaskData.end) {
          updatedTask.start = new Date(newStartDay)
          updatedTask.end = new Date(originalTaskData.end)
        }
        
      } else if (dragMode === 'resize-end') {
        const newEndDay = daysToShow[dayIndex]
        if (newEndDay >= originalTaskData.start) {
          updatedTask.start = new Date(originalTaskData.start)
          updatedTask.end = new Date(newEndDay)
        }
      }

      onUpdateTask(updatedTask)
    }

    const handleMouseUp = async () => {
      if (draggedTask && isAuthenticated && originalTaskData && hasDragStarted) {
        try {
          const taskId = draggedTask.id || draggedTask._id
          await tasksAPI.updateTask(taskId, {
            startDate: draggedTask.start,
            endDate: draggedTask.end
          })
          console.log('Task updated via drag & drop')
        } catch (error) {
          console.error('Error updating task during drag:', error)
        }
      }
      
      setDraggedTask(null)
      setDragMode(null)
      setOriginalTaskData(null)
      setDragStartPosition({ x: 0, y: 0 })
      
      // Reset drag state after a short delay to prevent accidental clicks
      setTimeout(() => {
        setIsDragging(false)
        setHasDragStarted(false)
      }, 100)
    }

    if (draggedTask) {
      document.addEventListener('mousemove', handleMouseMoveGlobal)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedTask, dragMode, daysToShow, onUpdateTask, dayWidth, originalTaskData, isAuthenticated, dragStartPosition, hasDragStarted, dragThreshold])

  const getVisibleTasks = () => {
    const visibleStart = daysToShow[0]
    const visibleEnd = daysToShow[daysToShow.length - 1]
    
    return tasks.filter(task => {
      const taskStart = new Date(task.start)
      const taskEnd = new Date(task.end)
      
      return taskStart <= visibleEnd && taskEnd >= visibleStart
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
    
    // Add the last month
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
                onClick={handleAddTask}
                className="flex items-center gap-2 px-3 py-1 text-white rounded text-sm hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-color, #97e7aa)' }}
                disabled={loading}
              >
                <Plus size={14} />
                {loading ? 'Adding...' : 'New'}
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid with Horizontal Scroll */}
        <div className="relative flex-1 overflow-hidden">
          <div 
            ref={scrollRef}
            className="h-full overflow-x-auto overflow-y-hidden custom-scrollbar"
          >
            <div 
              ref={timelineRef}
              className="relative h-full timeline-background cursor-pointer"
              style={{ width: `${totalWidth}px` }}
              onClick={handleTimelineClick}
              onMouseMove={handleMouseMove}
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

              {/* Grid hover indicator */}
              {!isDragging && !hasDragStarted && mousePosition.y > (viewMode === 'Month' ? 72 : 40) && (
                <div
                  className="absolute w-8 h-8 rounded-full flex items-center justify-center z-30 pointer-events-none opacity-60"
                  style={{
                    left: `${Math.floor(mousePosition.x / dayWidth) * dayWidth + dayWidth / 2 - 16}px`,
                    top: `${mousePosition.y - 16}px`,
                    backgroundColor: 'var(--accent-color, #97e7aa)'
                  }}
                >
                  <Plus size={16} className="text-white" />
                </div>
              )}

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
                  
                  // Fixed resize zone width for better precision
                  const resizeZoneWidth = 10
                  
                  return (
                    <div
                      key={taskId}
                      className={`absolute h-10 rounded cursor-pointer transition-all duration-200 group z-20 select-none ${
                        draggedTask?.id === taskId || draggedTask?._id === taskId ? 'opacity-80 shadow-lg' : ''
                      }`}
                      style={{
                        left: `${getDayPosition(task.start)}px`,
                        width: `${taskWidth}px`,
                        top: `${index * 44 + 8}px`,
                        backgroundColor: taskColor
                      }}
                      onClick={(e) => handleTaskClick(task, e)}
                      onMouseDown={(e) => handleMouseDown(e, task)}
                    >
                      {/* Resize handles with better visibility */}
                      <div 
                        className="absolute left-0 top-0 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-50 rounded-l transition-opacity flex items-center justify-center"
                        style={{ width: `${resizeZoneWidth}px` }}
                      >
                        <div className="w-1 h-4 bg-white opacity-60 rounded"></div>
                      </div>
                      <div 
                        className="absolute right-0 top-0 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-50 rounded-r transition-opacity flex items-center justify-center"
                        style={{ width: `${resizeZoneWidth}px` }}
                      >
                        <div className="w-1 h-4 bg-white opacity-60 rounded"></div>
                      </div>
                      
                      <div className="flex items-center h-full px-3 text-white text-sm">
                        {isUrgent && <span className="mr-1">🔥</span>}
                        <span className="truncate">
                          {task.title}
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