const {html} = window.uhtml
import spells from './spells.js'
import {roundOne} from './utils.js'
import * as actions from './actions.js'
import {Bar, Meter} from './components/bar.js'
import Monitor from './components/monitor.js'
import Spell from './components/spell.js'

export default function UI(state, runAction) {
	const {
		player,
		party: {tank},
	} = state

	function restart() {
		window.location.reload()
	}

	function handleShortcuts({key}) {
		const castSpell = (spellId) => runAction(actions.castSpell, {spellId})
		if (key === '1') castSpell('heal')
		if (key === '2') castSpell('flashheal')
		if (key === '3') castSpell('greaterheal')
		if (key === '4') castSpell('renew')
		if (key === 'a' || key === 's' || key === 'd' || key === 'w' || key === 'Escape') {
			runAction(actions.interrupt)
		}
	}

	// Temporary shortcuts for less typing..
	const SpellIcon = (spellId, shortcut) => Spell({state, runAction, spellId, shortcut})
	const spell = spells[state.castingSpellId] || false

	return html`<div class="Game" onkeyup=${handleShortcuts} tabindex="0">
		<header>
			<h1>Web Healer</h1>
			<p>How long can you keep the tank alive?</p>
			<button onClick=${restart}>Restart</button>
		</header>

		<div class="PartyGroup">
			${state.gameOver
				? html`<p>
						Game Over! You survived for ${roundOne(state.timers.elapsedTime / 1000)}
						seconds
						<button onClick=${restart}>Try again</button>
				  </p>`
				: html``}
			${FCT('Go!')}

			<p>Tank</p>
			${Meter({
				type: 'health',
				value: tank.health,
				max: tank.baseHealth,
				potentialValue: spell.heal,
			})}
			<ul class="Effects">
				${state.party.tank.effects.map(
					(effect) => html`
						<div class="Spell">
							<div class="Spell-inner">
								${effect.name}<br />
								<small><span class="spin">⏲</span> ${effect.ticks}</small>
							</div>
						</div>
					`
				)}
			</ul>
		</div>
		<div class="Player">
			${CastBar(state)} <br />
			${Meter({type: 'mana', value: player.mana, max: player.baseMana})}
			<p>You</p>
		</div>
		<div class="ActionBar">
			${SpellIcon('heal', '1')} ${SpellIcon('flashheal', '2')}
			${SpellIcon('greaterheal', '3')} ${SpellIcon('renew', '4')}
		</div>
		${Monitor(state)}
	</div>`
}

function CastBar(state) {
	const spell = spells[state.castingSpellId]
	if (!spell) return
	return html`
		Casting ${spell.name} ${roundOne(state.timers.castTime / 1000)}
		${Bar({
			type: 'cast',
			max: spell.cast,
			value: spell.cast - state.timers.castTime,
		})}
	`
}

function FCT(value) {
	return html`<div class="FCT">${Math.round(value) || value}</div>`
}
