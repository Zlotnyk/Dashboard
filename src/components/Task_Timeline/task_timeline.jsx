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
  const timelineRef = useRef(null)
  const scrollRef = useRef(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear
  const todayDate = today.getDate()

  // Fixed day width for consistent alignment
  const dayWidth = 50 // pixels per day
  const totalWidth = daysInMonth * dayWidth

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentMonth + direction)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setTimeout(() => {
      if (scrollRef.current && isCurrentMonth) {
        const todayPosition = (todayDate - 1) * dayWidth
        const containerWidth = scrollRef.current.clientWidth
        const scrollPosition = Math.max(0, todayPosition - containerWidth / 2)
        scrollRef.current.scrollLeft = scrollPosition
      }
    }, 100)
  }

  const getDayPosition = (date) => {
    const day = date.getDate()
    return (day - 1) * dayWidth
  }

  const getTaskWidth = (task) => {
    const startDay = task.start.getDate()
    const endDay = task.end.getDate()
    return (endDay - startDay + 1) * dayWidth
  }

  const handleTaskClick = (task, e) => {
    e.stopPropagation()
    setDrawerTask(task)
    setIsDrawerOpen(true)
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
      start: new Date(currentYear, currentMonth, 1),
      end: new Date(currentYear, currentMonth, 3),
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
    const timelineRect = timelineRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - timelineRect.left,
      y: e.clientY - timelineRect.top
    })
  }

  const handleTimelineClick = (e) => {
    if (e.target === timelineRef.current || e.target.closest('.timeline-background')) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickDay = Math.max(1, Math.min(daysInMonth, Math.floor(clickX / dayWidth) + 1))
      
      const newTask = {
        id: crypto.randomUUID(),
        title: 'New Task',
        start: new Date(currentYear, currentMonth, clickDay),
        end: new Date(currentYear, currentMonth, clickDay + 2),
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggedTask || !timelineRef.current) return

      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newDay = Math.max(1, Math.min(daysInMonth, Math.floor(x / dayWidth) + 1))
      
      let updatedTask = { ...draggedTask }

      if (dragMode === 'move') {
        const taskDuration = draggedTask.end.getDate() - draggedTask.start.getDate()
        const newEndDay = Math.min(daysInMonth, newDay + taskDuration)
        
        updatedTask.start = new Date(currentYear, currentMonth, newDay)
        updatedTask.end = new Date(currentYear, currentMonth, newEndDay)
      } else if (dragMode === 'resize-start') {
        const endDay = draggedTask.end.getDate()
        if (newDay < endDay) {
          updatedTask.start = new Date(currentYear, currentMonth, newDay)
        }
      } else if (dragMode === 'resize-end') {
        const startDay = draggedTask.start.getDate()
        if (newDay > startDay) {
          updatedTask.end = new Date(currentYear, currentMonth, newDay)
        }
      }

      onUpdateTask(updatedTask)
    }

    const handleMouseUp = () => {
      setDraggedTask(null)
      setDragMode(null)
    }

    if (draggedTask) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedTask, dragMode, currentYear, currentMonth, daysInMonth, onUpdateTask, dayWidth])

  const currentMonthTasks = tasks.filter(task => 
    task.start.getMonth() === currentMonth && task.start.getFullYear() === currentYear
  )

  const handleDrawerSave = (updatedTask) => {
    onUpdateTask(updatedTask)
    setIsDrawerOpen(false)
    setDrawerTask(null)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setDrawerTask(null)
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
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-700 rounded"
              >
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
              <span className="text-white text-base font-medium min-w-[120px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                onClick={() => navigateMonth(1)}
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
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`flex items-center justify-center text-sm ${
                      isCurrentMonth && (i + 1) === todayDate 
                        ? 'bg-[#97e7aa] text-white font-semibold' 
                        : 'text-gray-300'
                    }`}
                    style={{ width: `${dayWidth}px` }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Today Marker Line */}
              {isCurrentMonth && (
                <div
                  className="absolute top-8 bottom-0 w-0.5 bg-[#97e7aa] z-20 pointer-events-none"
                  style={{ left: `${(todayDate - 0.5) * dayWidth}px` }}
                />
              )}

              {/* Vertical Grid Lines */}
              <div className="absolute inset-0 pointer-events-none top-8">
                {Array.from({ length: daysInMonth - 1 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-gray-800"
                    style={{ left: `${(i + 1) * dayWidth}px` }}
                  />
                ))}
              </div>

              {/* Tasks Area */}
              <div className="relative h-full pt-4 pb-4 overflow-y-auto custom-scrollbar">
                {currentMonthTasks.map((task, index) => {
                  const isUrgent = task.priority === 'urgent'
                  const taskColor = isUrgent ? '#ff6b35' : '#97e7aa'
                  
                  return (
                    <div
                      key={task.id}
                      className={`absolute h-8 rounded cursor-pointer transition-all duration-200 group ${
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