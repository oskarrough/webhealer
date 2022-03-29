import App from './ui.js'
import * as actions from './actions.js'
import newScheduler from './scheduler.js'
const {uhtml} = window

/*
	Here's a simplified version of how this works:

	game loop is called every frame.
	  it updates the previous state,
		and renders the new state

	in other words:

	WebHealer() {
		state = newGame()
		gameLoop() {
			newState = update(oldState)
			render(newState)
		}
		start = requestAnimationFrame(gameLoop)
	}

	.. if only it was this simple. Let's continue.
*/

export function WebHealer(element) {
	// Here we store global timers for easy access.
	window.webhealer = window.webhealer || {}
	let prevTime = 0
	let accumulatedFrameTime = 0

	const scheduler = newScheduler()
	let state = actions.newGame()

	function getState() {
		return state
	}

	// Example: runAction(actions.castSpell, 'heal')
	function runAction(actionFunction, ...args) {
		// console.log('action', actionFunction, args)
		try {
			const result = actionFunction(getState(), ...args)
			if (typeof result === 'function') {
				result(runAction, scheduler, getState)
			} else if (typeof result === 'object') {
				state = result
			} else {
				console.warn('This should not happen?', {actionFunction, args, result})
			}
		} catch (err) {
			console.warn(err.message)
		}
	}

	function smallAttack() {
		return (runAction, scheduler) => {
			scheduler.register(
				(time) => {
					runAction(actions.bossAttack, 1)
					// equivalent to this
					// state = actions.bossAttack(getState())
				},
				{delay: 100, duration: 1, repeat: Infinity}
			)
		}
	}
	function largeAttack() {
		return (runAction, scheduler) => {
			scheduler.register(
				(time) => {
					runAction(actions.bossAttack, 200)
				},
				{delay: 8000, duration: 1, repeat: Infinity}
			)
		}
	}

	runAction(smallAttack)
	runAction(largeAttack)
	runAction(() => (runAction, scheduler) => {
		scheduler.register(
			(time) => {
				runAction(actions.bossAttack, 10)
			},
			{delay: 1000, duration: 5, repeat: Infinity}
		)
	})

	// example task
	// can be registered outside the gameloop
	// or inside in which case you have to make sure it is registered only once per specific task
	// scheduler.register((time) => console.log(`the action happened at ${time}ms`), {
	// 	delay: 2000, // will wait 2s before each cycle
	// 	duration: 1000, // will run for 1s for each cycle
	// 	repeat: Infinity, // will repeat the cycles for ever
	// })

	function gameLoop(time) {
		// sync scheduler with gameloop time
		scheduler.sync(time)

		// keep track of time
		let numberOfUpdates = 0
		if (!prevTime) prevTime = performance.now()
		const elapsedTimeBetweenFrames = time - prevTime
		prevTime = time
		accumulatedFrameTime += elapsedTimeBetweenFrames

		// Update as many times as needed to catch up with the frame rate.
		// In other words, if enough time has passed, update
		const frameDuration = 1000 / state.config.fps
		while (accumulatedFrameTime >= frameDuration) {
			state = updateGameState(state, frameDuration)

			accumulatedFrameTime -= frameDuration

			// do a sanity check
			if (numberOfUpdates++ >= 200) {
				accumulatedFrameTime = 0
				console.error('whaaat')
				break
			}

			// And it will render the state.
			// const interpolate = accumulatedFrameTime / frameDuration
			renderGame(state)
		}

		// And call itself, since this is a loop.
		window.webhealer.timer = requestAnimationFrame(gameLoop)
	}

	function updateGameState(baseState, delta) {
		// console.debug('update')
		const state = actions.tick(baseState, delta)
		if (state.gameOver) {
			setTimeout(() => {
				cancelAnimationFrame(window.webhealer.timer)
			}, 1000 / state.config.fps)
		}
		return state
	}

	function renderGame(state) {
		uhtml.render(element, App(state, runAction))
	}

	return {
		start: () => requestAnimationFrame(gameLoop),
		stop: () => cancelAnimationFrame(window.webhealer.timer),
	}
}
