import React from 'react'

const HeaderContent = () => {
  return (
    <div className="bg-[#1a1a1a] py-8">
      <div className="w-full">
        {/* Title and Quote Block - positioned parallel to wavy line */}
        <div className="flex flex-col items-start mb-6 pl-16">
          {/* Title - positioned slightly to the right */}
          <h1 className="text-4xl font-bold text-white mb-4 font-[Libre_Baskerville]">
            Student Planner
          </h1>
          
          {/* Quote with left border - positioned parallel to wavy line */}
          <div className="flex items-start mb-6 -ml-4">
            <div className="w-0.5 h-8 bg-[#97e7aa] mr-4 flex-shrink-0"></div>
            <blockquote className="text-lg italic text-white/90 font-[Libre_Baskerville] leading-relaxed">
              "Miracles happen everyday, change your perception of what a miracle is and you'll see them all around you."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderContent