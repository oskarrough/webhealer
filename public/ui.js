const {html} = window.uhtml
import spells from './spells.js'
import {roundOne} from './utils.js'
import * as actions from './actions.js'
import {Bar, Meter} from './components/bar.js'
import Monitor from './components/monitor.js'
import Spell from './components/spell.js'

export default function UI(state) {
	const {player, runAction} = state
	const {tank} = state.party

	const castSpell = (spellId) => runAction(actions.castSpell, {spellId})
	const SmartSpell = (spellId, shortcut) => Spell({state, spellId, shortcut})

	function restart() {
		window.location.reload()
	}

	function handleShortcuts({key}) {
		console.log('Pressed', key)
		if (key === '1') castSpell('heal')
		if (key === '2') castSpell('flashheal')
		if (key === '3') castSpell('greaterheal')
		if (key === '4') castSpell('renew')
		if (key === 'a' || key === 's' || key === 'd' || key === 'w' || key === 'Escape') {
			runAction(actions.interrupt)
		}
	}

	return html`<div class="Game" onkeyup=${handleShortcuts} tabindex="0">
		<header>
			<h1>Web Healer</h1>
			<p>How long can you keep the tank alive?</p>
			<button onClick=${restart}>Restart</button>
		</header>
		<div class="PartyGroup">
			${state.gameOver
				? html`<p>
						Game Over! You survived for ${roundOne(state.config.elapsedTime / 1000)}
						seconds
						<button onClick=${restart}>Try again</button>
				  </p>`
				: html``}
			${FCT('Go!')}
			<p>Tank</p>
			${Meter({type: 'health', max: tank.baseHealth, current: tank.health})}
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
			${Meter({type: 'mana', max: player.baseMana, current: player.mana})}
			<p>You</p>
		</div>
		<div class="ActionBar">
			${SmartSpell('heal', '1')} ${SmartSpell('flashheal', '2')}
			${SmartSpell('greaterheal', '3')} ${SmartSpell('renew', '4')}
		</div>
		${Monitor(state)}
	</div>`
}

function CastBar(state) {
	const spell = spells[state.castingSpellId]
	if (!spell) return
	return html`
		Casting ${spell.name} ${roundOne(state.castTime / 1000)}
		${Bar({
			type: 'cast',
			max: spell.cast,
			current: spell.cast - state.castTime,
		})}
	`
}

function FCT(value) {
	return html`<div class="FCT">${Math.round(value) || value}</div>`
}
