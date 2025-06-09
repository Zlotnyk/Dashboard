import React from 'react'
import { ArrowLeft, AlertTriangle, Home, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../App.css'

function NotFoundPage() {
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
					<div className="w-24 h-24 mx-auto rounded-full bg-red-600/20 flex items-center justify-center">
						<AlertTriangle size={48} className="text-red-400" />
					</div>
				</div>

				{/* 404 */}
				<h1 className="text-8xl font-bold text-white mb-4 font-[Libre_Baskerville]">
					404
				</h1>

				{/* Title */}
				<h2 className="text-3xl font-semibold text-white mb-4">
					Page Not Found
				</h2>

				{/* Subtitle */}
				<p className="text-xl text-gray-300 mb-8 font-[Libre_Baskerville] italic">
					"The page you're looking for seems to have wandered off."
				</p>

				{/* Status Badge */}
				<div className="inline-flex items-center gap-2 px-6 py-3 bg-red-600/20 border border-red-600/30 rounded-full mb-12">
					<Zap size={20} className="text-red-400" />
					<span className="text-red-400 font-medium">Page Not Available</span>
				</div>

				{/* Message */}
				<div className="bg-[#2a2a2a] rounded-lg p-8 border border-gray-700 mb-8">
					<h3 className="text-2xl font-semibold text-white mb-4">Oops! Something went wrong</h3>
					<p className="text-gray-300 leading-relaxed mb-6">
						The page you're trying to access doesn't exist or may have been moved. 
						Don't worry, you can navigate back to the main dashboard or explore other sections 
						of the application.
					</p>
					
					{/* Quick Links */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Link 
							to="/"
							className="flex items-center gap-3 px-6 py-3 bg-accent/20 border border-accent/30 rounded-lg hover:bg-accent/30 transition-colors text-accent"
						>
							<Home size={20} />
							Student Planner
						</Link>
						<Link 
							to="/lifestyle"
							className="flex items-center gap-3 px-6 py-3 bg-accent/20 border border-accent/30 rounded-lg hover:bg-accent/30 transition-colors text-accent"
						>
							<Zap size={20} />
							Lifestyle
						</Link>
					</div>
				</div>

				{/* Back Button */}
				<Link 
					to="/"
					className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors font-medium"
				>
					<ArrowLeft size={20} />
					Back to Home
				</Link>
			</div>
		</div>
	)
}

export default NotFoundPage