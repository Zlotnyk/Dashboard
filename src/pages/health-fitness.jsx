import React, { useState } from 'react'
import Navbar from '../components/navbar'
import GifContainer from '../components/gif_container'
import HeaderContent from '../components/header-content'
import NavigationLinks from '../components/navigation-links'
import WavyLines from '../components/wavy-lines'
import FlipClock from '../components/FlipClock/'
import QuickLinks from '../components/quick-links'
import '../App.css'

function HealthFitnessPage() {
	return (
		<div>
			<div>
				<Navbar />
				<header className='relative'>
					<GifContainer />
				</header>
				<HeaderContent title="Health & Fitness" />
				<NavigationLinks />
				<WavyLines />
				<main className='flex w-full min-h-screen select-none'>
					{/* Left Section - 20% */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: '20%' }}
					>
						<FlipClock />
						<QuickLinks />
					</section>

					{/* Right Section - 80% */}
					<section
						className='flex flex-col p-4 gap-4 flex-1'
						style={{ width: '80%' }}
					>
						{/* Top Row - Two blocks side by side */}
						<div className='flex flex-row gap-4'>
							{/* Workout Tracker Block */}
							<div className='flex-1 min-h-[300px] bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center'>
								<h3 className='text-xl font-[Libre_Baskerville] italic text-white'>
									Workout Tracker
								</h3>
							</div>

							{/* Nutrition Log Block */}
							<div className='flex-1 min-h-[300px] bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center'>
								<h3 className='text-xl font-[Libre_Baskerville] italic text-white'>
									Nutrition Log
								</h3>
							</div>
						</div>

						{/* Health Metrics Block */}
						<div className='min-h-[200px] bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center'>
							<h3 className='text-xl font-[Libre_Baskerville] italic text-white'>
								Health Metrics
							</h3>
						</div>

						{/* Fitness Goals Block */}
						<div className='min-h-[200px] bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center'>
							<h3 className='text-xl font-[Libre_Baskerville] italic text-white'>
								Fitness Goals
							</h3>
						</div>

						{/* Progress Charts Block */}
						<div className='min-h-[300px] bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center'>
							<h3 className='text-xl font-[Libre_Baskerville] italic text-white'>
								Progress Charts
							</h3>
						</div>
					</section>
				</main>
			</div>
		</div>
	)
}

export default HealthFitnessPage