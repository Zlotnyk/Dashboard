import React, { useState } from 'react'
import Navbar from '../components/navbar'
import GifContainer from '../components/gif_container'
import '../App.css'

function LifestylePage() {
	return (
		<div>
			<Navbar />
			<header className='relative'>
				<GifContainer />
			</header>
		</div>
	)
}

export default LifestylePage
