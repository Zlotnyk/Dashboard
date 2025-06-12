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
  const [dragMode, setDragMode] = useState(null) // 'move', 'resize-start', 'resize-end'
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState('Month')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTask, setDrawerTask] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredDay, setHoveredDay] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [originalTaskData, setOriginalTaskData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const timelineRef = useRef(null)
  const scrollRef = useRef(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Calculate days based on view mode with extended range for long tasks
  const getDaysToShow = () => {
    if (viewMode === 'Week') {
      // Show 4 weeks for better task visibility
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      startOfWeek.setDate(startOfWeek.getDate() - day - 14) // Start 2 weeks earlier
      
      const days = []
      for (let i = 0; i < 28; i++) { // 4 weeks
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        days.push(date)
      }
      return days
    } else {
      // Show 3 months for better task visibility
      const startMonth = new Date(currentYear, currentMonth - 1, 1) // Previous month
      const days = []
      
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const month = new Date(currentYear, currentMonth - 1 + monthOffset, 1)
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
        
        for (let day = 1; day <= daysInMonth; day++) {
          days.push(new Date(month.getFullYear(), month.getMonth(), day))
        }
      }
      return days
    }
  }

  const daysToShow = getDaysToShow()
  const today = new Date()
  
  // Adjusted day width for better fit
  const dayWidth = viewMode === 'Week' ? 120 : 30
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
      return Math.max(1, (endIndex - startIndex + 1)) * dayWidth
    }
    
    // If task spans beyond visible range, calculate partial width
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
        return Math.max(1, (endIdx - startIdx + 1)) * dayWidth
      }
    }
    
    return dayWidth
  }

  const handleTaskClick = (task, e) => {
    e.stopPropagation()
    if (!isDragging) {
      setDrawerTask(task)
      setIsDrawerOpen(true)
    }
  }

  const handleDeleteTask = async () => {
    if (selectedTask) {
      const taskId = selectedTask.id || selectedTask._id
      
      if (isAuthenticated) {
        try {
          setLoading(true)
          await tasksAPI.deleteTask(taskId)
          onDeleteTask(taskId)
        } catch (error) {
          console.error('Error deleting task:', error)
          onDeleteTask(taskId)
        } finally {
          setLoading(false)
        }
      } else {
        onDeleteTask(taskId)
      }
      
      setSelectedTask(null)
    }
  }

  const handleAddTask = async () => {
    const newTask = {
      title: 'New Task',
      start: viewMode === 'Week' ? daysToShow[Math.floor(daysToShow.length / 2)] : new Date(currentYear, currentMonth, 1),
      end: viewMode === 'Week' ? daysToShow[Math.floor(daysToShow.length / 2) + 2] : new Date(currentYear, currentMonth, 3),
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

  const handleMouseDown = (e, task) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const taskWidth = rect.width
    
    setOriginalTaskData({
      start: new Date(task.start),
      end: new Date(task.end)
    })
    
    const resizeZoneWidth = Math.min(12, taskWidth * 0.15)
    
    if (clickX < resizeZoneWidth) {
      setDragMode('resize-start')
    } else if (clickX > taskWidth - resizeZoneWidth) {
      setDragMode('resize-end')
    } else {
      setDragMode('move')
    }
    
    setDraggedTask(task)
    setIsDragging(true)
    const timelineRect = timelineRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - timelineRect.left,
      y: e.clientY - timelineRect.top
    })
  }

  const handleTimelineClick = async (e) => {
    if (!isDragging && (e.target === timelineRef.current || e.target.closest('.timeline-background'))) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0)
      const dayIndex = Math.floor(clickX / dayWidth)
      
      if (dayIndex >= 0 && dayIndex < daysToShow.length) {
        const clickDay = daysToShow[dayIndex]
        const endDay = new Date(clickDay)
        endDay.setDate(clickDay.getDate() + 2)
        
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

  const handleDayHover = (dayIndex) => {
    setHoveredDay(dayIndex)
  }

  const handleDayLeave = () => {
    setHoveredDay(null)
  }

  // Enhanced drag handling with API integration
  useEffect(() => {
    const handleMouseMoveGlobal = async (e) => {
      if (!draggedTask || !timelineRef.current || !originalTaskData) return

      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0)
      const dayIndex = Math.max(0, Math.min(daysToShow.length - 1, Math.floor(x / dayWidth)))
      
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
        if (newEndDay > originalTaskData.start) {
          updatedTask.start = new Date(originalTaskData.start)
          updatedTask.end = new Date(newEndDay)
        }
      }

      onUpdateTask(updatedTask)
    }

    const handleMouseUp = async () => {
      if (draggedTask && isAuthenticated && originalTaskData) {
        // Save changes to backend when drag ends
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
      setTimeout(() => {
        setIsDragging(false)
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
  }, [draggedTask, dragMode, daysToShow, onUpdateTask, dayWidth, originalTaskData, isAuthenticated])

  const getVisibleTasks = () => {
    const visibleStart = daysToShow[0]
    const visibleEnd = daysToShow[daysToShow.length - 1]
    
    return tasks.filter(task => {
      const taskStart = new Date(task.start)
      const taskEnd = new Date(task.end)
      
      // Show task if it overlaps with visible range
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
      const startDate = daysToShow[Math.floor(daysToShow.length / 4)]
      const endDate = daysToShow[Math.floor(daysToShow.length * 3 / 4)]
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${monthNames[startDate.getMonth()]} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`
      } else {
        return `${monthNames[startDate.getMonth()]} ${startDate.getDate()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}, ${startDate.getFullYear()}`
      }
    } else {
      return `${monthNames[currentMonth]} ${currentYear}`
    }
  }

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
            onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
          >
            <div 
              ref={timelineRef}
              className="relative h-full timeline-background cursor-pointer"
              style={{ width: `${totalWidth}px` }}
              onClick={handleTimelineClick}
              onMouseMove={handleMouseMove}
            >
              {/* Days Header */}
              <div 
                className="flex h-8 bg-[#1a1a1a] sticky top-0 z-10 border-b border-gray-700"
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
                  className="absolute top-8 bottom-0 w-px bg-gray-800 z-0"
                  style={{ left: `${(i + 1) * dayWidth}px` }}
                />
              ))}

              {/* Today Marker Line */}
              {(() => {
                const todayPosition = getTodayPosition()
                if (todayPosition >= 0) {
                  return (
                    <div
                      className="absolute top-8 bottom-0 w-0.5 z-20 pointer-events-none"
                      style={{ 
                        left: `${todayPosition + dayWidth / 2}px`,
                        backgroundColor: 'var(--accent-color, #97e7aa)'
                      }}
                    />
                  )
                }
                return null
              })()}

              {/* Plus button on hover */}
              {!isDragging && mousePosition.y > 32 && (
                <div
                  className="absolute w-6 h-6 rounded-full flex items-center justify-center z-30 pointer-events-none opacity-60"
                  style={{
                    left: `${mousePosition.x - 12}px`,
                    top: `${mousePosition.y - 12}px`,
                    backgroundColor: 'var(--accent-color, #97e7aa)'
                  }}
                >
                  <Plus size={12} className="text-white" />
                </div>
              )}

              {/* Tasks Area */}
              <div className="relative h-full pt-4 pb-4 overflow-y-auto custom-scrollbar z-10">
                {visibleTasks.map((task, index) => {
                  const isUrgent = task.priority === 'urgent'
                  const taskColor = isUrgent ? '#ff6b35' : 'var(--accent-color, #97e7aa)'
                  const taskWidth = getTaskWidth(task)
                  const taskId = task.id || task._id
                  
                  const resizeZoneWidth = Math.min(12, taskWidth * 0.15)
                  
                  return (
                    <div
                      key={taskId}
                      className={`absolute h-8 rounded cursor-pointer transition-all duration-200 group z-20 ${
                        selectedTask?.id === taskId || selectedTask?._id === taskId ? 'ring-2' : ''
                      } ${draggedTask?.id === taskId || draggedTask?._id === taskId ? 'opacity-80 shadow-lg' : ''}`}
                      style={{
                        left: `${getDayPosition(task.start)}px`,
                        width: `${taskWidth}px`,
                        top: `${index * 36 + 8}px`,
                        backgroundColor: taskColor,
                        '--tw-ring-color': 'var(--accent-color, #97e7aa)'
                      }}
                      onClick={(e) => handleTaskClick(task, e)}
                      onMouseDown={(e) => handleMouseDown(e, task)}
                    >
                      {/* Resize handles */}
                      <div 
                        className="absolute left-0 top-0 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-30 rounded-l transition-opacity"
                        style={{ width: `${resizeZoneWidth}px` }}
                      />
                      <div 
                        className="absolute right-0 top-0 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-30 rounded-r transition-opacity"
                        style={{ width: `${resizeZoneWidth}px` }}
                      />
                      
                      <div className="flex items-center h-full px-3 text-white text-sm">
                        {isUrgent && <span className="mr-1">🔥</span>}
                        <span className="truncate">
                          {task.title} • {task.status || 'Not started'}
                        </span>
                      </div>
                    </div>
                  )
                })}

                {/* Delete Button */}
                {selectedTask && (
                  <div className="absolute top-2 left-2 z-30">
                    <button
                      onClick={handleDeleteTask}
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      <span>🗑</span>
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
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