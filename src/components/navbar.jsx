import React, { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'

const Navbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false)
  const [accentColor, setAccentColor] = useState('#97e7aa')
  const [backgroundGif, setBackgroundGif] = useState('Green.gif')
  const [language, setLanguage] = useState('English')
  const [notifications, setNotifications] = useState({
    examReminders: true,
    assignmentReminders: true
  })

  const colorOptions = [
    { name: 'Green', value: '#97e7aa', gif: 'Green.gif' },
    { name: 'Purple', value: '#a855f7', gif: 'Purple.gif' },
    { name: 'Blue', value: '#3b82f6', gif: 'Blue.gif' },
    { name: 'Red', value: '#ef4444', gif: 'Red.gif' },
    { name: 'Orange', value: '#f97316', gif: 'Orange.gif' },
    { name: 'Pink', value: '#ec4899', gif: 'Pink.gif' }
  ]

  // Set CSS variable and notify other components about theme change
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)
    // Dispatch custom event to notify GifContainer about the change
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { accentColor, backgroundGif } 
    }))
  }, [accentColor, backgroundGif])

  const handleColorChange = (color) => {
    const selectedOption = colorOptions.find(option => option.value === color)
    if (selectedOption) {
      setAccentColor(color)
      setBackgroundGif(selectedOption.gif)
    }
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('accentColor', accentColor)
    localStorage.setItem('backgroundGif', backgroundGif)
    localStorage.setItem('language', language)
    localStorage.setItem('notifications', JSON.stringify(notifications))
    setIsSettingsOpen(false)
  }

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedAccentColor = localStorage.getItem('accentColor')
    const savedBackgroundGif = localStorage.getItem('backgroundGif')
    const savedLanguage = localStorage.getItem('language')
    const savedNotifications = localStorage.getItem('notifications')

    if (savedAccentColor) {
      setAccentColor(savedAccentColor)
      // Find corresponding GIF for saved color
      const savedOption = colorOptions.find(option => option.value === savedAccentColor)
      if (savedOption) {
        setBackgroundGif(savedOption.gif)
      }
    }
    if (savedBackgroundGif) setBackgroundGif(savedBackgroundGif)
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
  }, [])

  return (
    <>
      <nav className="w-full bg-[#1a1a1a] py-1 px-8 flex items-center justify-between">
        {/* Left side - DOOIT logo */}
        <div className="text-white text-2xl font-bold">
          DOOIT
        </div>
        
        {/* Right side - Settings icon and buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setIsGetStartedOpen(true)}
            className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors text-sm font-medium"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Get started
          </button>
          <button 
            onClick={() => setIsSignInOpen(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onClose={setIsSettingsOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-xl bg-[#1a1a1a] border border-gray-700 text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    Settings
                  </DialogTitle>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Theme Section */}
                  <div className="border-b border-gray-700 pb-4">
                    <h3 className="text-white font-medium mb-3">Theme</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="theme" 
                          value="dark" 
                          checked={true}
                          readOnly
                          style={{ accentColor: 'var(--accent-color)' }}
                        />
                        <span className="text-gray-300">Dark</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="theme" 
                          value="light" 
                          disabled
                          className="opacity-50"
                          style={{ accentColor: 'var(--accent-color)' }}
                        />
                        <span className="text-gray-500">Light (in development)</span>
                      </label>
                    </div>
                  </div>

                  {/* Accent Color Section */}
                  <div className="border-b border-gray-700 pb-4">
                    <h3 className="text-white font-medium mb-3">Accent Color & Background</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange(color.value)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all hover:scale-105 ${
                            accentColor === color.value 
                              ? 'border-white bg-gray-800 shadow-lg' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div 
                            className="w-4 h-4 rounded-full shadow-inner"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-gray-300 text-sm">{color.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                      Current background: {backgroundGif}
                    </div>
                  </div>

                  {/* Notifications Section */}
                  <div className="border-b border-gray-700 pb-4">
                    <h3 className="text-white font-medium mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Exam reminders</span>
                        <input 
                          type="checkbox" 
                          checked={notifications.examReminders}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            examReminders: e.target.checked
                          }))}
                          className="w-5 h-5 rounded"
                          style={{ accentColor: 'var(--accent-color)' }}
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Assignment reminders</span>
                        <input 
                          type="checkbox" 
                          checked={notifications.assignmentReminders}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            assignmentReminders: e.target.checked
                          }))}
                          className="w-5 h-5 rounded"
                          style={{ accentColor: 'var(--accent-color)' }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Language Section */}
                  <div>
                    <h3 className="text-white font-medium mb-3">Language</h3>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Ukrainian">Ukrainian (в розробці)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-700">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors text-sm"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Sign In Modal */}
      <Dialog open={isSignInOpen} onClose={setIsSignInOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-xl bg-[#1a1a1a] border border-gray-700 text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    Sign In
                  </DialogTitle>
                  <button
                    onClick={() => setIsSignInOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] border-b-2 border-gray-600 focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] border-b-2 border-gray-600 focus:border-transparent transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button 
                    className="w-full py-3 text-white rounded-lg hover:opacity-80 transition-colors font-medium mt-6"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    Sign In
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[#1a1a1a] text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button className="w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <span className="text-xl font-bold">f</span>
                    </button>
                    <button className="w-12 h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                      <span className="text-xl font-bold">G</span>
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-400 mt-4">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => {
                        setIsSignInOpen(false)
                        setIsGetStartedOpen(true)
                      }}
                      className="hover:underline transition-colors"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Get Started Modal */}
      <Dialog open={isGetStartedOpen} onClose={setIsGetStartedOpen} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-xl bg-[#1a1a1a] border border-gray-700 text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    Get Started
                  </DialogTitle>
                  <button
                    onClick={() => setIsGetStartedOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] border-b-2 border-gray-600 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] border-b-2 border-gray-600 focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] border-b-2 border-gray-600 focus:border-transparent transition-colors"
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] border-b-2 border-gray-600 focus:border-transparent transition-colors"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button 
                    className="w-full py-3 text-white rounded-lg hover:opacity-80 transition-colors font-medium mt-6"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    Create Account
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[#1a1a1a] text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button className="w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <span className="text-xl font-bold">f</span>
                    </button>
                    <button className="w-12 h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                      <span className="text-xl font-bold">G</span>
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-400 mt-4">
                    Already have an account?{' '}
                    <button 
                      onClick={() => {
                        setIsGetStartedOpen(false)
                        setIsSignInOpen(true)
                      }}
                      className="hover:underline transition-colors"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default Navbar