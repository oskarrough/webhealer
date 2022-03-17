const {render, html} = window.uhtml
import spells from './spells.js'
// import FpsCounter from './fps.js'
const {log} = console

const rootEl = document.querySelector('#root')
const monitor = document.querySelector('#monitor')
const state = {}

function Spell(spellId) {
	const spell = spells[spellId]
	if (!spell) throw new Error('no spell with id ' + spellId)
	const castDuration = spell.cast / 1000

	function cast() {
		if (state.timeoutId) {
			console.log('clearing')
			clearTimeout(state.timeoutId)
		}
		log('casting', spell.name)
		state.castTime = spell.cast
		state.gcd = 1500

		state.timeoutId = setTimeout(() => {
			log('finished casting', spell.name)
			delete state.timeoutId
		}, spell.cast)
	}

	return html`<div>
		<button onClick=${() => cast('heal')}>Cast ${spell.name} (${castDuration}s)</button>
	</div>`
}

function updateGame(delta) {
	state.time = delta

	// Count down cast time, if needed
	const {castTime} = state
	if (castTime > 0) {
		const newTime = castTime - delta
		state.castTime = newTime > 0 ? newTime : 0
	}

	// Reset global cooldown
	const {gcd} = state
	if (gcd > 0) {
		const newTime = gcd - delta
		state.gcd = newTime > 0 ? newTime : 0
	}
}

function renderGame(interpolate) {
	// Just for debugging
	render(
		monitor,
		html`<ul>
			<li>time: ${state.time}</li>
			<li>interpolate: ${interpolate}</li>
			<li>global cooldown: ${state.gcd}</li>
			<li>casting: ${state.castTime > 0 ? roundOneDecimal(state.castTime / 1000) + 's' : 'not casting'}</li>
		</ul>`
	)
	// Actual game
	render(
		rootEl,
		html`<div>
			<h1>Web Healer</h1>
			${Spell('heal')} ${Spell('greaterheal')}
		</div>`
	)
}

// The game loop. It will call update() and render() every frame.
const fps = 15
const frameDuration = 1000 / fps
let prevTime = performance.now()
let accumulatedFrameTime = 0
function gameLoop(time) {
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

	requestAnimationFrame(gameLoop)
}

// Start the game
requestAnimationFrame(gameLoop)

function roundOneDecimal(num) {
	return Math.round(num * 10) / 10
}
