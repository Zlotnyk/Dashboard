import React from 'react'

const HeaderContent = ({ title = "Student Planner" }) => {
  const getQuote = (title) => {
    switch (title) {
      case "Lifestyle":
        return "Balance is not something you find, it's something you create."
      case "Health & Fitness":
        return "Take care of your body. It's the only place you have to live."
      default:
        return "Miracles happen everyday, change your perception of what a miracle is and you'll see them all around you."
    }
  }

  return (
    <div className="bg-[#1a1a1a] py-8">
      <div className="w-full">
        {/* Title and Quote Block - positioned parallel to wavy line */}
        <div className="flex flex-col items-start mb-6 pl-16">
          {/* Title - positioned slightly to the right */}
          <8 className="text-4xl font-bold text-white mb-4 font-[Libre_Baskerville]">
            {title}
          </h1>
          
          {/* Quote with left border - positioned parallel to wavy line */}
          <div className="flex items-start mb-6 -ml-4">
            <div className="w-0.5 h-8 mr-4 flex-shrink-0" style={{ backgroundColor: 'var(--accent-color)' }}></div>
            <blockquote className="text-lg italic text-white/90 font-[Libre_Baskerville] leading-relaxed">
              {getQuote(title)}
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderContent