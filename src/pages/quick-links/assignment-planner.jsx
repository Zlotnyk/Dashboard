import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import GifContainer from '../../components/gif_container'
import HeaderContent from '../../components/header-content'
import NavigationLinks from '../../components/navigation-links'
import WavyLines from '../../components/wavy-lines'
import FlipClock from '../../components/FlipClock/'
import QuickLinks from '../../components/quick-links'
import BigCalendar from '../../components/big-calendar'
import { Plus, FileText, Calendar, Clock, Flag, Edit, Trash2, AlertCircle, X, CheckSquare } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useAuth } from '../../hooks/useAuth'
import '../../App.css'

function AssignmentPlannerPage() {
  const { isAuthenticated, user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [events, setEvents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(true)

  // Editing states for inline editing
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [editingValues, setEditingValues] = useState({})

  const [assignmentForm, setAssignmentForm] = useState({
    assignment: '',
    dueDate: '',
    status: 'Not started',
    submitted: false,
    grade: '',
    notes: ''
  })

  const statusOptions = [
    { value: 'Not started', label: 'Not started', color: '#6b7280' },
    { value: 'In progress', label: 'In progress', color: '#f59e0b' },
    { value: 'Completed', label: 'Completed', color: '#10b981' },
    { value: 'Submitted', label: 'Submitted', color: '#3b82f6' },
    { value: 'Graded', label: 'Graded', color: '#8b5cf6' }
  ]

  // Load data from localStorage
  useEffect(() => {
    const savedAssignments = localStorage.getItem('assignmentPlannerData')
    const savedEvents = localStorage.getItem('assignmentEvents')
    
    if (savedAssignments) {
      try {
        const parsedAssignments = JSON.parse(savedAssignments).map(assignment => ({
          ...assignment,
          dueDate: new Date(assignment.dueDate)
        }))
        setAssignments(parsedAssignments)
      } catch (error) {
        console.error('Error parsing assignments:', error)
      }
    }
    
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map(event => ({
          ...event,
          date: new Date(event.date)
        }))
        setEvents(parsedEvents)
      } catch (error) {
        console.error('Error parsing events:', error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (assignments.length > 0) {
      localStorage.setItem('assignmentPlannerData', JSON.stringify(assignments))
    }
  }, [assignments])

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('assignmentEvents', JSON.stringify(events))
    }
  }, [events])

  const validateForm = () => {
    const errors = {}
    
    if (!assignmentForm.assignment.trim()) {
      errors.assignment = 'Assignment name is required'
    }
    
    if (!assignmentForm.dueDate) {
      errors.dueDate = 'Due date is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (field, value) => {
    setAssignmentForm(prev => ({ ...prev, [field]: value }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Inline editing functions
  const startEditingAssignment = (assignment) => {
    setEditingAssignment(assignment.id)
    setEditingValues({
      assignment: assignment.assignment,
      dueDate: assignment.dueDate.toISOString().split('T')[0],
      status: assignment.status,
      submitted: assignment.submitted || false,
      grade: assignment.grade || '',
      notes: assignment.notes || ''
    })
  }

  const saveInlineEdit = (id) => {
    const updatedAssignment = {
      ...assignments.find(a => a.id === id),
      ...editingValues,
      dueDate: new Date(editingValues.dueDate),
      id: id
    }
    setAssignments(prev => prev.map(assignment => 
      assignment.id === id ? updatedAssignment : assignment
    ))
    
    // Update the corresponding event in the calendar
    const assignmentEvent = events.find(event => event.assignmentId === id)
    if (assignmentEvent) {
      const updatedEvent = {
        ...assignmentEvent,
        title: updatedAssignment.assignment,
        date: new Date(updatedAssignment.dueDate),
        category: 'assignment'
      }
      setEvents(prev => prev.map(event => 
        event.assignmentId === id ? updatedEvent : event
      ))
    }
    
    // Update the corresponding reminder in the main dashboard
    updateAssignmentReminder(updatedAssignment)
    
    setEditingAssignment(null)
    setEditingValues({})
  }

  const cancelInlineEdit = () => {
    setEditingAssignment(null)
    setEditingValues({})
  }

  const addNewAssignment = () => {
    const newAssignment = {
      id: crypto.randomUUID(),
      assignment: '',
      dueDate: new Date(),
      status: 'Not started',
      submitted: false,
      grade: '',
      notes: '',
      createdAt: new Date().toISOString()
    }

    setAssignments(prev => [...prev, newAssignment])
    startEditingAssignment(newAssignment)
  }

  const handleDeleteAssignment = (assignmentId) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId))
    
    // Also delete the corresponding event from the calendar
    setEvents(prev => prev.filter(event => event.assignmentId !== assignmentId))
    
    // Also delete the corresponding reminder from the main dashboard
    deleteAssignmentReminder(assignmentId)
  }

  const handleEditingValueChange = (field, value) => {
    setEditingValues(prev => ({ ...prev, [field]: value }))
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.color : '#6b7280'
  }

  const calculateDaysUntil = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    return `${diffDays} days left`
  }

  const handleEventAdd = (event) => {
    // If it's an assignment event, also add it to the assignments list
    if (event.category === 'assignment' && !event.assignmentId) {
      const newAssignment = {
        id: crypto.randomUUID(),
        assignment: event.title,
        dueDate: new Date(event.date),
        status: 'Not started',
        submitted: false,
        grade: '',
        notes: '',
        createdAt: new Date().toISOString()
      }
      
      setAssignments(prev => [...prev, newAssignment])
      
      // Update the event with the assignment ID reference
      const updatedEvent = {
        ...event,
        assignmentId: newAssignment.id
      }
      
      setEvents(prevEvents => [...prevEvents, updatedEvent])
      
      // Also add to assignment reminders
      addAssignmentReminder(newAssignment)
    } else {
      setEvents(prevEvents => [...prevEvents, event])
    }
  }

  const handleEventDelete = (eventId) => {
    const event = events.find(e => e.id === eventId)
    
    // If it's an assignment event, also delete the assignment
    if (event && event.category === 'assignment' && event.assignmentId) {
      setAssignments(prev => prev.filter(assignment => assignment.id !== event.assignmentId))
      
      // Also delete from assignment reminders
      deleteAssignmentReminder(event.assignmentId)
    }
    
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
  }

  // Functions to sync with assignment reminders in the main dashboard
  const addAssignmentReminder = (assignment) => {
    const savedReminders = localStorage.getItem('assignmentReminders')
    let reminders = []
    
    if (savedReminders) {
      try {
        reminders = JSON.parse(savedReminders).map(reminder => ({
          ...reminder,
          dueDate: new Date(reminder.dueDate)
        }))
      } catch (error) {
        console.error('Error parsing assignment reminders:', error)
      }
    }
    
    // Check if a reminder already exists for this assignment
    const existingReminderIndex = reminders.findIndex(r => r.assignmentId === assignment.id)
    
    if (existingReminderIndex >= 0) {
      // Update existing reminder
      reminders[existingReminderIndex] = {
        ...reminders[existingReminderIndex],
        title: assignment.assignment,
        dueDate: new Date(assignment.dueDate),
        status: assignment.status,
        notes: assignment.notes || '',
        submitted: assignment.submitted || false,
        isUrgent: calculateDaysUntil(assignment.dueDate) === 'Tomorrow'
      }
    } else {
      // Create a new reminder
      const newReminder = {
        id: crypto.randomUUID(),
        assignmentId: assignment.id,
        title: assignment.assignment,
        dueDate: new Date(assignment.dueDate),
        status: assignment.status,
        notes: assignment.notes || '',
        submitted: assignment.submitted || false,
        isUrgent: calculateDaysUntil(assignment.dueDate) === 'Tomorrow'
      }
      reminders.push(newReminder)
    }
    
    localStorage.setItem('assignmentReminders', JSON.stringify(reminders))
  }

  const updateAssignmentReminder = (assignment) => {
    const savedReminders = localStorage.getItem('assignmentReminders')
    if (!savedReminders) return
    
    try {
      const reminders = JSON.parse(savedReminders).map(reminder => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate)
      }))
      
      const updatedReminders = reminders.map(reminder => 
        reminder.assignmentId === assignment.id ? {
          ...reminder,
          title: assignment.assignment,
          dueDate: new Date(assignment.dueDate),
          status: assignment.status,
          notes: assignment.notes || '',
          submitted: assignment.submitted || false,
          isUrgent: calculateDaysUntil(assignment.dueDate) === 'Tomorrow'
        } : reminder
      )
      
      localStorage.setItem('assignmentReminders', JSON.stringify(updatedReminders))
    } catch (error) {
      console.error('Error updating assignment reminder:', error)
    }
  }

  const deleteAssignmentReminder = (assignmentId) => {
    const savedReminders = localStorage.getItem('assignmentReminders')
    if (!savedReminders) return
    
    try {
      const reminders = JSON.parse(savedReminders).map(reminder => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate)
      }))
      
      const filteredReminders = reminders.filter(reminder => reminder.assignmentId !== assignmentId)
      
      localStorage.setItem('assignmentReminders', JSON.stringify(filteredReminders))
    } catch (error) {
      console.error('Error deleting assignment reminder:', error)
    }
  }

  // Sync assignments with calendar events
  useEffect(() => {
    // For each assignment, ensure there's a corresponding calendar event
    assignments.forEach(assignment => {
      const existingEvent = events.find(event => event.assignmentId === assignment.id)
      
      if (!existingEvent) {
        // Create a new event for this assignment
        const newEvent = {
          id: crypto.randomUUID(),
          assignmentId: assignment.id, // Reference to the assignment
          title: assignment.assignment,
          date: new Date(assignment.dueDate),
          category: 'assignment'
        }
        
        setEvents(prev => [...prev, newEvent])
      }
    })
  }, [assignments])

  // Sync assignments with assignment reminders in the main dashboard
  useEffect(() => {
    assignments.forEach(assignment => {
      addAssignmentReminder(assignment)
    })
  }, [])

  return (
    <div>
      <div>
        <Navbar />
        <header className='relative'>
          <GifContainer />
        </header>
        <HeaderContent title="Assignment Planner" />
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
            {/* Assignment Planner Content */}
            <div className='rounded-lg p-6 min-h-[600px]'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-[Libre_Baskerville] italic text-white'>
                  Assignment Planner
                </h2>
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
                    <FileText size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--accent-color)' }}>Plan your assignments here.</p>
                      <p className="text-gray-300 text-sm italic">To add a new assignment, click + New in Assignment Tracker Table and enter the name of assignment. Hover the cursor over the assignment name and click Open. Then select Assignment Template. Assignment planner template will pop up. From there you can plan your assignments in detail. Fill in all the properties. You will also see upcoming assignments in Assignment Calendar.</p>
                      <p className="text-gray-300 text-sm italic mt-2">You can delete this after reading.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment Tracker Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Assignment Tracker
                  </h3>
                </div>

                {/* Assignment Tracker Table */}
                <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2a2a2a]">
                        <tr>
                          <th className="text-left p-4 text-gray-300 font-medium">Assignment</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Due Date</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                          <th className="text-center p-4 text-gray-300 font-medium">Submitted</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Grade</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Notes</th>
                          <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map(assignment => {
                          const daysUntil = calculateDaysUntil(assignment.dueDate)
                          const isOverdue = assignment.dueDate < new Date() && assignment.status !== 'Submitted' && assignment.status !== 'Graded'
                          
                          return (
                            <tr key={assignment.id} className="border-t border-gray-700 hover:bg-[#2a2a2a]/50">
                              <td className="p-4">
                                {editingAssignment === assignment.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.assignment || ''}
                                    onChange={(e) => handleEditingValueChange('assignment', e.target.value)}
                                    className="w-full bg-transparent text-white border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Enter assignment name"
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-white font-medium">{assignment.assignment || 'Untitled'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {editingAssignment === assignment.id ? (
                                  <input
                                    type="date"
                                    value={editingValues.dueDate || ''}
                                    onChange={(e) => handleEditingValueChange('dueDate', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                  />
                                ) : (
                                  <div>
                                    <div className="text-gray-300">{assignment.dueDate.toLocaleDateString()}</div>
                                    <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
                                      {daysUntil}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                {editingAssignment === assignment.id ? (
                                  <select
                                    value={editingValues.status || 'Not started'}
                                    onChange={(e) => handleEditingValueChange('status', e.target.value)}
                                    className="w-full bg-[#2a2a2a] text-white border border-gray-600 rounded px-2 py-1 focus:border-accent outline-none"
                                  >
                                    {statusOptions.map(option => (
                                      <option key={option.value} value={option.value} className="bg-[#2a2a2a]">
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: getStatusColor(assignment.status) }}
                                    />
                                    <span className="text-gray-300">{assignment.status}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {editingAssignment === assignment.id ? (
                                  <input
                                    type="checkbox"
                                    checked={editingValues.submitted || false}
                                    onChange={(e) => handleEditingValueChange('submitted', e.target.checked)}
                                    className="w-4 h-4 rounded"
                                    style={{ accentColor: 'var(--accent-color)' }}
                                  />
                                ) : (
                                  <div className="flex justify-center">
                                    {assignment.submitted ? (
                                      <CheckSquare size={16} className="text-green-400" />
                                    ) : (
                                      <div className="w-4 h-4 border border-gray-500 rounded"></div>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                {editingAssignment === assignment.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.grade || ''}
                                    onChange={(e) => handleEditingValueChange('grade', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Grade"
                                  />
                                ) : (
                                  <span className="text-gray-300">{assignment.grade || '-'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {editingAssignment === assignment.id ? (
                                  <input
                                    type="text"
                                    value={editingValues.notes || ''}
                                    onChange={(e) => handleEditingValueChange('notes', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 border-b border-gray-600 focus:border-accent outline-none"
                                    placeholder="Notes"
                                  />
                                ) : (
                                  <span className="text-gray-300">{assignment.notes || '-'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  {editingAssignment === assignment.id ? (
                                    <>
                                      <button
                                        onClick={() => saveInlineEdit(assignment.id)}
                                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                                        title="Save"
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={cancelInlineEdit}
                                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                        title="Cancel"
                                      >
                                        ✕
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => startEditingAssignment(assignment)}
                                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {/* Add new row button */}
                        <tr>
                          <td colSpan="7" className="p-4">
                            <button
                              onClick={addNewAssignment}
                              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                            >
                              <Plus size={16} />
                              <span className="text-sm">New page</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Assignment Calendar Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-[Libre_Baskerville] italic text-white">
                    Assignment Calendar
                  </h3>
                </div>

                {/* Big Calendar Component */}
                <BigCalendar
                  events={events}
                  onAddEvent={handleEventAdd}
                  onDeleteEvent={handleEventDelete}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default AssignmentPlannerPage