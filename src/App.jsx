import React, { useState } from 'react'
import FlipClock from './components/FlipClock/'
import GifContainer from './components/gif_container'
import TodoList from './components/todo-list'
import Notes from './components/notes'
import Calendar from './components/Calendar/Calendar'
import './App.css'
import TaskTimeline from './components/Task_Timeline/task_timeline'
import { generateMockTasks } from './components/Task_Timeline/timeline_utils'

function App() {
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [tasks, setTasks] = useState(generateMockTasks())

	const handleTaskAdd = task => {
		setTasks(prevTasks => [...prevTasks, task])
	}

	const handleTaskUpdate = updatedTask => {
		setTasks(prevTasks =>
			prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
		)
	}

	const handleTaskDelete = taskId => {
		setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
	}

	const [widths, setWidths] = useState({
		left: 20,
		center: 60,
		right: 20,
	})

	return (
		<div>
			<div>
				<header>
					<GifContainer />
					<h1>Student Planner</h1>
				</header>

				<svg
					width='100%'
					height='20'
					viewBox='0 0 1440 40'
					preserveAspectRatio='none'
					style={{ display: 'block', margin: '20px 0' }}
				>
					<path
						d='M40,20 Q44.5,0 49,20 T58,20 T67,20 T76,20 T85,20 T94,20 T103,20 T112,20 T121,20 T130,20 T139,20 T148,20 T157,20 T166,20 T175,20 T184,20 T193,20 T202,20 T211,20 T220,20 T229,20 T238,20 T247,20 T256,20 T265,20 T274,20 T283,20 T292,20 T301,20 T310,20 T319,20 T328,20 T337,20 T346,20 T355,20 T364,20 T373,20 T382,20 T391,20 T400,20 T409,20 T418,20 T427,20 T436,20 T445,20 T454,20 T463,20 T472,20 T481,20 T490,20 T499,20 T508,20 T517,20 T526,20 T535,20 T544,20 T553,20 T562,20 T571,20 T580,20 T589,20 T598,20 T607,20 T616,20 T625,20 T634,20 T643,20 T652,20 T661,20 T670,20 T679,20 T688,20 T697,20 T706,20 T715,20 T724,20 T733,20 T742,20 T751,20 T760,20 T769,20 T778,20 T787,20 T796,20 T805,20 T814,20 T823,20 T832,20 T841,20 T850,20 T859,20 T868,20 T877,20 T886,20 T895,20 T904,20 T913,20 T922,20 T931,20 T940,20 T949,20 T958,20 T967,20 T976,20 T985,20 T994,20 T1003,20 T1012,20 T1021,20 T1030,20 T1039,20 T1048,20 T1057,20 T1066,20 T1075,20 T1084,20 T1093,20 T1102,20 T1111,20 T1120,20 T1129,20 T1138,20 T1147,20 T1156,20 T1165,20 T1174,20 T1183,20 T1192,20 T1201,20 T1210,20 T1219,20 T1228,20 T1237,20 T1246,20 T1255,20 T1264,20 T1273,20 T1282,20 T1291,20 T1300,20 T1309,20 T1318,20 T1327,20 T1336,20 T1345,20 T1354,20 T1363,20 T1372,20 T1381,20'
						fill='none'
						stroke='hsl(134, 63%, 75%)'
						strokeWidth='4'
					/>
				</svg>

				<main className='flex w-full h-screen select-none'>
					{/* Ліва Секція */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: `${widths.left}%` }}
					>
						<FlipClock />
						<Calendar />
					</section>

					{/* Центральна Секція */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: `${widths.center}%` }}
					>
						<section className='flex flex-row p-4 gap-4'>
							<TodoList
								onAddTask={handleTaskAdd}
								onUpdateTask={handleTaskUpdate}
								onDeleteTask={handleTaskDelete}
								tasks={tasks}
								selectedDate={selectedDate}
							/>
							<Notes
								selectedDate={selectedDate}
								onDateSelect={setSelectedDate}
							/>
						</section>
						<section className='flex flex-col gap-4 mb-4'>
							<TaskTimeline
								tasks={tasks}
								onAddTask={handleTaskAdd}
								onUpdateTask={handleTaskUpdate}
								onDeleteTask={handleTaskDelete}
							/>

							<div className='w-full border-2 border-dashed border-gray-400 p-2'>
								Нижній 2
							</div>
						</section>
					</section>

					{/* Права Секція */}
					<section
						className='flex flex-col p-4 gap-4'
						style={{ width: `${widths.right}%` }}
					>
						<div className='border-2 border-dashed border-gray-400 p-4 '>
							Права 1
						</div>
						<div className='border-2 border-dashed border-gray-400 p-4 '>
							Права 2
						</div>
					</section>
				</main>
			</div>
		</div>
	)
}

export default App