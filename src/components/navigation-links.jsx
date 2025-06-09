import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Activity, Brain, Target, DollarSign, BookOpen } from 'lucide-react'

const NavigationLinks = () => {
	const navigationLinks = [
		{ name: 'Student Planner', icon: BookOpen, href: '/' },
		{ name: 'Lifestyle', icon: Heart, href: '/lifestyle' },
		{ name: 'Health & Fitness', icon: Activity, href: '/health-fitness' },
		{ name: 'Wellness', icon: Brain, href: '/wellness' },
		{ name: 'Productivity', icon: Target, href: '/productivity' },
		{ name: 'Finance', icon: DollarSign, href: '/finance' },
	]

	return (
		<div className='bg-[#1a1a1a] py-4'>
			<div className='max-w-7xl mx-auto px-8'>
				<div className='flex items-center justify-between text-base text-white/80 max-w-5xl mx-auto'>
					{navigationLinks.map((link, index) => {
						const IconComponent = link.icon
						return (
							<Link
								key={index}
								to={link.href}
								className='flex items-center gap-2 hover:text-accent transition-colors text-base group'
							>
								<IconComponent
									size={18}
									className='text-accent group-hover:text-accent'
								/>
								{link.name}
							</Link>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default NavigationLinks