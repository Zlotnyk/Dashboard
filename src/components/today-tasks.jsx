import React, { useState } from 'react'
import { Plus, FileText, Pencil, Check } from 'lucide-react'

const TodayTasks = ({ tasks = [], onAddTask, onUpdateTask, onDeleteTask }) => {
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  // Filter tasks for today
  const today = new Date()
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.start)
    return taskDate.toDateString() === today.toDateString()
  })

  const addTask = () => {
    const newTask = {
      id: crypto.randomUUID(),
      title: 'New Task',
      start: new Date(),
      end: new Date(),
      progress: 0,
      status: 'Not started',
      priority: 'normal',
      description: '',
      completed: false
    }
    onAddTask(newTask)
  }

  const startEditing = (task) => {
    setEditingId(task.id)
    setEditingText(task.title)
  }

  const finishEditing = () => {
    if (!editingText.trim()) return
    
    const taskToUpdate = todayTasks.find(task => task.id === editingId)
    if (taskToUpdate) {
      onUpdateTask({
        ...taskToUpdate,
        title: editingText
      })
    }
    
    setEditingId(null)
    setEditingText('')
  }

  const toggleComplete = (task) => {
    onUpdateTask({
      ...task,
      completed: !task.completed,
      status: !task.completed ? 'Completed' : 'Not started'
    })
  }

  return (
    <div className="w-full h-full bg-[#1a1a1a] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-[Libre_Baskerville] italic text-white">
          Today's Tasks
        </h3>
        <button
          onClick={addTask}
          className="flex items-center gap-1 px-2 py-1 bg-accent text-white rounded text-sm hover:bg-accent-80"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Horizontal line under header */}
      <div className="w-full h-px bg-gray-700 mb-4"></div>

      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {todayTasks.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            No tasks for today
          </div>
        ) : (
          todayTasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-2 p-2 rounded transition-colors ${
                task.completed ? 'bg-gray-800/30' : 'hover:bg-gray-800/50'
              }`}
            >
              <button
                onClick={() => toggleComplete(task)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed 
                    ? 'bg-accent border-accent' 
                    : 'border-gray-500 hover:border-accent'
                }`}
              >
                {task.completed && <Check size={10} className="text-white" />}
              </button>

              <FileText size={16} className="text-gray-400 flex-shrink-0" />

              {editingId === task.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={finishEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') finishEditing()
                    if (e.key === 'Escape') {
                      setEditingId(null)
                      setEditingText('')
                    }
                  }}
                  className="flex-1 bg-transparent outline-none text-white text-sm"
                />
              ) : (
                <span 
                  className={`flex-1 text-sm cursor-pointer ${
                    task.completed 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-300'
                  }`}
                  onClick={() => startEditing(task)}
                >
                  {task.title}
                </span>
              )}

              {task.priority === 'urgent' && !task.completed && (
                <span className="text-orange-500 text-sm">🔥</span>
              )}

              {editingId !== task.id && (
                <button
                  onClick={() => startEditing(task)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded"
                >
                  <Pencil size={12} className="text-gray-400" />
                </button>
              )}
            </div>
          ))
        )}

        <button
          onClick={addTask}
          className="w-full flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm">Add new task</span>
        </button>
      </div>
    </div>
  )
}

export default TodayTasks