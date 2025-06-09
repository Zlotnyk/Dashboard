import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react'
import TaskDrawer from './task_drawer'

const TaskTimeline = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
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
  const timelineRef = useRef(null)
  const scrollRef = useRef(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Calculate days based on view mode
  const getDaysToShow = () => {
    if (viewMode === 'Week') {
      // Get current week
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      startOfWeek.setDate(startOfWeek.getDate() - day)
      
      const days = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        days.push(date)
      }
      return days
    } else {
      // Month view
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const days = []
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentYear, currentMonth, i))
      }
      return days
    }
  }

  const daysToShow = getDaysToShow()
  const today = new Date()
  
  // Adjusted day width for better fit
  const dayWidth = viewMode === 'Week' ? 180 : 40
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
    if (viewMode === 'Week') {
      const todayIndex = daysToShow.findIndex(date => 
        date.toDateString() === today.toDateString()
      )
      return todayIndex >= 0 ? todayIndex * dayWidth : -1
    } else {
      const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear
      if (isCurrentMonth) {
        return (today.getDate() - 1) * dayWidth
      }
      return -1
    }
  }

  const getDayPosition = (date) => {
    if (viewMode === 'Week') {
      const dayIndex = daysToShow.findIndex(d => d.toDateString() === date.toDateString())
      return dayIndex >= 0 ? dayIndex * dayWidth : 0
    } else {
      return (date.getDate() - 1) * dayWidth
    }
  }

  const getTaskWidth = (task) => {
    if (viewMode === 'Week') {
      const startIndex = daysToShow.findIndex(d => d.toDateString() === task.start.toDateString())
      const endIndex = daysToShow.findIndex(d => d.toDateString() === task.end.toDateString())
      if (startIndex >= 0 && endIndex >= 0) {
        return (endIndex - startIndex + 1) * dayWidth
      }
      return dayWidth
    } else {
      const startDay = task.start.getDate()
      const endDay = task.end.getDate()
      return (endDay - startDay + 1) * dayWidth
    }
  }

  const handleTaskClick = (task, e) => {
    e.stopPropagation()
    // Only open drawer if we're not dragging
    if (!isDragging) {
      setDrawerTask(task)
      setIsDrawerOpen(true)
    }
  }

  const handleDeleteTask = () => {
    if (selectedTask) {
      onDeleteTask(selectedTask.id)
      setSelectedTask(null)
    }
  }

  const handleAddTask = () => {
    const newTask = {
      id: crypto.randomUUID(),
      title: 'New page',
      start: viewMode === 'Week' ? daysToShow[0] : new Date(currentYear, currentMonth, 1),
      end: viewMode === 'Week' ? daysToShow[2] : new Date(currentYear, currentMonth, 3),
      progress: 0,
      status: 'Not started',
      priority: 'normal',
      description: '',
      color: '#97e7aa'
    }
    onAddTask(newTask)
  }

  const handleMouseDown = (e, task) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const taskWidth = rect.width
    
    // Determine drag mode based on click position
    if (clickX < 8) {
      setDragMode('resize-start')
    } else if (clickX > taskWidth - 8) {
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

  const handleTimelineClick = (e) => {
    if (!isDragging && (e.target === timelineRef.current || e.target.closest('.timeline-background'))) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const dayIndex = Math.floor(clickX / dayWidth)
      
      if (dayIndex >= 0 && dayIndex < daysToShow.length) {
        const clickDay = daysToShow[dayIndex]
        const endDay = new Date(clickDay)
        endDay.setDate(clickDay.getDate() + 2)
        
        const newTask = {
          id: crypto.randomUUID(),
          title: 'New Task',
          start: new Date(clickDay),
          end: endDay,
          progress: 0,
          status: 'Not started',
          priority: 'normal',
          description: '',
          color: '#97e7aa'
        }
        
        onAddTask(newTask)
        setDrawerTask(newTask)
        setIsDrawerOpen(true)
      }
    }
  }

  const handleDayHover = (dayIndex) => {
    setHoveredDay(dayIndex)
  }

  const handleDayLeave = () => {
    setHoveredDay(null)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggedTask || !timelineRef.current) return

      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const dayIndex = Math.max(0, Math.min(daysToShow.length - 1, Math.floor(x / dayWidth)))
      
      let updatedTask = { ...draggedTask }

      if (dragMode === 'move') {
        const taskDuration = Math.ceil((draggedTask.end - draggedTask.start) / (1000 * 60 * 60 * 24))
        const newStartDay = daysToShow[dayIndex]
        const newEndDay = new Date(newStartDay)
        newEndDay.setDate(newStartDay.getDate() + taskDuration - 1)
        
        updatedTask.start = new Date(newStartDay)
        updatedTask.end = newEndDay
      } else if (dragMode === 'resize-start') {
        const newStartDay = daysToShow[dayIndex]
        if (newStartDay < draggedTask.end) {
          updatedTask.start = new Date(newStartDay)
        }
      } else if (dragMode === 'resize-end') {
        const newEndDay = daysToShow[dayIndex]
        if (newEndDay > draggedTask.start) {
          updatedTask.end = new Date(newEndDay)
        }
      }

      onUpdateTask(updatedTask)
    }

    const handleMouseUp = () => {
      setDraggedTask(null)
      setDragMode(null)
      // Add a small delay before allowing clicks again
      setTimeout(() => {
        setIsDragging(false)
      }, 100)
    }

    if (draggedTask) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedTask, dragMode, daysToShow, onUpdateTask, dayWidth])

  const getVisibleTasks = () => {
    if (viewMode === 'Week') {
      return tasks.filter(task => {
        const taskStart = new Date(task.start)
        const taskEnd = new Date(task.end)
        const weekStart = daysToShow[0]
        const weekEnd = daysToShow[6]
        
        return (taskStart <= weekEnd && taskEnd >= weekStart)
      })
    } else {
      return tasks.filter(task => 
        task.start.getMonth() === currentMonth && task.start.getFullYear() === currentYear
      )
    }
  }

  const visibleTasks = getVisibleTasks()

  const handleDrawerSave = (updatedTask) => {
    onUpdateTask(updatedTask)
    setIsDrawerOpen(false)
    setDrawerTask(null)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setDrawerTask(null)
  }

  const getHeaderText = () => {
    if (viewMode === 'Week') {
      const startDate = daysToShow[0]
      const endDate = daysToShow[6]
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
              >
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
              <span className="text-white text-base font-medium min-w-[200px] text-center">
                {getHeaderText()}
              </span>
              <button
                onClick={() => navigateTime(1)}
                className="p-2 hover:bg-gray-700 rounded"
              >
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'Month' 
                    ? 'bg-[#97e7aa] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setViewMode('Month')}
              >
                Month
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'Week' 
                    ? 'bg-[#97e7aa] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setViewMode('Week')}
              >
                Week
              </button>
              <button 
                className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded"
                onClick={goToToday}
              >
                Today
              </button>
              <button
                onClick={handleAddTask}
                className="flex items-center gap-2 px-3 py-1 bg-[#97e7aa] text-white rounded text-sm hover:bg-[#75b384]"
              >
                <Plus size={14} />
                New
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
                          ? 'bg-[#97e7aa] text-white font-semibold' 
                          : 'text-gray-300'
                      }`}
                      style={{ width: `${dayWidth}px` }}
                      onMouseEnter={() => handleDayHover(i)}
                      onMouseLeave={handleDayLeave}
                    >
                      {dayText}
                      {/* Plus button on hover */}
                      {hoveredDay === i && !isToday && (
                        <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                          <Plus size={12} className="text-[#97e7aa]" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Horizontal line under dates */}
              <div className="absolute top-8 left-0 right-0 h-px bg-gray-700 z-10" />

              {/* Vertical lines for each day - background layer */}
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
                      className="absolute top-8 bottom-0 w-0.5 bg-[#97e7aa] z-20 pointer-events-none"
                      style={{ left: `${todayPosition + dayWidth / 2}px` }}
                    />
                  )
                }
                return null
              })()}

              {/* Tasks Area */}
              <div className="relative h-full pt-4 pb-4 overflow-y-auto custom-scrollbar z-10">
                {visibleTasks.map((task, index) => {
                  const isUrgent = task.priority === 'urgent'
                  const taskColor = isUrgent ? '#ff6b35' : '#97e7aa'
                  
                  return (
                    <div
                      key={task.id}
                      className={`absolute h-8 rounded cursor-pointer transition-all duration-200 group z-20 ${
                        selectedTask?.id === task.id ? 'ring-2 ring-[#97e7aa]' : ''
                      } ${draggedTask?.id === task.id ? 'opacity-80 shadow-lg' : ''}`}
                      style={{
                        left: `${getDayPosition(task.start)}px`,
                        width: `${getTaskWidth(task)}px`,
                        top: `${index * 36 + 8}px`,
                        backgroundColor: taskColor
                      }}
                      onClick={(e) => handleTaskClick(task, e)}
                      onMouseDown={(e) => handleMouseDown(e, task)}
                    >
                      {/* Resize handles */}
                      <div className="absolute left-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-20 rounded-l" />
                      <div className="absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-20 rounded-r" />
                      
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
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <span>🗑</span>
                      Delete
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
            onDeleteTask(drawerTask.id)
            handleDrawerClose()
          }
        }}
      />
    </>
  )
}

export default TaskTimeline