const {render} = window.uhtml
import Game from './game.js'
// import {roundOne} from './utils.js'
import {newGame} from './actions.js'

const state = newGame()

// The game loop.
// On every frame it will update the state and render the game.

const rootEl = document.querySelector('#root')
const fps = 30
const frameDuration = 1000 / fps

const startTime = performance.now()
let prevTime = performance.now()
let accumulatedFrameTime = 0

export default function gameLoop(time) {
	const elapsedTimeBetweenFrames = time - prevTime
	prevTime = time
	accumulatedFrameTime += elapsedTimeBetweenFrames

	let numberOfUpdates = 0

	while (accumulatedFrameTime >= frameDuration) {
		updateGame(frameDuration)
		accumulatedFrameTime -= frameDuration

		// do a sanity check
		if (numberOfUpdates++ >= 200) {
			accumulatedFrameTime = 0
			console.error('whaaat')
			// restoreTheGameState()
			break
		}
	}

	// this is a percentage of time
	const interpolate = accumulatedFrameTime / frameDuration
	renderGame(interpolate)

	state.globalTimer = requestAnimationFrame(gameLoop)
}

function renderGame(interpolate) {
	render(rootEl, Game(state))
}

function updateGame(delta) {
	console.log('update')
	const sinceStart = performance.now() - state.beginningOfTime
	state.elapsedTime = Math.round((sinceStart / 1000) * 100) / 100

	state.time = delta

	if (sinceStart > 3000) {
		// Reduce the tank's health slowly..
		state.party.tank.health = state.party.tank.health - 1
	}

	// Regenerate mana.
	const newMana = state.player.mana + 0.2
	state.player.mana = newMana > state.player.maxMana ? state.player.maxMana : newMana

	// Count down cast time, if needed
	const {castTime} = state
	if (castTime > 0) {
		const newTime = castTime - delta
		state.castTime = newTime > 0 ? newTime : 0
	}

	// Reset global cooldown.
	const {gcd} = state
	if (gcd > 0) {
		const newTime = gcd - delta
		state.gcd = newTime > 0 ? newTime : 0
	}

	// Stop game if the tank has died.
	if (state.party.tank.health < 0) {
		state.party.tank.health = 0
		setTimeout(() => {
			window.cancelAnimationFrame(state.globalTimer)
			const msg = `Game Over! You survived for ${state.elapsedTime} seconds`
			console.log(msg)
			alert(msg)
		}, 16)
		return
	}
}
