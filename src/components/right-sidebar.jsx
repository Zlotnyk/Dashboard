import React, { useState, useEffect } from 'react'
import { Plus, X, Calendar, Clock, FileText, Flag, MapPin, AlertCircle } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const RightSidebar = () => {
  const [examReminders, setExamReminders] = useState([])
  const [assignmentReminders, setAssignmentReminders] = useState([])
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [examValidationErrors, setExamValidationErrors] = useState({})
  const [assignmentValidationErrors, setAssignmentValidationErrors] = useState({})
  const [examForm, setExamForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    notes: '',
    attended: false
  })
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    dueDate: '',
    status: 'Not started',
    notes: '',
    submitted: false
  })

  // Load data from localStorage
  useEffect(() => {
    const savedExamReminders = localStorage.getItem('examReminders')
    const savedAssignmentReminders = localStorage.getItem('assignmentReminders')
    
    if (savedExamReminders) {
      try {
        const parsedExamReminders = JSON.parse(savedExamReminders).map(reminder => ({
          ...reminder,
          date: new Date(reminder.date)
        }))
        setExamReminders(parsedExamReminders)
      } catch (error) {
        console.error('Error parsing exam reminders:', error)
      }
    }
    
    if (savedAssignmentReminders) {
      try {
        const parsedAssignmentReminders = JSON.parse(savedAssignmentReminders).map(reminder => ({
          ...reminder,
          dueDate: new Date(reminder.dueDate)
        }))
        setAssignmentReminders(parsedAssignmentReminders)
      } catch (error) {
        console.error('Error parsing assignment reminders:', error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (examReminders.length > 0) {
      localStorage.setItem('examReminders', JSON.stringify(examReminders))
    }
  }, [examReminders])

  useEffect(() => {
    if (assignmentReminders.length > 0) {
      localStorage.setItem('assignmentReminders', JSON.stringify(assignmentReminders))
    }
  }, [assignmentReminders])

  // Sync with exam preparation data - FIXED to prevent duplication
  useEffect(() => {
    const savedExams = localStorage.getItem('examPreparationData')
    
    if (savedExams) {
      try {
        const parsedExams = JSON.parse(savedExams).map(exam => ({
          ...exam,
          date: new Date(exam.date)
        }))
        
        // Create a map of existing reminders by examId for quick lookup
        const existingReminderMap = new Map()
        examReminders.forEach(reminder => {
          if (reminder.examId) {
            existingReminderMap.set(reminder.examId, reminder)
          }
        })
        
        // Track new reminders to add
        const newReminders = []
        
        // For each exam in the exam preparation data, ensure there's a corresponding reminder
        parsedExams.forEach(exam => {
          // Skip if we already have a reminder for this exam
          if (!existingReminderMap.has(exam.id)) {
            // Create a new reminder for this exam
            const newReminder = {
              id: crypto.randomUUID(),
              examId: exam.id,
              title: exam.exam,
              date: new Date(exam.date),
              time: exam.time || '',
              location: exam.location || '',
              notes: exam.notes || '',
              attended: false,
              isUrgent: calculateDaysUntil(exam.date) === 'Tomorrow'
            }
            
            newReminders.push(newReminder)
          }
        })
        
        // Only update state if we have new reminders to add
        if (newReminders.length > 0) {
          setExamReminders(prev => [...prev, ...newReminders])
        }
      } catch (error) {
        console.error('Error syncing with exam preparation data:', error)
      }
    }
  }, []) // Only run once on component mount

  const calculateDaysUntil = (date) => {
    const today = new Date()
    const targetDate = new Date(date)
    const diffTime = targetDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `${diffDays} days`
  }

  const validateExamForm = () => {
    const errors = {}
    
    if (!examForm.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!examForm.date) {
      errors.date = 'Date is required'
    }
    
    setExamValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateAssignmentForm = () => {
    const errors = {}
    
    if (!assignmentForm.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!assignmentForm.dueDate) {
      errors.dueDate = 'Due date is required'
    }
    
    setAssignmentValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleExamFormChange = (field, value) => {
    setExamForm(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field when user starts typing
    if (examValidationErrors[field]) {
      setExamValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAssignmentFormChange = (field, value) => {
    setAssignmentForm(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field when user starts typing
    if (assignmentValidationErrors[field]) {
      setAssignmentValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const addExamReminder = () => {
    setSelectedExam(null)
    setExamValidationErrors({})
    setExamForm({
      title: 'New page',
      date: '',
      time: '',
      location: '',
      notes: '',
      attended: false
    })
    setIsExamModalOpen(true)
  }

  const handleExamClick = (exam) => {
    setSelectedExam(exam)
    setExamValidationErrors({})
    setExamForm({
      title: exam.title,
      date: exam.date.toISOString().split('T')[0],
      time: exam.time,
      location: exam.location,
      notes: exam.notes,
      attended: exam.attended
    })
    setIsExamModalOpen(true)
  }

  const addAssignmentReminder = () => {
    setSelectedAssignment(null)
    setAssignmentValidationErrors({})
    setAssignmentForm({
      title: 'New page',
      dueDate: '',
      status: 'Not started',
      notes: '',
      submitted: false
    })
    setIsAssignmentModalOpen(true)
  }

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment)
    setAssignmentValidationErrors({})
    setAssignmentForm({
      title: assignment.title,
      dueDate: assignment.dueDate.toISOString().split('T')[0],
      status: assignment.status,
      notes: assignment.notes,
      submitted: assignment.submitted
    })
    setIsAssignmentModalOpen(true)
  }

  const handleSaveExam = () => {
    if (!validateExamForm()) {
      return
    }

    if (selectedExam) {
      // Update existing exam
      const updatedExam = {
        ...selectedExam,
        title: examForm.title,
        date: new Date(examForm.date),
        time: examForm.time,
        location: examForm.location,
        notes: examForm.notes,
        attended: examForm.attended,
        isUrgent: calculateDaysUntil(examForm.date) === 'Tomorrow'
      }
      setExamReminders(prev => prev.map(exam => 
        exam.id === selectedExam.id ? updatedExam : exam
      ))
    } else {
      // Create new exam
      const newReminder = {
        id: Date.now(),
        title: examForm.title,
        date: new Date(examForm.date),
        time: examForm.time,
        location: examForm.location,
        notes: examForm.notes,
        attended: examForm.attended,
        isUrgent: calculateDaysUntil(examForm.date) === 'Tomorrow'
      }
      setExamReminders(prev => [...prev, newReminder])
    }
    setIsExamModalOpen(false)
    setExamValidationErrors({})
  }

  const handleDeleteExam = () => {
    if (selectedExam) {
      setExamReminders(prev => prev.filter(exam => exam.id !== selectedExam.id))
      setIsExamModalOpen(false)
      setSelectedExam(null)
    }
  }

  const handleSaveAssignment = () => {
    if (!validateAssignmentForm()) {
      return
    }

    if (selectedAssignment) {
      // Update existing assignment
      const updatedAssignment = {
        ...selectedAssignment,
        title: assignmentForm.title,
        dueDate: new Date(assignmentForm.dueDate),
        status: assignmentForm.status,
        notes: assignmentForm.notes,
        submitted: assignmentForm.submitted,
        isUrgent: calculateDaysUntil(assignmentForm.dueDate) === 'Tomorrow'
      }
      setAssignmentReminders(prev => prev.map(assignment => 
        assignment.id === selectedAssignment.id ? updatedAssignment : assignment
      ))
    } else {
      // Create new assignment
      const newReminder = {
        id: Date.now(),
        title: assignmentForm.title,
        dueDate: new Date(assignmentForm.dueDate),
        status: assignmentForm.status,
        notes: assignmentForm.notes,
        submitted: assignmentForm.submitted,
        isUrgent: calculateDaysUntil(assignmentForm.dueDate) === 'Tomorrow'
      }
      setAssignmentReminders(prev => [...prev, newReminder])
    }
    setIsAssignmentModalOpen(false)
    setAssignmentValidationErrors({})
  }

  const handleDeleteAssignment = () => {
    if (selectedAssignment) {
      setAssignmentReminders(prev => prev.filter(assignment => assignment.id !== selectedAssignment.id))
      setIsAssignmentModalOpen(false)
      setSelectedAssignment(null)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Exam Reminder Section */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-[Libre_Baskerville] italic text-white">
              Exam Reminder
            </h3>
          </div>

          {/* Horizontal line under header */}
          <div className="w-full h-px bg-gray-700 mb-4"></div>

          <div className="space-y-3">
            {examReminders.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                No exam reminders
              </div>
            ) : (
              examReminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className="bg-[#2a2a2a] rounded-lg p-4 cursor-pointer hover:bg-[#333333] transition-colors"
                  onClick={() => handleExamClick(reminder)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {reminder.isUrgent && (
                      <span className="text-orange-500 text-sm">⚠️</span>
                    )}
                    <span className="text-white text-sm font-medium">
                      {reminder.title}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mb-1">
                    {reminder.date.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  {reminder.isUrgent && (
                    <div className="text-orange-500 text-xs font-medium">
                      {calculateDaysUntil(reminder.date)}
                    </div>
                  )}
                </div>
              ))
            )}

            <button
              onClick={addExamReminder}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm">New page</span>
            </button>
          </div>
        </div>

        {/* Assignment Reminder Section */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-[Libre_Baskerville] italic text-white">
              Assignment Reminder
            </h3>
          </div>

          {/* Horizontal line under header */}
          <div className="w-full h-px bg-gray-700 mb-4"></div>

          <div className="space-y-3">
            {assignmentReminders.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                No assignment reminders
              </div>
            ) : (
              assignmentReminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className="bg-[#2a2a2a] rounded-lg p-4 cursor-pointer hover:bg-[#333333] transition-colors"
                  onClick={() => handleAssignmentClick(reminder)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {reminder.isUrgent && (
                      <span className="text-orange-500 text-sm">⚠️</span>
                    )}
                    <span className="text-white text-sm font-medium">
                      {reminder.title}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mb-1">
                    Due: {reminder.dueDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Status: {reminder.status}
                  </div>
                  {reminder.isUrgent && (
                    <div className="text-orange-500 text-xs font-medium mt-1">
                      {calculateDaysUntil(reminder.dueDate)}
                    </div>
                  )}
                </div>
              ))
            )}

            <button
              onClick={addAssignmentReminder}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-solid border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm">New page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exam Reminder Modal */}
      <Dialog open={isExamModalOpen} onClose={setIsExamModalOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={examForm.title}
                      onChange={(e) => handleExamFormChange('title', e.target.value)}
                      className={`text-2xl font-medium bg-transparent border-none outline-none flex-1 w-full ${
                        examValidationErrors.title ? 'text-red-400' : 'text-white'
                      }`}
                      placeholder="New page"
                    />
                    {examValidationErrors.title && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{examValidationErrors.title}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsExamModalOpen(false)}
                    className="text-gray-400 hover:text-white ml-4"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Date Field */}
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Date</div>
                      <input
                        type="date"
                        value={examForm.date}
                        onChange={(e) => handleExamFormChange('date', e.target.value)}
                        className={`w-full bg-transparent text-base border-none outline-none cursor-pointer ${
                          examValidationErrors.date ? 'text-red-400' : 'text-white'
                        }`}
                      />
                      {examValidationErrors.date && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{examValidationErrors.date}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Field */}
                  <div className="flex items-center gap-4">
                    <Clock size={20} className="text-gray-400 flex-shrink-0 cursor-pointer" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Time</div>
                      <input
                        type="time"
                        value={examForm.time}
                        onChange={(e) => handleExamFormChange('time', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Location Field */}
                  <div className="flex items-center gap-4">
                    <MapPin size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Location</div>
                      <input
                        type="text"
                        value={examForm.location}
                        onChange={(e) => handleExamFormChange('location', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div className="flex items-start gap-4">
                    <FileText size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Notes</div>
                      <input
                        type="text"
                        value={examForm.notes}
                        onChange={(e) => handleExamFormChange('notes', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* When Exam Field */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-base">⚠️</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">When Exam</div>
                      <div className="text-gray-500 text-base">
                        {examForm.date ? calculateDaysUntil(examForm.date) : 'Невизначено'}
                      </div>
                    </div>
                  </div>

                  {/* Attended Checkbox */}
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={examForm.attended}
                        onChange={(e) => handleExamFormChange('attended', e.target.checked)}
                        className="w-4 h-4 text-gray-500 bg-gray-800 border-gray-600 rounded focus:ring-gray-500 accent-gray-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Attended</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with action buttons */}
              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex gap-3">
                  {selectedExam && (
                    <button
                      onClick={handleDeleteExam}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <button
                    onClick={() => setIsExamModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveExam}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Assignment Reminder Modal */}
      <Dialog open={isAssignmentModalOpen} onClose={setIsAssignmentModalOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={assignmentForm.title}
                      onChange={(e) => handleAssignmentFormChange('title', e.target.value)}
                      className={`text-2xl font-medium bg-transparent border-none outline-none flex-1 w-full ${
                        assignmentValidationErrors.title ? 'text-red-400' : 'text-white'
                      }`}
                      placeholder="New page"
                    />
                    {assignmentValidationErrors.title && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-400 text-sm">{assignmentValidationErrors.title}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsAssignmentModalOpen(false)}
                    className="text-gray-400 hover:text-white ml-4"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Due Date Field */}
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Due Date</div>
                      <input
                        type="date"
                        value={assignmentForm.dueDate}
                        onChange={(e) => handleAssignmentFormChange('dueDate', e.target.value)}
                        className={`w-full bg-transparent text-base border-none outline-none cursor-pointer ${
                          assignmentValidationErrors.dueDate ? 'text-red-400' : 'text-white'
                        }`}
                      />
                      {assignmentValidationErrors.dueDate && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <span className="text-red-400 text-sm">{assignmentValidationErrors.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Field */}
                  <div className="flex items-center gap-4">
                    <Flag size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Status</div>
                      <select
                        value={assignmentForm.status}
                        onChange={(e) => handleAssignmentFormChange('status', e.target.value)}
                        className="w-full bg-transparent text-white text-base border-none outline-none"
                      >
                        <option value="Not started" className="bg-[#1a1a1a]">Not started</option>
                        <option value="In progress" className="bg-[#1a1a1a]">In progress</option>
                        <option value="Completed" className="bg-[#1a1a1a]">Completed</option>
                        <option value="Submitted" className="bg-[#1a1a1a]">Submitted</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div className="flex items-start gap-4">
                    <FileText size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Notes</div>
                      <input
                        type="text"
                        value={assignmentForm.notes}
                        onChange={(e) => handleAssignmentFormChange('notes', e.target.value)}
                        placeholder="Empty"
                        className="w-full bg-transparent text-white text-base border-none outline-none placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* When Assignment Field */}
                  <div className="flex items-center gap-4">
                
                    <span className="text-gray-500 text-base">⚠️</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">When Assignment</div>
                      <div className="text-gray-500 text-base">
                        {assignmentForm.dueDate ? calculateDaysUntil(assignmentForm.dueDate) : 'Невизначено'}
                      </div>
                    </div>
                  </div>

                  {/* Submitted Checkbox */}
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={assignmentForm.submitted}
                        onChange={(e) => handleAssignmentFormChange('submitted', e.target.checked)}
                        className="w-4 h-4 text-gray-500 bg-gray-800 border-gray-600 rounded focus:ring-gray-500 accent-gray-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Submitted</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with action buttons */}
              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex gap-3">
                  {selectedAssignment && (
                    <button
                      onClick={handleDeleteAssignment}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <button
                    onClick={() => setIsAssignmentModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAssignment}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default RightSidebar