import * as actions from './actions'
import {html, roundOne} from './utils'
import {Meter} from './components/bar'
import {Monitor} from './components/monitor'
import {SpellIcon} from './components/spell-icon'
import {EffectIcon} from './components/effect-icon'
import {register} from './components/floating-combat-text'
import {WebHealer} from './web-healer'
import {Audio} from './nodes/audio'
import {Player} from './nodes/player'
import {Tank} from './nodes/tank'
import {Boss} from './nodes/boss'

register()

export function UI(game: WebHealer) {
	const player = game.query(Player)!
	const tank = game.query(Tank)!
	const boss = game.query(Boss)!
	const audio = game.query(Audio)!

	if (!player) return html`Woops, no player to heal the tank...`
	// if (!tank) return html`Woops, can't heal without a tank...`

	function handleShortcuts({key}: {key: string}) {
		if (key === '1') player.castSpell('Heal')
		if (key === '2') player.castSpell('FlashHeal')
		if (key === '3') player.castSpell('GreaterHeal')
		if (key === '4') player.castSpell('Renew')
		if (key === 'a' || key === 's' || key === 'd' || key === 'w' || key === 'Escape') {
			actions.interrupt(game)
		}
	}

	const spell = player.lastCastSpell
	const timeSinceCast = game.elapsedTime - player.lastCastTime

	return html`<div class="Game" onkeyup=${handleShortcuts} tabindex="0">
		<figure class="Game-bg"></figure>

		<div class="Enemies">
			${boss
				? html`<div>
						You can't run!
						<br />
						<img src=${`/assets/${boss.image}`} width="120" alt="" />
				  </div>`
				: html``}
		</div>

		<div class="PartyGroup">
			<div class="FloatingCombatText"></div>

			${game.gameOver
				? html` <h2>Game Over!</h2>
						<p>You survived for ${roundOne(game.elapsedTime / 1000)} seconds</p>`
				: html``}
			${tank
				? html`
						<div class="PartyMember">
							<p class="speechbubble">
								<em>"I'm being attacked! Help! Heal me!"</em>
							</p>
							<img src="/assets/ragnaros.webp" width="120" alt="" />

							${Meter({
								type: 'health',
								value: tank?.health,
								max: tank?.baseHealth,
								potentialValue: spell?.heal,
								spell: spell,
							})}

							<ul class="Effects">
								${tank?.children.map(EffectIcon)}
							</ul>
						</div>
				  `
				: html``}
		</div>

		<div class="Player">
			<div style="min-height: 2.5rem">
				<p .hidden=${!spell}>Casting ${spell?.name} ${roundOne(timeSinceCast / 1000)}</p>
				${spell
					? Meter({
							type: 'cast',
							value: timeSinceCast,
							max: spell.delay,
					  })
					: null}
			</div>

			<p>Mana</p>
			${Meter({type: 'mana', value: player.mana, max: player.baseMana})}
		</div>

		<div class="ActionBar">
			${Object.keys(player.spellbook).map((name, i) => SpellIcon(game, name, i + 1))}
		</div>

		${Monitor(game)}
		<div
			class="Combatlog"
			onclick=${(event: Event) =>
				(event.currentTarget as Element).classList.toggle('sticky')}
		>
			<ul class="Log Log--scroller"></ul>
		</div>

		<audio loop ?muted=${audio.disabled}></audio>
	</div>`
}
