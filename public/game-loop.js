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

/**
 *
 * @param {DOMElement} element where to render
 * @returns {WebHealer} with start() and stop() methods
 */
export function WebHealer(element) {
	// Here we store global timers for easy access.
	window.webhealer = window.webhealer || {}

	const scheduler = newScheduler()
	let state = actions.newGame()
	state.runAction = runAction.bind(this)

	function getState() {
		return state
	}

	// Update the state with an action immediately.
	// Alternatively, pass in a "timing" config to schedule the update.
	function runAction(action, theRest) {
		const {timing, ...props} = theRest || {}

		// console.log('run action', action.name, {timing, props})

		if (timing) {
			// wrap the passed in action with a scheduled one.
			const scheduledAction = () => (runAction, scheduler, getState) => {
				const task = (time, task) => runAction(action, props)
				scheduler.register(task, timing)
			}
			runAction(scheduledAction)
			return
		}

		try {
			const result = action(getState(), props)
			if (typeof result === 'function') {
				result(runAction, scheduler, getState)
			} else if (typeof result === 'object') {
				state = result
			} else {
				console.warn('This should not happen?', {action, props, result})
			}
		} catch (err) {
			console.warn(err.message)
		}
	}

	// This is current the "boss" of the game. Frightening!
	function summonBoss() {
		runAction(actions.bossAttack, {timing: {delay: 30, repeat: Infinity}, amount: 1})
		runAction(actions.bossAttack, {timing: {delay: 1000, duration: 5, repeat: Infinity}, amount: 20})
		runAction(actions.bossAttack, {timing: {delay: 7000, repeat: Infinity}, amount: 200})
	}

	let prevTime = 0
	let accumulatedFrameTime = 0
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
		uhtml.render(element, App(state))
	}

	return {
		start: () => {
			summonBoss()
			requestAnimationFrame(gameLoop)
		},
		stop: () => cancelAnimationFrame(window.webhealer.timer),
	}
}
