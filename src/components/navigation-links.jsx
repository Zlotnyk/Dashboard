import React from 'react'
import { Heart, Activity, Brain, Target, DollarSign } from 'lucide-react'

const NavigationLinks = () => {
  const navigationLinks = [
    { name: 'Lifestyle', icon: Heart, href: '/lifestyle' },
    { name: 'Health & Fitness', icon: Activity, href: '/health-fitness' },
    { name: 'Wellness', icon: Brain, href: '/wellness' },
    { name: 'Productivity', icon: Target, href: '/productivity' },
    { name: 'Finance', icon: DollarSign, href: '/finance' }
  ]

  const handleNavigation = (href) => {
    if (href === '/lifestyle') {
      // For now, we'll just show an alert. In a real app, this would use React Router
      window.location.href = '/lifestyle.html'
    } else {
      alert(`Navigation to ${href} - Coming soon!`)
    }
  }

  return (
    <div className="bg-[#1a1a1a] py-4">
      <div className="max-w-7xl mx-auto px-8">
        {/* Navigation links - centered with space between and larger text */}
        <div className="flex items-center justify-between text-base text-white/80 max-w-4xl mx-auto">
          {navigationLinks.map((link, index) => {
            const IconComponent = link.icon
            return (
              <button 
                key={index} 
                onClick={() => handleNavigation(link.href)}
                className="flex items-center gap-2 hover:text-[#97e7aa] transition-colors text-base"
              >
                <IconComponent size={18} className="text-[#97e7aa]" />
                {link.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default NavigationLinks