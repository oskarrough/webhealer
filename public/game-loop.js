import App from './app.js'
import {newGame, update} from './actions.js'

// The game loop that runs every frame.
let prevTime = 0
let accumulatedFrameTime = 0

export default function gameLoop(time) {
	const frameDuration = 1000 / state.config.fps
	if (!prevTime) prevTime = performance.now()
	const elapsedTimeBetweenFrames = time - prevTime
	prevTime = time
	accumulatedFrameTime += elapsedTimeBetweenFrames

	const sinceStart = performance.now() - state.beginningOfTime
	state.config.elapsedTime = Math.round((sinceStart / 1000) * 100) / 100

	// It will update the state.
	let numberOfUpdates = 0
	// Update as many times as needed to catch up with the frame rate.
	// In other words, if enough time has passed, update
	while (accumulatedFrameTime >= frameDuration) {
		update(state, frameDuration)
		accumulatedFrameTime -= frameDuration

		// do a sanity check
		if (numberOfUpdates++ >= 200) {
			accumulatedFrameTime = 0
			console.error('whaaat')
			break
		}

		// And it will render the state.
		// const interpolate = accumulatedFrameTime / frameDuration
		render(state)
	}

	// And call itself, since this is a loop.
	state.globalTimer = requestAnimationFrame(gameLoop)
}

const rootEl = document.querySelector('#root')
function render(state) {
	window.uhtml.render(rootEl, App(state))
}

const state = newGame()
render(state)
requestAnimationFrame(gameLoop)
