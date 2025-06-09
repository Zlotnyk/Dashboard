import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Cake, X } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const UpcomingBirthdays = ({ events = [] }) => {
  const [birthdays, setBirthdays] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    
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
    setBirthdayForm({ name: '', birthDate: '' })
    setIsModalOpen(true)
  }

  const handleSaveBirthday = () => {
    if (!birthdayForm.name.trim() || !birthdayForm.birthDate) return

    const newBirthday = {
      id: crypto.randomUUID(),
      name: birthdayForm.name,
      birthDate: birthdayForm.birthDate
    }

    // Save to localStorage
    const savedBirthdays = JSON.parse(localStorage.getItem('manualBirthdays') || '[]')
    const updatedBirthdays = [...savedBirthdays, newBirthday]
    localStorage.setItem('manualBirthdays', JSON.stringify(updatedBirthdays))

    setIsModalOpen(false)
    setBirthdayForm({ name: '', birthDate: '' })

    // Trigger re-calculation
    const birthdayInfo = calculateBirthdayInfo(newBirthday.birthDate)
    if (birthdayInfo.daysUntil <= 30) {
      setBirthdays(prev => [...prev, {
        ...newBirthday,
        source: 'manual',
        ...birthdayInfo
      }].sort((a, b) => a.daysUntil - b.daysUntil))
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

  const formatDaysUntil = (days) => {
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow'
    return `${days} days`
  }

  return (
    <>
      <div className="w-full h-full bg-transparent rounded-lg p-4">
        {/* Header with golden text */}
        <div className="mb-4">
          <h3 className="text-lg font-[Libre_Baskerville] italic text-[#d4af37] mb-2">
            Upcoming Birthdays
          </h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar size={16} />
            <span>Next 30 Days</span>
          </div>
        </div>

        {/* Birthday list */}
        <div className="space-y-2">
          {birthdays.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">
              No upcoming birthdays in 30 days
            </div>
          ) : (
            birthdays.map(birthday => (
              <div 
                key={birthday.id}
                className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Cake size={16} className="text-gray-400" />
                  <div>
                    <div className="text-gray-300 text-sm">
                      {birthday.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Will be {birthday.nextAge} • {formatDaysUntil(birthday.daysUntil)}
                    </div>
                  </div>
                </div>
                
                {birthday.source === 'manual' && (
                  <button
                    onClick={() => handleDeleteBirthday(birthday)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                  >
                    <X size={12} className="text-white" />
                  </button>
                )}
              </div>
            ))
          )}

          {/* New page button */}
          <button
            onClick={handleAddBirthday}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">New page</span>
          </button>
        </div>
      </div>

      {/* Add Birthday Modal */}
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
                    Add Birthday
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
                    Add Birthday
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