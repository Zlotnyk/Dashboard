import React, { useState } from 'react'
import { Settings } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'

const Navbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false)

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
            className="px-4 py-2 bg-[#97e7aa] text-white rounded-lg hover:bg-[#75b384] transition-colors text-sm font-medium"
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

                <div className="space-y-4">
                  <div className="border-b border-gray-700 pb-4">
                    <h3 className="text-white font-medium mb-2">Theme</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="theme" value="dark" defaultChecked className="accent-[#97e7aa]" />
                        <span className="text-gray-300">Dark</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="theme" value="light" className="accent-[#97e7aa]" />
                        <span className="text-gray-300">Light</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-b border-gray-700 pb-4">
                    <h3 className="text-white font-medium mb-2">Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Exam reminders</span>
                        <input type="checkbox" defaultChecked className="accent-[#97e7aa]" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Assignment reminders</span>
                        <input type="checkbox" defaultChecked className="accent-[#97e7aa]" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Language</h3>
                    <select className="w-full bg-gray-800 border border-gray-600 rounded text-white p-2">
                      <option>English</option>
                      <option>Ukrainian</option>
                      <option>Spanish</option>
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
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 bg-[#97e7aa] text-white rounded-lg hover:bg-[#75b384] transition-colors text-sm"
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
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa] border-b border-gray-600"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa] border-b border-gray-600"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button className="w-full py-2 bg-[#97e7aa] text-white rounded-lg hover:bg-[#75b384] transition-colors font-medium">
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
                      className="text-[#97e7aa] hover:underline"
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
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa] border-b border-gray-600"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa] border-b border-gray-600"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa] border-b border-gray-600"
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#97e7aa] border-b border-gray-600"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button className="w-full py-2 bg-[#97e7aa] text-white rounded-lg hover:bg-[#75b384] transition-colors font-medium">
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
                      className="text-[#97e7aa] hover:underline"
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