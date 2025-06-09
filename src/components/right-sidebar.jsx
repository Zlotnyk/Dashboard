import React, { useState } from 'react'
import { Plus } from 'lucide-react'

const RightSidebar = () => {
  const [examReminders, setExamReminders] = useState([
    {
      id: 1,
      title: 'New page',
      date: 'June 10, 2025',
      isUrgent: true
    }
  ])

  const [assignmentReminders, setAssignmentReminders] = useState([])

  const addExamReminder = () => {
    const newReminder = {
      id: Date.now(),
      title: 'New page',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      isUrgent: false
    }
    setExamReminders(prev => [...prev, newReminder])
  }

  const addAssignmentReminder = () => {
    const newReminder = {
      id: Date.now(),
      title: 'New page',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      isUrgent: false
    }
    setAssignmentReminders(prev => [...prev, newReminder])
  }

  return (
    <div className="space-y-6">
      {/* Exam Reminder Section */}
      <div className="bg-[#1a1a1a] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-[Libre_Baskerville] italic text-[#d4af37]">
            Exam Reminder
          </h3>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>

        <div className="space-y-3">
          {examReminders.map(reminder => (
            <div key={reminder.id} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                {reminder.isUrgent && (
                  <span className="text-orange-500 text-sm">⚠️</span>
                )}
                <span className="text-white text-sm font-medium">
                  {reminder.title}
                </span>
              </div>
              <div className="text-gray-400 text-xs">
                {reminder.date}
              </div>
              {reminder.isUrgent && (
                <div className="text-orange-500 text-xs mt-1 font-medium">
                  Tomorrow.
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addExamReminder}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">New page</span>
          </button>
        </div>
      </div>

      {/* Assignment Reminder Section */}
      <div className="bg-[#1a1a1a] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-[Libre_Baskerville] italic text-[#d4af37]">
            Assignment Reminder
          </h3>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>

        <div className="space-y-3">
          {assignmentReminders.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No assignment reminders
            </div>
          ) : (
            assignmentReminders.map(reminder => (
              <div key={reminder.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  {reminder.isUrgent && (
                    <span className="text-orange-500 text-sm">⚠️</span>
                  )}
                  <span className="text-white text-sm font-medium">
                    {reminder.title}
                  </span>
                </div>
                <div className="text-gray-400 text-xs">
                  {reminder.date}
                </div>
              </div>
            ))
          )}

          <button
            onClick={addAssignmentReminder}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">New page</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RightSidebar