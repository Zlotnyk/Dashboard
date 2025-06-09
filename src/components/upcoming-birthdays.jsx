import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Cake, X, Settings, Trash2, Edit } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const UpcomingBirthdays = ({ events = [] }) => {
  const [birthdays, setBirthdays] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedBirthday, setSelectedBirthday] = useState(null)
  const [birthdayForm, setBirthdayForm] = useState({
    name: '',
    birthDate: ''
  })

  // Calculate age and days until birthday
  const calculateBirthdayInfo = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    const currentYear = today.getFullYear()
    
    // Calculate current age
    let age = currentYear - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    // Calculate next birthday
    const nextBirthday = new Date(currentYear, birth.getMonth(), birth.getDate())
    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1)
    }

    // Calculate days until next birthday
    const timeDiff = nextBirthday - today
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    // Calculate age they will be
    const ageNextBirthday = nextBirthday.getFullYear() - birth.getFullYear()

    return {
      currentAge: age,
      daysUntil: daysUntil,
      nextAge: ageNextBirthday,
      nextBirthday: nextBirthday
    }
  }

  // Filter birthdays from calendar events and manual entries
  useEffect(() => {
    // Get birthday events from calendar (within 30 days)
    const today = new Date()
    
    const calendarBirthdays = events
      .filter(event => event.category === 'birthday')
      .map(event => {
        const birthdayInfo = calculateBirthdayInfo(event.date)
        return {
          id: event.id,
          name: event.title,
          birthDate: event.date,
          source: 'calendar',
          ...birthdayInfo
        }
      })
      .filter(birthday => birthday.daysUntil <= 30)

    // Get manual birthdays from localStorage
    const savedBirthdays = JSON.parse(localStorage.getItem('manualBirthdays') || '[]')
    const manualBirthdays = savedBirthdays
      .map(birthday => {
        const birthdayInfo = calculateBirthdayInfo(birthday.birthDate)
        return {
          ...birthday,
          source: 'manual',
          ...birthdayInfo
        }
      })
      .filter(birthday => birthday.daysUntil <= 30)

    // Combine and sort by days until birthday
    const allBirthdays = [...calendarBirthdays, ...manualBirthdays]
      .sort((a, b) => a.daysUntil - b.daysUntil)

    setBirthdays(allBirthdays)
  }, [events])

  const handleAddBirthday = () => {
    setSelectedBirthday(null)
    setBirthdayForm({ name: '', birthDate: '' })
    setIsModalOpen(true)
  }

  const handleEditBirthday = (birthday) => {
    setSelectedBirthday(birthday)
    setBirthdayForm({
      name: birthday.name,
      birthDate: typeof birthday.birthDate === 'string' ? birthday.birthDate : birthday.birthDate.toISOString().split('T')[0]
    })
    setIsModalOpen(true)
  }

  const handleSaveBirthday = () => {
    if (!birthdayForm.name.trim() || !birthdayForm.birthDate) return

    const savedBirthdays = JSON.parse(localStorage.getItem('manualBirthdays') || '[]')

    if (selectedBirthday) {
      // Update existing birthday
      const updatedBirthdays = savedBirthdays.map(birthday => 
        birthday.id === selectedBirthday.id 
          ? { ...birthday, name: birthdayForm.name, birthDate: birthdayForm.birthDate }
          : birthday
      )
      localStorage.setItem('manualBirthdays', JSON.stringify(updatedBirthdays))
    } else {
      // Add new birthday
      const newBirthday = {
        id: crypto.randomUUID(),
        name: birthdayForm.name,
        birthDate: birthdayForm.birthDate
      }
      const updatedBirthdays = [...savedBirthdays, newBirthday]
      localStorage.setItem('manualBirthdays', JSON.stringify(updatedBirthdays))
    }

    setIsModalOpen(false)
    setBirthdayForm({ name: '', birthDate: '' })
    setSelectedBirthday(null)

    // Trigger re-calculation
    const birthdayInfo = calculateBirthdayInfo(birthdayForm.birthDate)
    if (birthdayInfo.daysUntil <= 30) {
      if (selectedBirthday) {
        // Update existing birthday in state
        setBirthdays(prev => prev.map(birthday => 
          birthday.id === selectedBirthday.id 
            ? { ...birthday, name: birthdayForm.name, birthDate: birthdayForm.birthDate, ...birthdayInfo }
            : birthday
        ).sort((a, b) => a.daysUntil - b.daysUntil))
      } else {
        // Add new birthday to state
        setBirthdays(prev => [...prev, {
          id: crypto.randomUUID(),
          name: birthdayForm.name,
          birthDate: birthdayForm.birthDate,
          source: 'manual',
          ...birthdayInfo
        }].sort((a, b) => a.daysUntil - b.daysUntil))
      }
    }
  }

  const handleDeleteBirthday = (birthday) => {
    if (birthday.source === 'manual') {
      const savedBirthdays = JSON.parse(localStorage.getItem('manualBirthdays') || '[]')
      const updatedBirthdays = savedBirthdays.filter(b => b.id !== birthday.id)
      localStorage.setItem('manualBirthdays', JSON.stringify(updatedBirthdays))
      setBirthdays(prev => prev.filter(b => b.id !== birthday.id))
    }
  }

  const handleDeleteAllBirthdays = () => {
    localStorage.removeItem('manualBirthdays')
    setBirthdays(prev => prev.filter(birthday => birthday.source === 'calendar'))
    setIsSettingsOpen(false)
  }

  const formatDaysUntil = (days) => {
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow'
    return `${days} days`
  }

  return (
    <>
      <div className="w-full h-full bg-[#1a1a1a] rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-[Libre_Baskerville] italic text-white">
            Upcoming Birthdays
          </h3>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Horizontal line under header */}
        <div className="w-full h-px bg-gray-700 mb-4"></div>

        {/* Subtitle */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Calendar size={16} />
          <span>Next 30 Days</span>
        </div>

        {/* Birthday list */}
        <div className="space-y-2">
          {birthdays.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No upcoming birthdays
            </div>
          ) : (
            birthdays.map(birthday => (
              <div 
                key={birthday.id}
                className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cake size={16} className="text-gray-400" />
                    <div>
                      <div className="text-white text-sm font-medium">
                        {birthday.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Will be {birthday.nextAge} • {formatDaysUntil(birthday.daysUntil)}
                      </div>
                    </div>
                  </div>
                  
                  {birthday.source === 'manual' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditBirthday(birthday)}
                        className="p-1 hover:bg-blue-600 rounded transition-all"
                        title="Edit"
                      >
                        <Edit size={12} className="text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteBirthday(birthday)}
                        className="p-1 hover:bg-red-600 rounded transition-all"
                        title="Delete"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* New page button */}
          <button
            onClick={handleAddBirthday}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">New page</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Birthday Modal */}
      <Dialog open={isModalOpen} onClose={setIsModalOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    {selectedBirthday ? 'Edit Birthday' : 'Add Birthday'}
                  </DialogTitle>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={birthdayForm.name}
                      onChange={(e) => setBirthdayForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Enter person's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Birth Date</label>
                    <input
                      type="date"
                      value={birthdayForm.birthDate}
                      onChange={(e) => setBirthdayForm(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>

                  {birthdayForm.birthDate && (
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-300">
                        {(() => {
                          const info = calculateBirthdayInfo(birthdayForm.birthDate)
                          return (
                            <div>
                              <div>Current age: {info.currentAge} years</div>
                              <div>Next birthday: {formatDaysUntil(info.daysUntil)}</div>
                              <div>Will turn: {info.nextAge} years</div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBirthday}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors text-sm"
                  >
                    {selectedBirthday ? 'Update' : 'Add'} Birthday
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onClose={setIsSettingsOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    Birthday Settings
                  </DialogTitle>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Statistics */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Statistics</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Total birthdays:</span>
                        <span>{birthdays.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>From calendar:</span>
                        <span>{birthdays.filter(b => b.source === 'calendar').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Manual entries:</span>
                        <span>{birthdays.filter(b => b.source === 'manual').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This week:</span>
                        <span>{birthdays.filter(b => b.daysUntil <= 7).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Actions</h4>
                    
                    <button
                      onClick={handleDeleteAllBirthdays}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete All Manual Birthdays
                    </button>
                    
                    <div className="text-xs text-gray-400 text-center">
                      This will only delete manually added birthdays, not calendar events
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <div className="text-sm text-gray-300">
                      <div className="font-medium text-blue-400 mb-2">How it works:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Birthdays from calendar events automatically appear here</li>
                        <li>• Manual birthdays are stored locally on your device</li>
                        <li>• Only birthdays within 30 days are shown</li>
                        <li>• Calendar birthdays repeat yearly automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Close
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

export default UpcomingBirthdays