import React from 'react'

const Navbar = () => {
  return (
    <nav className="w-full bg-[#1a1a1a] py-3 px-8 flex items-center justify-between">
      {/* Left side - dooit logo */}
      <div className="text-white text-2xl font-bold">
        dooit
      </div>
      
      {/* Right side - buttons */}
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-[#97e7aa] text-white rounded-lg hover:bg-[#75b384] transition-colors text-sm font-medium">
          Get started
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
          Sign in
        </button>
      </div>
    </nav>
  )
}

export default Navbar