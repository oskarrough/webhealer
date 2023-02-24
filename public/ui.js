import {html} from './utils.js'
// import * as spells from './spells.js'
import {roundOne} from './utils.js'
import * as actions from './actions.js'
import {Meter} from './components/bar.js'
import CastBar from './components/cast-bar.js'
import Monitor from './components/monitor.js'
import SpellIcon from './components/spell-icon.js'

export default function UI(game) {
	const player = game.find('Player')
	const tank = game.find('Tank')

	if (!player) return html`woops no player to heal the tank`
	if (!tank) return html`woops can't heal without a tank..`

	function handleShortcuts({key}) {
		if (key === '1') player.castSpell('Heal')
		if (key === '2') player.castSpell('FlashHeal')
		if (key === '3') player.castSpell('GreaterHeal')
		if (key === '4') player.castSpell('Renew')
		if (key === 'a' || key === 's' || key === 'd' || key === 'w' || key === 'Escape') {
			actions.interrupt(game)
		}
	}

	const spell = player.lastCastSpell

	return html`<div class="Game" onkeyup=${handleShortcuts} tabindex="0">
		<div class="PartyGroup">
			${game.gameOver
				? html`<h2>Game Over!</h2>
						<p>You survived for ${roundOne(game.elapsedTime / 1000)} seconds</p>`
				: html``}
			${FCT('Go!')}

			<p>
				<em>"I'm being attacked by an invisible monster! Help! Heal me!"</em>
			</p>

			<img src="/assets/ragnaros.webp" width="120" alt="" />

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
								<small><span class="spin">⏲</span> ${effect.cycles}</small>
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
			${SpellIcon(game, 'Heal', '1')} ${SpellIcon(game, 'FlashHeal', '2')}
			${SpellIcon(game, 'GreaterHeal', '3')} ${SpellIcon(game, 'Renew', '4')}
		</div>

		${Monitor(game)}

		<audio loop></audio>
	</div>`
}

function FCT(value) {
	return html`<div class="FCT">${Math.round(value) || value}</div>`
}
