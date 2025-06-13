import React, { useState, useEffect } from 'react'
import { Settings, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoginModal from './auth/LoginModal'
import RegisterModal from './auth/RegisterModal'
import UserSettings from './settings/UserSettings'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
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

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
  }

  const switchToRegister = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(true)
  }

  const switchToLogin = () => {
    setIsRegisterOpen(false)
    setIsLoginOpen(true)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <>
      <nav className="w-full bg-[#1a1a1a] py-1 px-8 flex items-center justify-between">
        {/* Left side - DOOIT logo */}
        <div className="text-white text-2xl font-bold">
          DOOIT
        </div>
        
        {/* Right side - Auth buttons or user menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 user-menu-container">
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} />
                  )}
                  <span className="text-sm">{user?.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#2a2a2a] border border-gray-600 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsSettingsOpen(true)
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-left"
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                      <div className="border-t border-gray-600 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Settings icon for unregistered users */}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/30"
                title="Settings"
              >
                <Settings size={20} />
              </button>
              
              {/* Sign in button */}
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-6 py-2 bg-transparent border border-gray-600 text-white rounded-lg hover:border-gray-400 hover:bg-gray-800/30 transition-colors text-sm font-medium"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Modal - Only for unregistered users */}
      {!isAuthenticated && (
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
      )}

      {/* User Settings Modal - Only for registered users */}
      {isAuthenticated && (
        <UserSettings 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {/* Auth Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  )
}

export default Navbar