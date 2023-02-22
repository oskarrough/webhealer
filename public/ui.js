const {html} = window.uhtml
import spells from './spells.js'
import {roundOne} from './utils.js'
import * as actions from './actions.js'
import {Bar, Meter} from './components/bar.js'
import Monitor from './components/monitor.js'
import SpellIcon from './components/spell-icon.js'

export default function UI(game) {
	const state = {}

	const player = game.find('Player')
	const tank = game.find('Tank')

	if (!player) return html`woops no player`

	// Bind to the main game class.
	const runAction = game.runAction.bind(game)

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
	const SpellButton = (spellId, shortcut) =>
		SpellIcon({game, state, runAction, spellId, shortcut})

	const spell = player.casting && player.casting.spell

	return html`<div class="Game" onkeyup=${handleShortcuts} tabindex="0">
		<div class="PartyGroup">
			${state.gameOver
				? html`<h2>Game Over!</h2>
						<p>
							You survived for ${roundOne(game.elapsedTime / 1000)} seconds
							<button onClick=${() => window.webhealer.restart()}>Try again</button>
						</p>`
				: html``}
			${FCT('Go!')}

			<p>Tank</p>
			${Meter({
				type: 'health',
				value: tank.health,
				max: tank.baseHealth,
				potentialValue: spell?.heal,
			})}

			<ul class="Effects">
				${tank.effects.map(
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
			${CastBar(game)} <br />
			${Meter({type: 'mana', value: player.mana, max: player.baseMana})}
			<p>You</p>
		</div>

		<div class="ActionBar">
			${SpellButton('heal', '1')} ${SpellButton('flashheal', '2')}
			${SpellButton('greaterheal', '3')} ${SpellButton('renew', '4')}
		</div>

		${Monitor(game)}
	</div>`
}

function CastBar(game) {
	const player = game.find('Player')
	let spell = player.casting?.spell

	if (!spell) return

	const timeCast = game.elapsedTime - player.casting.time

	console.log({
		value: spell.cast - timeCast,
		max: spell.cast,
	})

	return html`
		Casting ${spell.name} ${roundOne(timeCast / 1000)}
		${Bar({
			type: 'cast',
			value: spell.cast - timeCast,
			max: spell.cast,
		})}
	`
}

function FCT(value) {
	return html`<div class="FCT">${Math.round(value) || value}</div>`
}
