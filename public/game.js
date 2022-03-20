const {html} = window.uhtml
const {log} = console

import {roundOne} from './utils.js'
import spells from './spells.js'
import {castSpell} from './actions.js'
import gameLoop from './game-loop.js'

function Spell(state, spellId) {
	const spell = spells[spellId]
	if (!spell) throw new Error('no spell with id ' + spellId)

	// Readable cast time
	let castTime = roundOne(spell.cast / 1000)

	// If we're currently casting this spell, use the state's cast time instead,
	// which will be animated.
	if (state.castingSpellId === spellId) {
		castTime = roundOne(state.castTime / 1000)
	}

	function onTap() {
		castSpell(state, spellId)
	}

	return html`
		<button class="Spell" onClick=${() => onTap()}>
			${spell.name}<br />
			${castTime}s<br />
			<small>${spell.cost} mana</small>
		</button>
	`
}

function Bar({current, max, type}) {
	return html`<div class="Bar" data-type=${type}>
		<progress min="0" max=${max} value=${current} />
		<span>${Math.round(current)}/${max} ${type}</span>
	</div>`
}

function CastBar(state) {
	const spell = spells[state.castingSpellId]
	if (!spell) return
	const current = state.castTime
	const max = spell.cast
	const percentageComplete = Math.round(100 - (current / max) * 100)
	return html`
		${spell.name} ${roundOne(state.castTime / 1000)}<br />
		${Bar({max: 100, current: percentageComplete})}
	`
}

function GlobalCooldownBar(state) {
	return Bar({max: 1500, current: state.gcd})
}

function Monitor(state) {
	return html` <ul class="Monitor">
		<li>Time: ${state.elapsedTime}</li>
		<li>FPS: ${Math.round(state.time)}</li>
		<li title="Global cooldown">gcd: ${state.gcd && roundOne(state.gcd / 1000)}</li>
		<li>Cast: ${state.castTime > 0 ? roundOne(state.castTime / 1000) + 's' : ''}</li>
	</ul>`
}

export default function Game(state) {
	let isPaused = false
	function pause() {
		log('pause')
		window.cancelAnimationFrame(state.globalTimer)
		isPaused= true
	}
	function resume() {
		log('resume')
		requestAnimationFrame(gameLoop)
	}
	function toggleGame() {
		if (isPaused) {
			resume()
		} else {
			pause()
		}
	}
	function restart() {
		window.location.reload()
	}
	return html`<div class="Game">
		<header>
			<h1>Web Healer</h1>
			<p>How long can you keep the party alive?</p>
			<button onClick=${toggleGame}>${isPaused ? 'Resume' : 'Pause'}</button>
			<button onClick=${restart}>Restart</button>
		</header>
		<div class="PartyGroup">
			${Bar({
				type: 'health',
				max: state.party.tank.maxHealth,
				current: state.party.tank.health,
			})}
			${Bar({
				type: 'health',
				max: state.party.rangedDps.maxHealth,
				current: state.party.rangedDps.health,
			})}
		</div>
		<div class="Player">
			${CastBar(state)}<br />
			${GlobalCooldownBar(state)} gcd<br />
			${Bar({type: 'mana', max: state.maxMana, current: state.mana})}
		</div>
		<div class="ActionBar">
			${Spell(state, 'heal')} ${Spell(state, 'greaterheal')} ${Spell(state, 'instaheal')}
		</div>
		${Monitor(state)}
	</div>`
}
