import * as actions from '../actions'
import {html, roundOne} from '../utils'
import {Meter} from './bar'
import {Monitor} from './monitor'
import {SpellIcon} from './spell-icon'
import {EffectIcon} from './effect-icon'
import {register} from './floating-combat-text'
import {GameLoop} from '../nodes/game-loop'
import {Tank} from '../nodes/tank'
import {Boss} from '../nodes/boss'
import {Spell} from '../nodes/spell'

register()

// Helper function to render a party member
function PartyMember(member: Tank, spell: Spell | undefined) {
	return html`
		<div class="PartyMember" data-member-id=${member.id}>
			<div class="PartyMember-avatar">
				<!-- Placeholder avatar instead of specific images -->
				<div class="placeholder-avatar">
					${member.constructor.name}
				</div>
			</div>

			${Meter({
				type: 'health',
				value: member.health,
				max: member.baseHealth,
				potentialValue: spell?.heal,
				spell: spell,
			})}

			<ul class="Effects">
				${member.effects?.map(EffectIcon)}
			</ul>
		</div>
	`
}

// Helper function to render an enemy
function Enemy(enemy: Boss) {
	return html`
		<div class="Enemy">
			<div class="Enemy-avatar">
				<!-- Placeholder avatar instead of specific images -->
				<div class="placeholder-avatar">
					${enemy.name || enemy.constructor.name}
				</div>
			</div>
			
			${enemy.health && enemy.maxHealth ? Meter({
				type: 'health',
				value: enemy.health,
				max: enemy.maxHealth,
				potentialValue: 0,
				spell: undefined,
			}) : null}
		</div>
	`
}

export function UI(game: GameLoop) {
	const player = game.player
	if (!player) return html`Woops, no player to heal the party...`

	function handleShortcuts({key}: {key: string}) {
		if (key === '1') player.castSpell('Heal')
		if (key === '2') player.castSpell('Flash Heal')
		if (key === '3') player.castSpell('Greater Heal')
		if (key === '4') player.castSpell('Renew')
		if (key === 'a' || key === 's' || key === 'd' || key === 'w' || key === 'Escape') {
			actions.interrupt(game)
		}
	}

	const spell = player.lastCastSpell
	const timeSinceCast = game.elapsedTime - player.lastCastTime

	return html`
		<div class="Game Debug" onkeyup=${handleShortcuts} tabindex="0">
			<!-- Game over state -->
			${game.gameOver
				? html`
					<div class="GameOver">
						<h2>Game Over!</h2>
						<p>You survived for ${roundOne(game.elapsedTime / 1000)} seconds</p>
					</div>`
				: null
			}

			<!-- Enemy section -->
			<div class="Enemies">
				${game.enemies.map(Enemy)}
			</div>

			<!-- Party section -->
			<div class="PartyGroup">
				<div class="FloatingCombatText"></div>
				${game.party.map(member => PartyMember(member, spell))}
			</div>

			<!-- Player UI -->
			<div class="Player">
				<div class="CastBar" style="min-height: 2.5rem">
					${spell 
						? html`
							<p>Casting ${spell.name} ${roundOne(timeSinceCast / 1000)}</p>
							${Meter({type: 'cast', value: timeSinceCast, max: spell.delay})}
						` 
						: null
					}
				</div>

				<div class="ResourceBars">
					<p>Mana</p>
					${Meter({type: 'mana', value: player.mana, max: player.baseMana})}
				</div>
			</div>

			<!-- Action Bar -->
			<div class="ActionBar">
				${Object.keys(player.spellbook).length > 0
					? Object.keys(player.spellbook).map((name, index) =>
						SpellIcon(game, name, index + 1)
					)
					: ''
				}
			</div>

			<!-- Debug Monitor -->
			${Monitor(game)}

			<!-- Combat Log -->
			<div class="Combatlog" onclick=${(event: Event) => 
				(event.currentTarget as Element).classList.toggle('sticky')
			}>
				<ul class="Log Log--scroller"></ul>
			</div>
		</div>
	`
}