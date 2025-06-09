import React, { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'

const Navbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [accentColor, setAccentColor] = useState('#97e7aa')
  const [language, setLanguage] = useState('English')
  const [notifications, setNotifications] = useState({
    examReminders: true,
    assignmentReminders: true
  })

  const colorOptions = [
    { name: 'Green', value: '#97e7aa' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' }
  ]

  // Apply theme changes to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.style.setProperty('--bg-primary', '#ffffff')
      document.documentElement.style.setProperty('--bg-secondary', '#f8fafc')
      document.documentElement.style.setProperty('--text-primary', '#1f2937')
      document.documentElement.style.setProperty('--text-secondary', '#6b7280')
      document.documentElement.style.setProperty('--border-color', '#e5e7eb')
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#1f2937'
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#1a1a1a')
      document.documentElement.style.setProperty('--bg-secondary', '#0a0a0a')
      document.documentElement.style.setProperty('--text-primary', '#ffffff')
      document.documentElement.style.setProperty('--text-secondary', '#e0e0e0')
      document.documentElement.style.setProperty('--border-color', '#374151')
      document.body.style.backgroundColor = 'hsl(0, 0%, 10%)'
      document.body.style.color = '#ffffff'
    }
  }, [theme])

  // Apply accent color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)
    // Update CSS custom properties for accent color
    const style = document.createElement('style')
    style.textContent = `
      .bg-accent { background-color: ${accentColor} !important; }
      .text-accent { color: ${accentColor} !important; }
      .border-accent { border-color: ${accentColor} !important; }
      .accent-color { accent-color: ${accentColor} !important; }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [accentColor])

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('theme', theme)
    localStorage.setItem('accentColor', accentColor)
    localStorage.setItem('language', language)
    localStorage.setItem('notifications', JSON.stringify(notifications))
    setIsSettingsOpen(false)
  }

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const savedAccentColor = localStorage.getItem('accentColor')
    const savedLanguage = localStorage.getItem('language')
    const savedNotifications = localStorage.getItem('notifications')

    if (savedTheme) setTheme(savedTheme)
    if (savedAccentColor) setAccentColor(savedAccentColor)
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
            className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-80 transition-colors text-sm font-medium"
            style={{ backgroundColor: accentColor }}
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
          className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel 
              transition
              className="relative transform overflow-hidden rounded-lg bg-[#1a1a1a] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-xl font-semibold text-white">
                    Settings
                  </DialogTitle>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-gray-400 hover:text-white"
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
                          checked={theme === 'dark'}
                          onChange={(e) => setTheme(e.target.value)}
                          className="accent-color"
                          style={{ accentColor }}
                        />
                        <span className="text-gray-300">Dark</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="theme" 
                          value="light" 
                          checked={theme === 'light'}
                          onChange={(e) => setTheme(e.target.value)}
                          className="accent-color"
                          style={{ accentColor }}
                        />
                        <span className="text-gray-300">Light</span>
                      </label>
                    </div>
                  </div>

                  {/* Accent Color Section */}
                  <div className="border-b border-gray-700 pb-4">
                    <h3 className="text-white font-medium mb-3">Accent Color</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setAccentColor(color.value)}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                            accentColor === color.value 
                              ? 'border-white bg-gray-800' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-gray-300 text-sm">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notifications Section */}
                  <div className="border-b border-gray-700 pb-4">
                    <h3 className="text-white font-medium mb-3">Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Exam reminders</span>
                        <input 
                          type="checkbox" 
                          checked={notifications.examReminders}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            examReminders: e.target.checked
                          }))}
                          className="accent-color"
                          style={{ accentColor }}
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
                          className="accent-color"
                          style={{ accentColor }}
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
                      className="w-full bg-gray-800 border border-gray-600 rounded text-white p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      style={{ '--tw-ring-color': accentColor }}
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
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-80 transition-colors text-sm"
                    style={{ backgroundColor: accentColor }}
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
                    Sign In
                  </DialogTitle>
                  <button
                    onClick={() => setIsSignInOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-accent border-b border-gray-600"
                      style={{ '--tw-ring-color': accentColor }}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-accent border-b border-gray-600"
                      style={{ '--tw-ring-color': accentColor }}
                      placeholder="Enter your password"
                    />
                  </div>

                  <button 
                    className="w-full py-2 bg-accent text-white rounded-lg hover:opacity-80 transition-colors font-medium"
                    style={{ backgroundColor: accentColor }}
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
                      <span className="text-xl">f</span>
                    </button>
                    <button className="w-12 h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                      <span className="text-xl">G</span>
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-400 mt-4">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => {
                        setIsSignInOpen(false)
                        setIsGetStartedOpen(true)
                      }}
                      className="text-accent hover:underline"
                      style={{ color: accentColor }}
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
                    Get Started
                  </DialogTitle>
                  <button
                    onClick={() => setIsGetStartedOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-accent border-b border-gray-600"
                      style={{ '--tw-ring-color': accentColor }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-accent border-b border-gray-600"
                      style={{ '--tw-ring-color': accentColor }}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-accent border-b border-gray-600"
                      style={{ '--tw-ring-color': accentColor }}
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-accent border-b border-gray-600"
                      style={{ '--tw-ring-color': accentColor }}
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button 
                    className="w-full py-2 bg-accent text-white rounded-lg hover:opacity-80 transition-colors font-medium"
                    style={{ backgroundColor: accentColor }}
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
                      <span className="text-xl">f</span>
                    </button>
                    <button className="w-12 h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                      <span className="text-xl">G</span>
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-400 mt-4">
                    Already have an account?{' '}
                    <button 
                      onClick={() => {
                        setIsGetStartedOpen(false)
                        setIsSignInOpen(true)
                      }}
                      className="text-accent hover:underline"
                      style={{ color: accentColor }}
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