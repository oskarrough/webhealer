const {html} = window.uhtml
import {roundOne} from './utils.js'
import spells from './spells.js'
import {castSpell} from './actions.js'

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
		<button class="Spell" onClick=${() => onTap()}>${spell.name} (${castTime}s)</button>
	`
}

function Bar({current, max, type}) {
	return html`<div class="Bar" data-type=${type}>
		<progress min="0" max=${max} value=${current} />
		<span>${Math.round(current)}/${max}</span>
	</div>`
}

function CastBar(state) {
	const spell = spells[state.castingSpellId]
	if (!spell) return
	const current = state.castTime
	const max = spell.cast
	const percentageComplete = Math.round(100 - (current / max * 100))
	return html`
		${spell.name} ${roundOne(state.castTime / 1000)}<br>
		<progress max="100" value=${percentageComplete}>
	`
}

function Monitor(state) {
	return html` <ul class="Monitor">
		<li>time: ${state.elapsedTime}</li>
		<li>fps: ${Math.round(state.time)}</li>
		<li>cd: ${state.gcd && roundOne(state.gcd / 1000)}</li>
		<li>cast: ${state.castTime > 0 ? roundOne(state.castTime / 1000) + 's' : ''}</li>
	</ul>`
}

export default function Game(state) {
	// state.elapsedtime = (performance.now() - state.beginningOfTime) / 1000
	// console.log(state.elapsedTime)
	return html`<div class="Game">
		<h1>Web Healer</h1>
		<div class="PartyGroup">
			${Bar({type: 'health', max: state.party.tank.maxHealth, current: state.party.tank.health})}
			${Bar({
				type: 'health',
				max: state.party.rangedDps.maxHealth,
				current: state.party.rangedDps.health,
			})}
		</div>
		<div class="Player">
			${CastBar(state)}
			${Bar({type: 'mana', max: state.maxMana, current: state.mana})}
		</div>
		<div class="ActionBar">${Spell(state, 'heal')} ${Spell(state, 'greaterheal')}</div>
		${Monitor(state)}
	</div>`
}
