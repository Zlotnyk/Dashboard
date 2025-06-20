import React, { useState } from 'react'
import { Plus, FileText, Pencil } from 'lucide-react'
import TaskDrawer from './Task_Timeline/task_drawer'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'

const TodayTasks = ({ tasks = [], onAddTask, onUpdateTask, onDeleteTask }) => {
  const { isAuthenticated } = useAuth()
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [editingStart, setEditingStart] = useState('')
  const [editingEnd, setEditingEnd] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTask, setDrawerTask] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const addTodo = async () => {
    const newTodo = {
      title: 'New Task',
      start: new Date(),
      end: new Date(),
      progress: 0,
      status: 'Not started',
      priority: 'normal',
      description: '',
      color: '#3B82F6',
    }

    try {
      setLoading(true)
      
      // Use the centralized task creation function from App.jsx
      const createdTask = await onAddTask(newTodo)
      
      // Then open the drawer with the created task
      setDrawerTask(createdTask)
      setIsDrawerOpen(true)
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = task => {
    const taskId = task.id || task._id
    setEditingId(taskId)
    setEditingText(task.title)
    setEditingStart(formatDateToYYYYMMDD(task.start))
    setEditingEnd(formatDateToYYYYMMDD(task.end))
  }

  const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    // getMonth() is 0-indexed, so add 1 and pad with leading zero if needed
    const month = String(d.getMonth() + 1).padStart(2, '0');
    // getDate() returns the day of month, pad with leading zero if needed
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  const parseYYYYMMDDToDate = (dateString) => {
    if (!dateString) return new Date();
    
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date;
  }

  const finishEditing = async () => {
    if (!editingText.trim()) return
    
    const taskToUpdate = activeTasks.find(task => {
      const taskId = task.id || task._id
      return taskId === editingId
    })
    
    if (taskToUpdate) {
      // Create updated task with all original properties preserved
      const updatedTask = {
        ...taskToUpdate, // Keep all original properties including _id, id, user, color
        title: editingText,
        start: parseYYYYMMDDToDate(editingStart),
        end: parseYYYYMMDDToDate(editingEnd),
      }

      try {
        const success = await onUpdateTask(updatedTask)
        if (success) {
          toast.success('Task updated successfully')
        }
      } catch (error) {
        console.error('Error updating task:', error)
        toast.error('Failed to update task')
      }
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

  const handleDrawerSave = async (updatedTask) => {
    try {
      const success = await onUpdateTask(updatedTask)
      if (success) {
        toast.success('Task updated successfully')
      }
      
      setIsDrawerOpen(false)
      setDrawerTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setDrawerTask(null)
  }

  const handleDeleteTask = async (taskId) => {
    try {
      const success = await onDeleteTask(taskId)
      if (success) {
        toast.success('Task completed successfully')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to complete task')
    }
  }

  return (
    <>
      <div className='w-full h-full rounded-lg p-4 bg-transparent'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-[Libre_Baskerville] italic text-white'>
            Today's Tasks
          </h2>
          <button
            className='flex items-center gap-2 px-3 py-1 bg-accent text-white rounded-lg hover:bg-accent-80 text-sm disabled:opacity-50'
            onClick={addTodo}
            disabled={loading}
          >
            <Plus size={16} />
            {loading ? 'Adding...' : 'New'}
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
              const taskId = task.id || task._id
              
              return (
                <div
                  key={taskId}
                  className='bg-transparent rounded-lg p-3 hover:bg-gray-800/30 transition-colors group'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 flex-1'>
                      <FileText size={16} className='text-gray-400' />
                      {editingId === taskId ? (
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
                            disabled={loading}
                          />
                          <div className='flex gap-2'>
                            <input
                              type='date'
                              value={editingStart}
                              onChange={e => setEditingStart(e.target.value)}
                              className='bg-transparent outline-none text-gray-400 text-xs'
                              disabled={loading}
                            />
                            <input
                              type='date'
                              value={editingEnd}
                              onChange={e => setEditingEnd(e.target.value)}
                              className='bg-transparent outline-none text-gray-400 text-xs'
                              disabled={loading}
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
                    </div>

                    {/* Edit button and checkbox with proper spacing */}
                    <div className='flex items-center gap-[10px]'>
                      {editingId !== taskId && (
                        <button
                          onClick={() => openTaskDrawer(task)}
                          className='opacity-0 group-hover:opacity-100 border border-gray-500 rounded p-1 hover:bg-gray-600 transition-all w-6 h-6 flex items-center justify-center'
                          title='Edit Task Details'
                          disabled={loading}
                        >
                          <Pencil size={12} className='text-gray-400' />
                        </button>
                      )}

                      <input
                        type='checkbox'
                        onChange={() => handleDeleteTask(taskId)}
                        className='w-6 h-6 cursor-pointer bg-transparent appearance-none border border-gray-400 rounded checked:bg-blue-500 checked:border-transparent'
                        title='Complete Task'
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {/* New page button */}
          <button
            className='w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50'
            onClick={addTodo}
            disabled={loading}
          >
            <Plus size={16} />
            <span className='text-sm'>{loading ? 'Adding...' : 'New page'}</span>
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
            handleDeleteTask(drawerTask.id || drawerTask._id)
            handleDrawerClose()
          }
        }}
      />
    </>
  )
}

export default TodayTasks