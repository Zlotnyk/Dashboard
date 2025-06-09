import React, { useState } from 'react'
import { Plus, FileText, Pencil } from 'lucide-react'
import TaskDrawer from './Task_Timeline/task_drawer'

const TodayTasks = ({ tasks = [], onAddTask, onUpdateTask, onDeleteTask }) => {
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [editingStart, setEditingStart] = useState('')
  const [editingEnd, setEditingEnd] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTask, setDrawerTask] = useState(null)

  // Filter tasks that are active today (start <= today <= end)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
  
  const activeTasks = tasks.filter(task => {
    const taskStart = new Date(task.start)
    const taskEnd = new Date(task.end)
    
    // Reset time to start of day for accurate comparison
    taskStart.setHours(0, 0, 0, 0)
    taskEnd.setHours(23, 59, 59, 999) // End of day for end date
    
    // Task is active if today is between start and end dates (inclusive)
    return taskStart <= today && today <= taskEnd
  })

  const addTodo = () => {
    const newTodo = {
      id: crypto.randomUUID(),
      title: 'New Task',
      start: new Date(),
      end: new Date(),
      progress: 0,
      status: 'Not started',
      priority: 'normal',
      description: '',
      color: '#3B82F6',
    }
    onAddTask(newTodo)
  }

  const startEditing = task => {
    setEditingId(task.id)
    setEditingText(task.title)
    setEditingStart(task.start.toISOString().split('T')[0])
    setEditingEnd(task.end.toISOString().split('T')[0])
  }

  const finishEditing = () => {
    if (!editingText.trim()) return
    
    const taskToUpdate = activeTasks.find(task => task.id === editingId)
    if (taskToUpdate) {
      onUpdateTask({
        ...taskToUpdate,
        title: editingText,
        start: new Date(editingStart),
        end: new Date(editingEnd),
      })
    }
    
    setEditingId(null)
    setEditingText('')
    setEditingStart('')
    setEditingEnd('')
  }

  const openTaskDrawer = (task) => {
    setDrawerTask(task)
    setIsDrawerOpen(true)
  }

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
      <div className='w-full h-full bg-[#1a1a1a] rounded-lg p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-[Libre_Baskerville] italic text-white'>
            Today's Tasks
          </h2>
          <button
            className='flex items-center gap-2 px-3 py-1 bg-accent text-white rounded-lg hover:bg-accent-80 text-sm'
            onClick={addTodo}
          >
            <Plus size={16} />
            New
          </button>
        </div>

        {/* Horizontal line under header */}
        <div className="w-full h-px bg-gray-700 mb-4"></div>

        <div className='space-y-2'>
          {activeTasks.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No active tasks for today
            </div>
          ) : (
            activeTasks.map(task => {
              const isUrgent = task.priority === 'urgent'
              
              return (
                <div
                  key={task.id}
                  className='bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors group'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 flex-1'>
                      <FileText size={16} className='text-gray-400' />
                      {editingId === task.id ? (
                        <div className='flex flex-col gap-2 w-full'>
                          <input
                            autoFocus
                            type='text'
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            onBlur={finishEditing}
                            onKeyDown={e => {
                              if (e.key === 'Enter') finishEditing()
                            }}
                            className='bg-transparent outline-none text-white w-full text-sm'
                          />
                          <div className='flex gap-2'>
                            <input
                              type='date'
                              value={editingStart}
                              onChange={e => setEditingStart(e.target.value)}
                              className='bg-transparent outline-none text-gray-400 text-xs'
                            />
                            <input
                              type='date'
                              value={editingEnd}
                              onChange={e => setEditingEnd(e.target.value)}
                              className='bg-transparent outline-none text-gray-400 text-xs'
                            />
                          </div>
                        </div>
                      ) : (
                        <div className='flex flex-col flex-1'>
                          <div className='flex items-center gap-2'>
                            {isUrgent && <span className="text-orange-500">🔥</span>}
                            <span className='text-white text-sm font-medium'>{task.title}</span>
                          </div>
                          <div className='text-gray-400 text-xs'>
                            {task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}
                          </div>
                          <div className='text-gray-400 text-xs'>
                            Status: {task.status || 'Not started'}
                          </div>
                        </div>
                      )}
                      {editingId !== task.id && (
                        <button
                          onClick={() => openTaskDrawer(task)}
                          className='opacity-0 group-hover:opacity-100 border border-gray-500 rounded p-1 hover:bg-gray-600 transition-all'
                          title='Edit Task Details'
                        >
                          <Pencil size={12} className='text-gray-400' />
                        </button>
                      )}
                    </div>

                    <input
                      type='checkbox'
                      onChange={() => onDeleteTask(task.id)}
                      className='w-4 h-4 cursor-pointer bg-transparent appearance-none border border-gray-400 rounded checked:bg-blue-500 checked:border-transparent ml-2'
                      title='Complete Task'
                    />
                  </div>
                </div>
              )
            })
          )}

          {/* New page button */}
          <button
            className='w-full flex items-center justify-center gap-2 py-4 px-4 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors'
            onClick={addTodo}
          >
            <Plus size={16} />
            <span className='text-sm'>New page</span>
          </button>
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

export default TodayTasks