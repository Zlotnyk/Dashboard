import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import { Plus, Calendar, Clock, X, ChevronDown, Info, Edit, Trash2 } from 'lucide-react'
import '../../App.css'

function LifestyleDayPage() {
  const [showInfoBox, setShowInfoBox] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scheduleItems, setScheduleItems] = useState({})
  const [tasks, setTasks] = useState([])
  const [goals, setGoals] = useState([])
  const [priorities, setPriorities] = useState([])
  const [notes, setNotes] = useState("")
  const [reflection, setReflection] = useState("")
  const [brainDump, setBrainDump] = useState([])
  const [newTask, setNewTask] = useState("")
  const [newGoal, setNewGoal] = useState("")
  const [newPriority, setNewPriority] = useState("")
  const [newBrainDumpItem, setNewBrainDumpItem] = useState("")
  
  // Time slots for the schedule
  const timeSlots = [
    "5 am", "6 am", "7 am", "8 am", "9 am", "10 am", "11 am",
    "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm",
    "7 pm", "8 pm", "9 pm", "10 pm", "11 pm"
  ]
  
  // Load data from localStorage
  useEffect(() => {
    const dateKey = currentDate.toISOString().split('T')[0]
    const savedData = localStorage.getItem(`dayPlanner_${dateKey}`)
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setScheduleItems(parsedData.scheduleItems || {})
        setTasks(parsedData.tasks || [])
        setGoals(parsedData.goals || [])
        setPriorities(parsedData.priorities || [])
        setNotes(parsedData.notes || "")
        setReflection(parsedData.reflection || "")
        setBrainDump(parsedData.brainDump || [])
      } catch (error) {
        console.error('Error parsing day planner data:', error)
      }
    } else {
      // Reset data for new day
      setScheduleItems({})
      setTasks([])
      setGoals([])
      setPriorities([])
      setNotes("")
      setReflection("")
      setBrainDump([])
    }
  }, [currentDate])
  
  // Save data to localStorage
  useEffect(() => {
    const dateKey = currentDate.toISOString().split('T')[0]
    const dataToSave = {
      scheduleItems,
      tasks,
      goals,
      priorities,
      notes,
      reflection,
      brainDump
    }
    
    localStorage.setItem(`dayPlanner_${dateKey}`, JSON.stringify(dataToSave))
  }, [currentDate, scheduleItems, tasks, goals, priorities, notes, reflection, brainDump])
  
  const handleDateChange = (date) => {
    setCurrentDate(date)
  }
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: crypto.randomUUID(), text: newTask, completed: false }])
      setNewTask("")
    }
  }
  
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, { id: crypto.randomUUID(), text: newGoal }])
      setNewGoal("")
    }
  }
  
  const handleAddPriority = () => {
    if (newPriority.trim()) {
      setPriorities([...priorities, { id: crypto.randomUUID(), text: newPriority }])
      setNewPriority("")
    }
  }
  
  const handleAddBrainDumpItem = () => {
    if (newBrainDumpItem.trim()) {
      setBrainDump([...brainDump, { id: crypto.randomUUID(), text: newBrainDumpItem }])
      setNewBrainDumpItem("")
    }
  }
  
  const handleToggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }
  
  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }
  
  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }
  
  const handleDeletePriority = (id) => {
    setPriorities(priorities.filter(priority => priority.id !== id))
  }
  
  const handleDeleteBrainDumpItem = (id) => {
    setBrainDump(brainDump.filter(item => item.id !== id))
  }
  
  const handleScheduleItemChange = (timeSlot, value) => {
    setScheduleItems({
      ...scheduleItems,
      [timeSlot]: value
    })
  }

  return (
    <div>
      <Navbar />
      <header className='relative'>
        <GifContainer />
      </header>
      <HeaderContent title="Day Planner" />
      <NavigationLinks />
      <WavyLines />
      <main className='flex w-full min-h-screen select-none'>
        {/* Left Section - 20% */}
        <section
          className='flex flex-col p-4 gap-4'
          style={{ width: '20%' }}
        >
          <FlipClock />
          <QuickLinks />
        </section>

        {/* Right Section - 80% */}
        <section
          className='flex flex-col p-4 gap-4 flex-1'
          style={{ width: '80%' }}
        >
          {/* Day Planner Content */}
          <div className='rounded-lg p-6 min-h-[600px]'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                Day Planner
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={currentDate.toISOString().split('T')[0]}
                  onChange={(e) => handleDateChange(new Date(e.target.value))}
                  className="bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Horizontal line under header */}
            <div className="w-full h-px bg-gray-700 mb-6"></div>

            {/* Info Box with close button */}
            {showInfoBox && (
              <div className="border rounded-lg p-4 mb-6 relative" style={{ 
                backgroundColor: 'color-mix(in srgb, var(--accent-color) 20%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)'
              }}>
                <button
                  onClick={() => setShowInfoBox(false)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-black/20 transition-colors"
                  style={{ color: 'var(--accent-color)' }}
                >
                  <X size={16} />
                </button>
                <div className="flex items-start gap-3 pr-8">
                  <Info size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>This is a day planner.</p>
                    <p className="text-gray-300 text-sm italic">To add today's task, press + New. Make sure you select the correct today's date and a day of the week beginning (Sunday/Monday). At the end of the day, you can close the Toggle. To add another Day Planner, press + Add a new Day Planner.</p>
                    <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Date Display */}
            <div className="mb-6">
              <h3 className="text-xl text-white font-medium">
                {formatDate(currentDate)}
              </h3>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Daily Brain Dump and Schedule */}
              <div className="space-y-6">
                {/* Daily Brain Dump */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Daily Brain Dump
                  </h3>
                  
                  <div className="border rounded-lg p-4 mb-4 relative bg-[#2a2a2a] border-gray-700">
                    <div className="flex items-start gap-3">
                      <Info size={16} className="flex-shrink-0 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-300 text-sm">Before you start planning your day, use brain dump first. This will help you focus on what's important.</p>
                        <p className="text-gray-400 text-xs italic mt-1">Delete this after reading.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {brainDump.map(item => (
                      <div key={item.id} className="flex items-center gap-2 group">
                        <div className="w-4 h-4 rounded-full bg-gray-700 flex-shrink-0"></div>
                        <div className="text-gray-300 flex-1">{item.text}</div>
                        <button 
                          onClick={() => handleDeleteBrainDumpItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white hover:bg-accent transition-colors"
                      onClick={handleAddBrainDumpItem}
                    >
                      <Plus size={14} />
                    </button>
                    <input
                      type="text"
                      value={newBrainDumpItem}
                      onChange={(e) => setNewBrainDumpItem(e.target.value)}
                      placeholder="Add a new daily brain dump"
                      className="flex-1 bg-transparent border-b border-gray-600 focus:border-accent outline-none text-white py-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newBrainDumpItem.trim()) {
                          handleAddBrainDumpItem()
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Schedule */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-[Libre_Baskerville] italic text-accent">
                      Schedule
                    </h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-white">
                        <Calendar size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2 text-gray-400 font-medium w-1/4">Time</th>
                          <th className="text-left p-2 text-gray-400 font-medium">Task</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map(timeSlot => (
                          <tr key={timeSlot} className="border-t border-gray-700">
                            <td className="p-2 text-gray-300">{timeSlot}</td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={scheduleItems[timeSlot] || ''}
                                onChange={(e) => handleScheduleItemChange(timeSlot, e.target.value)}
                                placeholder="Add task"
                                className="w-full bg-transparent text-white outline-none"
                              />
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan="2" className="p-2">
                            <button className="flex items-center gap-2 text-gray-400 hover:text-white">
                              <Plus size={14} />
                              <span className="text-sm">New page</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Today's Reflection */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Today's Reflection
                  </h3>
                  
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Type something..."
                    className="w-full h-32 bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              
              {/* Right Column - Tasks, Goals, Priorities, Notes */}
              <div className="space-y-6">
                {/* Today's Tasks */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-[Libre_Baskerville] italic text-accent">
                      Today's Tasks
                    </h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-white">
                        <Clock size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 group">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: 'var(--accent-color)' }}
                        />
                        <div className={`text-gray-300 flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.text}
                        </div>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white hover:bg-accent transition-colors"
                      onClick={handleAddTask}
                    >
                      <Plus size={14} />
                    </button>
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Add a new to-do"
                      className="flex-1 bg-transparent border-b border-gray-600 focus:border-accent outline-none text-white py-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTask.trim()) {
                          handleAddTask()
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Today's Goals */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Today's Goals
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {goals.map(goal => (
                      <div key={goal.id} className="flex items-center gap-2 group">
                        <div className="w-4 h-4 rounded-full bg-gray-700 flex-shrink-0"></div>
                        <div className="text-gray-300 flex-1">{goal.text}</div>
                        <button 
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white hover:bg-accent transition-colors"
                      onClick={handleAddGoal}
                    >
                      <Plus size={14} />
                    </button>
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add a new goal"
                      className="flex-1 bg-transparent border-b border-gray-600 focus:border-accent outline-none text-white py-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newGoal.trim()) {
                          handleAddGoal()
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Priorities */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Priorities
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {priorities.map(priority => (
                      <div key={priority.id} className="flex items-center gap-2 group">
                        <div className="w-4 h-4 rounded-full bg-gray-700 flex-shrink-0"></div>
                        <div className="text-gray-300 flex-1">{priority.text}</div>
                        <button 
                          onClick={() => handleDeletePriority(priority.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white hover:bg-accent transition-colors"
                      onClick={handleAddPriority}
                    >
                      <Plus size={14} />
                    </button>
                    <input
                      type="text"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      placeholder="Add a new priority"
                      className="flex-1 bg-transparent border-b border-gray-600 focus:border-accent outline-none text-white py-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newPriority.trim()) {
                          handleAddPriority()
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Notes */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-lg font-[Libre_Baskerville] italic text-accent mb-4">
                    Notes
                  </h3>
                  
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Type something..."
                    className="w-full h-32 bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LifestyleDayPage