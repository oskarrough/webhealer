import App from './app.js'
import {newGame} from './actions.js'
import {clamp} from './utils.js'

const state = newGame()
const rootEl = document.querySelector('#root')
const fps = state.config.fps
const frameDuration = 1000 / fps
let prevTime = 0
let accumulatedFrameTime = 0

// The game loop that runs every frame.
export default function gameLoop(time) {
	if (!prevTime) prevTime = performance.now()
	const elapsedTimeBetweenFrames = time - prevTime
	prevTime = time
	accumulatedFrameTime += elapsedTimeBetweenFrames

	const sinceStart = performance.now() - state.beginningOfTime
	state.config.elapsedTime = Math.round((sinceStart / 1000) * 100) / 100

	console.log('frame')

	// It will update the state.
	let numberOfUpdates = 0
	// Update as many times as needed to catch up with the frame rate.
	// In other words, if enough time has passed, update
	while (accumulatedFrameTime >= frameDuration) {
		update(frameDuration)
		accumulatedFrameTime -= frameDuration

		// do a sanity check
		if (numberOfUpdates++ >= 200) {
			accumulatedFrameTime = 0
			console.error('whaaat')
			break
		}

		// And it will render the state.
		// const interpolate = accumulatedFrameTime / frameDuration
		render()
	}

	// And call itself, since this is a loop.
	state.globalTimer = requestAnimationFrame(gameLoop)
}

function render() {
	window.uhtml.render(rootEl, App(state))
}

function update(delta) {
	if (state.config.elapsedTime > 1) {
		// Slowly reduce the tank's healt.
		state.party.tank.health = state.party.tank.health - 1
	}

	// Regenerate mana.
	state.player.mana = clamp(state.player.mana + 0.2, 0, state.player.maxMana)

	// Count down cast time, if needed
	const {castTime} = state
	if (castTime > 0) {
		let newTime = castTime - delta
		state.castTime = newTime > 0 ? newTime : 0
	}

	// Reset global cooldown.
	const {gcd} = state
	if (gcd > 0) {
		let newTime = gcd - delta
		state.gcd = newTime > 0 ? newTime : 0
	}

	// Stop game if the tank has died.
	if (state.party.tank.health < 0) {
		state.party.tank.health = 0
		setTimeout(() => {
			window.cancelAnimationFrame(state.globalTimer)
			state.gameOver = true
			const msg = `Game Over! You survived for ${state.config.elapsedTime} seconds`
			console.log(msg)
			// alert(msg)
		}, 16)
		return
	}
}

render()
requestAnimationFrame(gameLoop)
