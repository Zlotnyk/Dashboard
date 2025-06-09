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

  // Filter tasks for today
  const today = new Date()
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.start)
    return taskDate.toDateString() === today.toDateString()
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
    onUpdateTask({
      id: editingId,
      title: editingText,
      start: new Date(editingStart),
      end: new Date(editingEnd),
      progress: 0,
      color: '#3B82F6',
    })
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
      <div className='w-full min-h-[400px] rounded-lg p-5'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-[Libre_Baskerville] italic text-[#e0e0e0]'>
            Today's Tasks
          </h2>
          <button
            className='flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 text-base'
            onClick={addTodo}
          >
            <Plus size={20} />
            New
          </button>
        </div>

        <div className='space-y-3'>
          {todayTasks.map(task => {
            const isUrgent = task.priority === 'urgent'
            
            return (
              <div
                key={task.id}
                className='flex items-center justify-between p-2 rounded'
              >
                <div className='flex items-center gap-2 flex-1'>
                  <FileText size={20} className='text-[#a0a0a0]' />
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
                        className='bg-transparent outline-none text-[#a0a0a0] w-full text-base'
                      />
                      <input
                        type='date'
                        value={editingStart}
                        onChange={e => setEditingStart(e.target.value)}
                        className='bg-transparent outline-none text-[#a0a0a0] text-base'
                      />
                      <input
                        type='date'
                        value={editingEnd}
                        onChange={e => setEditingEnd(e.target.value)}
                        className='bg-transparent outline-none text-[#a0a0a0] text-base'
                      />
                    </div>
                  ) : (
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-2'>
                        {isUrgent && <span className="text-orange-500">🔥</span>}
                        <span className='text-[#a0a0a0] text-base'>{task.title}</span>
                      </div>
                      <span className='text-[#a0a0a0] text-sm'>
                        {task.start.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {editingId !== task.id && (
                    <button
                      onClick={() => openTaskDrawer(task)}
                      className='border border-gray-500 rounded p-1 hover:bg-gray-700 ml-2'
                      title='Edit Task Details'
                    >
                      <Pencil size={16} className='text-gray-400' />
                    </button>
                  )}
                </div>

                <input
                  type='checkbox'
                  onChange={() => onDeleteTask(task.id)}
                  className='w-4 h-4 cursor-pointer bg-transparent appearance-none border border-gray-400 rounded checked:bg-blue-500 checked:border-transparent'
                  title='Delete'
                />
              </div>
            )
          })}

          <div
            className='flex items-center gap-3 p-2 hover:bg-[#333] rounded cursor-pointer'
            onClick={addTodo}
          >
            <Plus size={20} className='text-[#a0a0a0]' />
            <span className='text-[#a0a0a0] text-base'>New task</span>
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

export default TodayTasks