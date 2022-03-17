const {render, html} = window.uhtml
import spells from './spells.js'
// import FpsCounter from './fps.js'
const {log} = console

const rootEl = document.querySelector('#root')
const state = {
	maxMana: 600,
	mana: 600,
	party: {
		tank: {
			health: 320,
			maxHealth: 320,
		},
		rangedDps: {
			health: 180,
			maxHealth: 180,
		},
	},
}

function Spell(spellId) {
	const spell = spells[spellId]

	if (!spell) throw new Error('no spell with id ' + spellId)

	let castTime = roundOne(spell.cast / 1000)
	if (state.castingSpellId === spellId) {
		castTime = roundOne(state.castTime / 1000)
	}

	function cast() {
		if (spell.cost > state.mana) {
			log('not enough mana')
			return
		}
		if (state.timeoutId) {
			console.log('clearing')
			clearTimeout(state.timeoutId)
		}
		log('casting', spell.name)
		state.castingSpellId = spellId
		state.castTime = spell.cast
		state.gcd = 1500

		state.timeoutId = setTimeout(() => {
			log('finished casting', spell.name)
			state.mana = state.mana - spell.cost
			state.party.tank.health = state.party.tank.health + spell.heal
			delete state.timeoutId
			delete state.castingSpellId
		}, spell.cast)
	}

	return html`
		<button class="Spell" onClick=${() => cast('heal')}>${spell.name} (${castTime}s)</button>
	`
}

function Bar({max, current, type}) {
	return html`<div class="Bar" data-type=${type}>
		<progress min="0" max=${max} value=${current} />
		<span>${roundOne(current)}/${max}</span>
	</div>`
}

function updateGame(delta) {
	state.time = delta

	state.party.tank.health = state.party.tank.health - 1

	const newMana = state.mana + 0.2
	state.mana = newMana > state.maxMana ? state.maxMana : newMana

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

	if (state.party.tank.health < 0) {
		state.party.tank.health = 0
		window.cancelAnimationFrame(timer)
		return
	}
}

function Monitor(interpolate) {
	return html` <ul class="Monitor">
		<li>fps: ${state.time}</li>
		<li>interpolation: ${interpolate || 0}</li>
		<li>global cooldown: ${state.gcd && roundOne(state.gcd / 1000)}</li>
		<li>casting: ${state.castTime > 0 ? roundOne(state.castTime / 1000) + 's' : 'not casting'}</li>
	</ul>`
}

function Game() {
	return html`<div class="Game">
		<h1>Web Healer</h1>
		<div class="PartyGroup">
			${Bar({type: 'health', max: state.party.tank.maxHealth, current: state.party.tank.health})}
			${Bar({type: 'health', max: state.party.rangedDps.maxHealth, current: state.party.rangedDps.health})}
		</div>
		<div class="Player">${Bar({type: 'mana', max: state.maxMana, current: state.mana})}</div>
		<div class="ActionBar">${Spell('heal')} ${Spell('greaterheal')}</div>
		${Monitor()}
	</div>`
}

function renderGame(interpolate) {
	render(rootEl, Game)
}

// The game loop. It will call update() and render() every frame.
const fps = 30
const frameDuration = 1000 / fps
let prevTime = performance.now()
let accumulatedFrameTime = 0
let timer

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

	timer = requestAnimationFrame(gameLoop)
}

// Start the game
requestAnimationFrame(gameLoop)

function roundOne(num) {
	return Math.round(num * 10) / 10
}
