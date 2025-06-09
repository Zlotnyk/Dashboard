import React from 'react'
import { BookOpen, FileText, PenTool, Target, Clock, Users, Calendar, Heart, MapPin, Utensils, Dumbbell, Brain, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const QuickLinks = () => {
  // Check current page
  const isLifestylePage = window.location.pathname === '/lifestyle'
  const isHealthFitnessPage = window.location.pathname === '/health-fitness'
  const isTimetablePage = window.location.pathname === '/timetable'
  
  const mainLinks = [
    {
      title: 'Course',
      items: [
        { name: 'Timetable', icon: Clock, href: '/timetable' },
        { name: 'Course Materials', icon: BookOpen, href: '#materials' },
        { name: 'Study Checklist', icon: Target, href: '#checklist' }
      ]
    },
    {
      title: 'Assignments',
      items: [
        { name: 'Assignment Planner', icon: FileText, href: '#assignment-planner' },
        { name: 'Study Notebook', icon: BookOpen, href: '#notebook' },
        { name: 'Important Concepts', icon: Target, href: '#concepts' }
      ]
    },
    {
      title: 'Projects',
      items: [
        { name: 'Project Planner', icon: Target, href: '#project-planner' },
        { name: 'Group Projects', icon: Users, href: '#group-projects' }
      ]
    },
    {
      title: 'Writing',
      items: [
        { name: 'Essay Planner', icon: PenTool, href: '#essay-planner' }
      ]
    },
    {
      title: 'Exams',
      items: [
        { name: 'Exam Preparation', icon: Target, href: '#exam-prep' },
        { name: 'Exam Reflection', icon: FileText, href: '#exam-reflection' }
      ]
    }
  ]

  const lifestyleLinks = [
    {
      title: 'Planner',
      items: [
        { name: 'Day', icon: Calendar, href: '#day' },
        { name: 'Week', icon: Calendar, href: '#week' },
        { name: 'Month', icon: Calendar, href: '#month' },
        { name: 'Year', icon: Calendar, href: '#year' }
      ]
    },
    {
      title: 'Lifestyle',
      items: [
        { name: 'Birthdays', icon: Heart, href: '#birthdays' },
        { name: 'Contacts', icon: Users, href: '#contacts' },
        { name: 'Trip Planner', icon: MapPin, href: '#trip-planner' },
        { name: 'Outfit Planner', icon: Target, href: '#outfit-planner' },
        { name: 'Event Planner', icon: Calendar, href: '#event-planner' },
        { name: 'Cleaning', icon: Target, href: '#cleaning' },
        { name: 'Habit Tracker', icon: TrendingUp, href: '#habit-tracker' },
        { name: 'Dream Tracker', icon: Brain, href: '#dream-tracker' },
        { name: 'Bucket List', icon: Target, href: '#bucket-list' }
      ]
    }
  ]

  const healthFitnessLinks = [
    {
      title: 'Workouts',
      items: [
        { name: 'Workout Plans', icon: Dumbbell, href: '#workout-plans' },
        { name: 'Exercise Library', icon: BookOpen, href: '#exercise-library' },
        { name: 'Progress Tracker', icon: TrendingUp, href: '#progress-tracker' }
      ]
    },
    {
      title: 'Nutrition',
      items: [
        { name: 'Meal Planning', icon: Utensils, href: '#meal-planning' },
        { name: 'Calorie Counter', icon: Target, href: '#calorie-counter' },
        { name: 'Recipe Book', icon: BookOpen, href: '#recipe-book' },
        { name: 'Water Tracker', icon: Target, href: '#water-tracker' }
      ]
    },
    {
      title: 'Health',
      items: [
        { name: 'Health Metrics', icon: Heart, href: '#health-metrics' },
        { name: 'Sleep Tracker', icon: Brain, href: '#sleep-tracker' },
        { name: 'Mood Tracker', icon: Heart, href: '#mood-tracker' },
        { name: 'Medication Log', icon: FileText, href: '#medication-log' }
      ]
    },
    {
      title: 'Goals',
      items: [
        { name: 'Fitness Goals', icon: Target, href: '#fitness-goals' },
        { name: 'Weight Goals', icon: TrendingUp, href: '#weight-goals' },
        { name: 'Habit Tracker', icon: Calendar, href: '#habit-tracker' }
      ]
    }
  ]

  const timetableLinks = [
    {
      title: 'Schedule',
      items: [
        { name: 'Weekly View', icon: Calendar, href: '#weekly-view' },
        { name: 'Daily View', icon: Clock, href: '#daily-view' },
        { name: 'Monthly View', icon: Calendar, href: '#monthly-view' }
      ]
    },
    {
      title: 'Classes',
      items: [
        { name: 'Add Class', icon: BookOpen, href: '#add-class' },
        { name: 'Class List', icon: FileText, href: '#class-list' },
        { name: 'Attendance', icon: Target, href: '#attendance' }
      ]
    },
    {
      title: 'Planning',
      items: [
        { name: 'Study Blocks', icon: Clock, href: '#study-blocks' },
        { name: 'Free Time', icon: Heart, href: '#free-time' },
        { name: 'Reminders', icon: Target, href: '#reminders' }
      ]
    }
  ]

  let links = mainLinks
  if (isLifestylePage) {
    links = lifestyleLinks
  } else if (isHealthFitnessPage) {
    links = healthFitnessLinks
  } else if (isTimetablePage) {
    links = timetableLinks
  }

  return (
    <div className="w-full bg-[#1a1a1a] rounded-lg p-4 pl-6">
      <div className="space-y-6">
        {links.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-white text-lg font-medium mb-3 font-[Libre_Baskerville] italic">
              {section.title}
            </h3>
            {/* Horizontal line after each title */}
            <div className="w-full h-px bg-gray-700 mb-3"></div>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon
                const isExternalLink = item.href.startsWith('/')
                
                if (isExternalLink) {
                  return (
                    <Link
                      key={itemIndex}
                      to={item.href}
                      className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded cursor-pointer transition-colors group"
                    >
                      <IconComponent size={16} className="text-gray-400 group-hover:text-accent" />
                      <span className="text-gray-300 text-sm group-hover:text-white">
                        {item.name}
                      </span>
                    </Link>
                  )
                }
                
                return (
                  <a
                    key={itemIndex}
                    href={item.href}
                    className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded cursor-pointer transition-colors group"
                  >
                    <IconComponent size={16} className="text-gray-400 group-hover:text-accent" />
                    <span className="text-gray-300 text-sm group-hover:text-white">
                      {item.name}
                    </span>
                  </a>
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