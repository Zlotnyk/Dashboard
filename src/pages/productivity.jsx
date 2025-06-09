import React from 'react'
import { ArrowLeft, Target, Clock, TrendingUp, CheckSquare, Zap, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../App.css'

function ProductivityPage() {
	return (
		<div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-8">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-accent"></div>
				<div className="absolute top-40 right-32 w-24 h-24 rounded-full border border-accent"></div>
				<div className="absolute bottom-32 left-32 w-40 h-40 rounded-full border border-accent"></div>
				<div className="absolute bottom-20 right-20 w-28 h-28 rounded-full border-2 border-accent"></div>
			</div>

			{/* Main Content */}
			<div className="relative z-10 text-center max-w-4xl mx-auto">
				{/* Icon */}
				<div className="mb-8">
					<div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
						<Target size={48} className="text-accent" />
					</div>
				</div>

				{/* Title */}
				<h1 className="text-6xl font-bold text-white mb-4 font-[Libre_Baskerville]">
					Productivity
				</h1>

				{/* Subtitle */}
				<p className="text-xl text-gray-300 mb-8 font-[Libre_Baskerville] italic">
					"Productivity is never an accident. It is always the result of commitment to excellence."
				</p>

				{/* Status Badge */}
				<div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600/20 border border-yellow-600/30 rounded-full mb-12">
					<Zap size={20} className="text-yellow-400" />
					<span className="text-yellow-400 font-medium">Under Development</span>
				</div>

				{/* Features Preview */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<div className="bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
						<Clock size={32} className="text-accent mb-4 mx-auto" />
						<h3 className="text-white font-medium mb-2">Time Tracking</h3>
						<p className="text-gray-400 text-sm">Monitor how you spend your time</p>
					</div>
					<div className="bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
						<CheckSquare size={32} className="text-accent mb-4 mx-auto" />
						<h3 className="text-white font-medium mb-2">Task Management</h3>
						<p className="text-gray-400 text-sm">Organize and prioritize your tasks</p>
					</div>
					<div className="bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
						<BarChart3 size={32} className="text-accent mb-4 mx-auto" />
						<h3 className="text-white font-medium mb-2">Analytics</h3>
						<p className="text-gray-400 text-sm">Analyze your productivity patterns</p>
					</div>
				</div>

				{/* Coming Soon Message */}
				<div className="bg-[#2a2a2a] rounded-lg p-8 border border-gray-700 mb-8">
					<TrendingUp size={48} className="text-accent mb-4 mx-auto" />
					<h3 className="text-2xl font-semibold text-white mb-4">Coming Soon</h3>
					<p className="text-gray-300 leading-relaxed">
						We're building powerful productivity tools to help you maximize your efficiency. 
						Features will include time tracking, advanced task management, productivity analytics, 
						focus sessions, and goal setting. Get ready to supercharge your productivity!
					</p>
				</div>

				{/* Back Button */}
				<Link 
					to="/"
					className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors font-medium"
				>
					<ArrowLeft size={20} />
					Back to Student Planner
				</Link>
			</div>
		</div>
	)
}

export default ProductivityPage