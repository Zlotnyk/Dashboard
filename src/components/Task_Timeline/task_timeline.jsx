import React, { useState, useRef } from 'react'
import TimelineHeader from './timeline_header'
import TimelineCalendar from './timeline_calendar'
import TimelineToolbar from './timeline_toolbar'
import { formatShortDate } from './timeline_utils'
import { Plus } from 'lucide-react'

const TaskTimeline = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)) // Set to first day of month
  const [viewMode, setViewMode] = useState('month')
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 1))
  const [draggingTask, setDraggingTask] = useState(null)
  const [dragType, setDragType] = useState(null)
  const [hoveredPosition, setHoveredPosition] = useState(null)
  const [dragStartX, setDragStartX] = useState(0)
  const timelineRef = useRef(null)

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    )
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  const handleDateSelect = date => {
    setSelectedDate(date)
  }

  const handleAddTask = (taskData = null) => {
    const newTask = taskData || {
      id: `task-${Date.now()}`,
      title: 'New Task',
      start: new Date(selectedDate),
      end: new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() + 3
      ),
      progress: 0,
      color: '#3B82F6',
    }
    onAddTask(newTask)
  }

  const handleAddTaskAtPosition = (dayIndex) => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const taskDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayIndex + 1)
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      start: taskDate,
      end: new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate() + 3),
      progress: 0,
      color: '#3B82F6',
    }
    onAddTask(newTask)
  }

  const handleDragStart = (task, type, e) => {
    setDraggingTask(task)
    setDragType(type)
    setDragStartX(e.clientX)
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragOver = e => {
    if (!draggingTask) return
    e.preventDefault()

    const timeline = timelineRef.current
    const rect = timeline.getBoundingClientRect()
    const x = e.clientX - rect.left
    const dayWidth = 40
    const daysFromStart = Math.floor(x / dayWidth)

    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const newDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), daysFromStart + 1)

    if (dragType === 'move') {
      const duration = Math.ceil((draggingTask.end - draggingTask.start) / (1000 * 60 * 60 * 24))
      const updatedTask = {
        ...draggingTask,
        start: newDate,
        end: new Date(newDate.getTime() + duration * 24 * 60 * 60 * 1000),
      }
      onUpdateTask(updatedTask)
    } else if (dragType === 'start') {
      if (newDate < draggingTask.end) {
        const updatedTask = {
          ...draggingTask,
          start: newDate,
        }
        onUpdateTask(updatedTask)
      }
    } else if (dragType === 'end') {
      if (newDate > draggingTask.start) {
        const updatedTask = {
          ...draggingTask,
          end: newDate,
        }
        onUpdateTask(updatedTask)
      }
    }
  }

  const handleDragEnd = () => {
    setDraggingTask(null)
    setDragType(null)
    setDragStartX(0)
  }

  const handleTimelineMouseMove = (e) => {
    if (draggingTask) return // Don't show hover button while dragging
    
    const timeline = timelineRef.current
    const rect = timeline.getBoundingClientRect()
    const x = e.clientX - rect.left
    const dayWidth = 40
    const dayIndex = Math.floor(x / dayWidth)
    
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
    if (dayIndex >= 0 && dayIndex < daysInMonth) {
      setHoveredPosition(dayIndex)
    } else {
      setHoveredPosition(null)
    }
  }

  const handleTimelineMouseLeave = () => {
    setHoveredPosition(null)
  }

  const getTaskPosition = task => {
    const startDate = task.start
    const endDate = task.end
    const dayWidth = 40

    // Calculate position relative to the first day of the current month
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    
    // Calculate days from month start (0-based for positioning)
    const startDayFromMonth = Math.max(0, Math.floor((startDate - monthStart) / (1000 * 60 * 60 * 24)))
    const endDayFromMonth = Math.floor((endDate - monthStart) / (1000 * 60 * 60 * 24)) + 1
    
    const width = Math.max(dayWidth, (endDayFromMonth - startDayFromMonth) * dayWidth)

    return {
      left: startDayFromMonth * dayWidth,
      width: width,
    }
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const renderVerticalLines = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
    return Array.from({ length: daysInMonth + 1 }, (_, index) => (
      <div
        key={index}
        className='absolute top-0 bottom-0 border-l border-gray-700'
        style={{ left: `${index * 40}px` }}
      ></div>
    ))
  }

  // Filter tasks that are visible in current month
  const visibleTasks = tasks.filter(task => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    return (task.start <= monthEnd && task.end >= monthStart)
  })

  return (
    <div className='flex flex-col text-gray-200 h-[500px]'>
      <TimelineHeader />

      <div className='px-4 py-3 flex justify-between items-center border-b border-gray-700'>
        <div className='flex items-center gap-4'>
          <h2 className='text-xl font-medium'>
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1 rounded-lg border border-gray-500'>
            <select
              className='bg-transparent border-none text-gray-300 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#97e7aa] hover:bg-[#97e7aa] hover:text-white transition-colors'
              value={viewMode}
              onChange={e => setViewMode(e.target.value)}
            >
              <option value='month'>Month</option>
              <option value='week'>Week</option>
            </select>
          </div>

          <div className='flex'>
            <button
              onClick={handlePrevMonth}
              className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'
            >
              ‹
            </button>
            <button
              onClick={handleToday}
              className='w-12 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-x-auto overflow-y-auto custom-scrollbar'>
          <div className='min-w-max'>
            <TimelineCalendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onAddTask={handleAddTask}
            />
            
            <div 
              ref={timelineRef}
              className='relative min-h-[200px] pt-2'
              onDragOver={handleDragOver}
              onDrop={handleDragEnd}
              onMouseMove={handleTimelineMouseMove}
              onMouseLeave={handleTimelineMouseLeave}
            >
              {renderVerticalLines()}
              
              {/* Hover plus button */}
              {hoveredPosition !== null && !draggingTask && (
                <button
                  onClick={() => handleAddTaskAtPosition(hoveredPosition)}
                  className='absolute top-2 w-6 h-6 bg-gray-500 bg-opacity-70 hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all z-20'
                  style={{ left: `${hoveredPosition * 40 + 17}px` }}
                  title='Add task'
                >
                  <Plus size={14} className='text-white' />
                </button>
              )}
              
              {visibleTasks.map((task, index) => {
                const { left, width } = getTaskPosition(task)
                return (
                  <div
                    key={task.id}
                    className='relative h-6 mb-1'
                  >
                    <div
                      className='absolute h-5 rounded-lg flex items-center cursor-move group'
                      style={{
                        backgroundColor: task.color,
                        left: `${left}px`,
                        width: `${width}px`,
                      }}
                      draggable
                      onDragStart={e => handleDragStart(task, 'move', e)}
                    >
                      {/* Left resize handle */}
                      <div
                        className='absolute left-0 w-2 h-full cursor-ew-resize bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity'
                        draggable
                        onDragStart={e => handleDragStart(task, 'start', e)}
                        title='Resize start date'
                      />
                      
                      <div className='px-2 truncate flex-1 pointer-events-none'>
                        <span className='text-white text-xs font-medium'>{task.title}</span>
                        <span className='text-white text-xs ml-1 opacity-80'>
                          [{formatShortDate(task.start)} - {formatShortDate(task.end)}]
                        </span>
                      </div>
                      
                      {/* Right resize handle */}
                      <div
                        className='absolute right-0 w-2 h-full cursor-ew-resize bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity'
                        draggable
                        onDragStart={e => handleDragStart(task, 'end', e)}
                        title='Resize end date'
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <TimelineToolbar onAddTask={handleAddTask} />
    </div>
  )
}

export default TaskTimeline