import React from 'react'
import { Heart, Activity, Brain, Target, DollarSign } from 'lucide-react'

const NavigationLinks = () => {
  const navigationLinks = [
    { name: 'Lifestyle', icon: Heart },
    { name: 'Health & Fitness', icon: Activity },
    { name: 'Wellness', icon: Brain },
    { name: 'Productivity', icon: Target },
    { name: 'Finance', icon: DollarSign }
  ]

  return (
    <div className="bg-[#1a1a1a] py-4">
      <div className="max-w-7xl mx-auto px-8">
        {/* Navigation links - centered with space between and larger text */}
        <div className="flex items-center justify-between text-base text-white/80 max-w-4xl mx-auto">
          {navigationLinks.map((link, index) => {
            const IconComponent = link.icon
            return (
              <a key={index} href="#" className="flex items-center gap-2 hover:text-[#97e7aa] transition-colors text-base">
                <IconComponent size={18} className="text-[#97e7aa]" />
                {link.name}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default NavigationLinks