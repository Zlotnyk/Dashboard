import React, { useState, useRef } from 'react'
import TimelineHeader from './timeline_header'
import TimelineCalendar from './timeline_calendar'
import TimelineToolbar from './timeline_toolbar'
import { formatShortDate } from './timeline_utils'

const TaskTimeline = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 12))
  const [viewMode, setViewMode] = useState('month')
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 12))
  const [draggingTask, setDraggingTask] = useState(null)
  const [dragType, setDragType] = useState(null) // 'move', 'start', or 'end'
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
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const handleDateSelect = date => {
    setSelectedDate(date)
  }

  const handleAddTask = () => {
    const newTask = {
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

  const handleDragStart = (task, type, e) => {
    setDraggingTask(task)
    setDragType(type)
    e.preventDefault()
  }

  const handleDragOver = e => {
    if (!draggingTask) return
    e.preventDefault()

    const timeline = timelineRef.current
    const rect = timeline.getBoundingClientRect()
    const x = e.clientX - rect.left
    const dayWidth = 40 // Width of each day column
    const daysFromStart = Math.floor(x / dayWidth)

    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + daysFromStart)

    if (dragType === 'move') {
      const duration = (draggingTask.end - draggingTask.start) / (1000 * 60 * 60 * 24)
      const updatedTask = {
        ...draggingTask,
        start: newDate,
        end: new Date(newDate.getTime() + duration * 24 * 60 * 60 * 1000),
      }
      onUpdateTask(updatedTask)
    } else if (dragType === 'start') {
      const updatedTask = {
        ...draggingTask,
        start: newDate,
      }
      onUpdateTask(updatedTask)
    } else if (dragType === 'end') {
      const updatedTask = {
        ...draggingTask,
        end: newDate,
      }
      onUpdateTask(updatedTask)
    }
  }

  const handleDragEnd = () => {
    setDraggingTask(null)
    setDragType(null)
  }

  const getTaskPosition = task => {
    const startDate = task.start
    const endDate = task.end
    const dayWidth = 40

    const diffStart = Math.floor(
      (startDate - currentDate) / (1000 * 60 * 60 * 24)
    )
    const diffEnd = Math.floor((endDate - currentDate) / (1000 * 60 * 60 * 24))

    return {
      left: diffStart * dayWidth,
      width: (diffEnd - diffStart + 1) * dayWidth,
    }
  }

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
          <button className='flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-500 text-gray-300 hover:bg-[#97e7aa] hover:text-white transition-colors'>
            <span className='hidden sm:inline'>Open in Calendar</span>
            <span className='sm:hidden'>Calendar</span>
          </button>

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
              &lt;
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
              &gt;
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
            />
            
            <div 
              ref={timelineRef}
              className='relative min-h-[200px] pt-4'
              onDragOver={handleDragOver}
              onDrop={handleDragEnd}
            >
              {tasks.map((task, index) => {
                const { left, width } = getTaskPosition(task)
                return (
                  <div
                    key={task.id}
                    className='relative h-12 mb-2'
                    style={{ marginLeft: '0px' }}
                  >
                    <div
                      className='absolute h-8 rounded-lg flex items-center cursor-move'
                      style={{
                        backgroundColor: task.color,
                        left: `${left}px`,
                        width: `${width}px`,
                      }}
                      draggable
                      onDragStart={e => handleDragStart(task, 'move', e)}
                    >
                      <div
                        className='absolute left-0 w-4 h-full cursor-ew-resize'
                        draggable
                        onDragStart={e => handleDragStart(task, 'start', e)}
                      />
                      <div className='px-3 truncate flex-1'>
                        <span className='text-white'>{task.title}</span>
                        <span className='text-white text-sm ml-2'>
                          [{formatShortDate(task.start)} - {formatShortDate(task.end)}]
                        </span>
                      </div>
                      <div
                        className='absolute right-0 w-4 h-full cursor-ew-resize'
                        draggable
                        onDragStart={e => handleDragStart(task, 'end', e)}
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