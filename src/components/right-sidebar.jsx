import React, { useState } from 'react'
import { Plus, X, Calendar, Clock, FileText, Flag } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const RightSidebar = () => {
  const [examReminders, setExamReminders] = useState([
    {
      id: 1,
      title: 'New page',
      date: new Date('2025-06-10'),
      time: '',
      location: '',
      targetGrade: '',
      notes: '',
      isUrgent: true
    }
  ])

  const [assignmentReminders, setAssignmentReminders] = useState([])
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [examForm, setExamForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    targetGrade: '',
    notes: ''
  })
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    dueDate: '',
    status: 'Not started',
    grade: '',
    notes: '',
    submitted: false
  })

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

  const addExamReminder = () => {
    setExamForm({
      title: '',
      date: '',
      time: '',
      location: '',
      targetGrade: '',
      notes: ''
    })
    setIsExamModalOpen(true)
  }

  const addAssignmentReminder = () => {
    setAssignmentForm({
      title: '',
      dueDate: '',
      status: 'Not started',
      grade: '',
      notes: '',
      submitted: false
    })
    setIsAssignmentModalOpen(true)
  }

  const handleSaveExam = () => {
    if (!examForm.title.trim() || !examForm.date) return

    const newReminder = {
      id: Date.now(),
      title: examForm.title,
      date: new Date(examForm.date),
      time: examForm.time,
      location: examForm.location,
      targetGrade: examForm.targetGrade,
      notes: examForm.notes,
      isUrgent: calculateDaysUntil(examForm.date) === 'Tomorrow'
    }
    setExamReminders(prev => [...prev, newReminder])
    setIsExamModalOpen(false)
  }

  const handleSaveAssignment = () => {
    if (!assignmentForm.title.trim() || !assignmentForm.dueDate) return

    const newReminder = {
      id: Date.now(),
      title: assignmentForm.title,
      dueDate: new Date(assignmentForm.dueDate),
      status: assignmentForm.status,
      grade: assignmentForm.grade,
      notes: assignmentForm.notes,
      submitted: assignmentForm.submitted,
      isUrgent: calculateDaysUntil(assignmentForm.dueDate) === 'Tomorrow'
    }
    setAssignmentReminders(prev => [...prev, newReminder])
    setIsAssignmentModalOpen(false)
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

          <div className="space-y-3">
            {examReminders.map(reminder => (
              <div key={reminder.id} className="bg-gray-800/50 rounded-lg p-4">
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
                    {calculateDaysUntil(reminder.date)}.
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addExamReminder}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
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

          <div className="space-y-3">
            {assignmentReminders.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                No assignment reminders
              </div>
            ) : (
              assignmentReminders.map(reminder => (
                <div key={reminder.id} className="bg-gray-800/50 rounded-lg p-4">
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
                      {calculateDaysUntil(reminder.dueDate)}.
                    </div>
                  )}
                </div>
              ))
            )}

            <button
              onClick={addAssignmentReminder}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm">New page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exam Reminder Modal */}
      <Dialog open={isExamModalOpen} onClose={setIsExamModalOpen} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar size={20} className="text-[#97e7aa]" />
                    Exam Reminder
                  </DialogTitle>
                  <button
                    onClick={() => setIsExamModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Calendar size={16} />
                      Date
                    </label>
                    <input
                      type="date"
                      value={examForm.date}
                      onChange={(e) => setExamForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                    />
                    {examForm.date && (
                      <div className="mt-1 text-xs text-orange-500 flex items-center gap-1">
                        ⚠️ {calculateDaysUntil(examForm.date)}.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Clock size={16} />
                      Time
                    </label>
                    <input
                      type="time"
                      value={examForm.time}
                      onChange={(e) => setExamForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <FileText size={16} />
                      Location
                    </label>
                    <input
                      type="text"
                      value={examForm.location}
                      onChange={(e) => setExamForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                      placeholder="Empty"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Flag size={16} />
                      Target Grade
                    </label>
                    <input
                      type="text"
                      value={examForm.targetGrade}
                      onChange={(e) => setExamForm(prev => ({ ...prev, targetGrade: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                      placeholder="Empty"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <FileText size={16} />
                      Notes
                    </label>
                    <textarea
                      value={examForm.notes}
                      onChange={(e) => setExamForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa] resize-none"
                      rows={3}
                      placeholder="Empty"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 flex flex-row-reverse gap-3">
                <button
                  onClick={handleSaveExam}
                  className="px-4 py-2 bg-[#97e7aa] text-white rounded hover:bg-[#75b384] transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Assignment Reminder Modal */}
      <Dialog open={isAssignmentModalOpen} onClose={setIsAssignmentModalOpen} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText size={20} className="text-[#97e7aa]" />
                    Assignment Reminder
                  </DialogTitle>
                  <button
                    onClick={() => setIsAssignmentModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Calendar size={16} />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                    />
                    {assignmentForm.dueDate && (
                      <div className="mt-1 text-xs text-orange-500 flex items-center gap-1">
                        ⚠️ {calculateDaysUntil(assignmentForm.dueDate)}.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Flag size={16} />
                      Status
                    </label>
                    <select
                      value={assignmentForm.status}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                    >
                      <option value="Not started">Not started</option>
                      <option value="In progress">In progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Submitted">Submitted</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Flag size={16} />
                      Grade
                    </label>
                    <input
                      type="text"
                      value={assignmentForm.grade}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa]"
                      placeholder="Empty"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <FileText size={16} />
                      Notes
                    </label>
                    <textarea
                      value={assignmentForm.notes}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa] resize-none"
                      rows={3}
                      placeholder="Empty"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="submitted"
                      checked={assignmentForm.submitted}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, submitted: e.target.checked }))}
                      className="w-4 h-4 text-[#97e7aa] bg-gray-800 border-gray-600 rounded focus:ring-[#97e7aa]"
                    />
                    <label htmlFor="submitted" className="text-sm text-gray-300">
                      Submitted
                    </label>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 flex flex-row-reverse gap-3">
                <button
                  onClick={handleSaveAssignment}
                  className="px-4 py-2 bg-[#97e7aa] text-white rounded hover:bg-[#75b384] transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default RightSidebar