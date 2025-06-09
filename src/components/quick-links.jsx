import React from 'react'
import { BookOpen, FileText, PenTool, Target, Clock, Users } from 'lucide-react'

const QuickLinks = () => {
  const links = [
    {
      title: 'Course',
      items: [
        { name: 'Timetable', icon: Clock },
        { name: 'Course Materials', icon: BookOpen },
        { name: 'Study Checklist', icon: Target }
      ]
    },
    {
      title: 'Assignments',
      items: [
        { name: 'Assignment Planner', icon: FileText },
        { name: 'Study Notebook', icon: BookOpen },
        { name: 'Important Concepts', icon: Target }
      ]
    },
    {
      title: 'Projects',
      items: [
        { name: 'Project Planner', icon: Target },
        { name: 'Group Projects', icon: Users }
      ]
    },
    {
      title: 'Writing',
      items: [
        { name: 'Essay Planner', icon: PenTool }
      ]
    },
    {
      title: 'Exams',
      items: [
        { name: 'Exam Preparation', icon: Target },
        { name: 'Exam Reflection', icon: FileText }
      ]
    }
  ]

  return (
    <div className="w-full bg-[#1a1a1a] rounded-lg p-4">
      <div className="space-y-6">
        {links.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-white text-base font-medium mb-3 font-[Libre_Baskerville]">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon
                return (
                  <div 
                    key={itemIndex}
                    className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded cursor-pointer transition-colors group"
                  >
                    <IconComponent size={16} className="text-gray-400 group-hover:text-[#97e7aa]" />
                    <span className="text-gray-300 text-sm group-hover:text-white">
                      {item.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickLinks