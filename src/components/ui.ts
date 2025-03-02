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
import {HOT} from '../nodes/hot'
import {Character} from '../nodes/character'

register()

// Helper function to render a party member
function PartyMember(member: Character, spell: Spell | undefined) {
	// Get basic character information from health node
	const health = member.health.current;
	const maxHealth = member.health.max;
	const id = member.id;
	const isCaster = member.hasMana;
	
	// Get effects if this is a tank
	const effects: HOT[] = member instanceof Tank ? member.effects : [];

	return html`
		<div class="PartyMember" data-member-id=${id}>
			<div class="PartyMember-avatar">
				${member.constructor.name}
			</div>

			${Meter({
				type: 'health',
				value: health,
				max: maxHealth,
				potentialValue: spell?.heal,
				spell: spell,
			})}
			
			${isCaster && member.mana ? Meter({
				type: 'mana',
				value: member.mana.current,
				max: member.mana.max,
				potentialValue: 0,
				spell: undefined,
			}) : null}

			${member instanceof Tank && effects.length
				? html`<ul class="Effects">${effects.map(EffectIcon)}</ul>`
				: null
			}
		</div>
	`
}

// Helper function to render an enemy
function Enemy(enemy: Boss) {
	return html`
		<div class="Enemy" data-enemy-id=${enemy.id}>
			<div class="Enemy-avatar">
				${enemy.name || enemy.constructor.name}
			</div>

			${Meter({
				type: 'health',
				value: enemy.health.current,
				max: enemy.health.max,
				potentialValue: 0,
				spell: undefined,
			})}
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

	const spell = player.spell
	const timeSinceCast = game.elapsedTime - player.lastCastTime

	return html`
		<div class="Game Debug" onkeyup=${handleShortcuts} tabindex="0">
			${game.gameOver
				? html`
					<div class="GameOver">
						<h2>Game Over!</h2>
						<p>You survived for ${roundOne(game.elapsedTime / 1000)} seconds</p>
					</div>`
				: null
			}

			<div class="Enemies">
				${game.enemies.map(Enemy)}
			</div>

			<div class="PartyGroup">
				<div class="FloatingCombatText"></div>
				${game.party.map(member => PartyMember(member, spell))}
			</div>

			<div class="CastingInfo">
				${spell 
					? html`
						<div class="CastBar" style="min-height: 2.5rem">
							<p>Casting ${spell.name} ${roundOne(timeSinceCast / 1000)}</p>
							${Meter({type: 'cast', value: timeSinceCast, max: spell.delay})}
						</div>
					` 
					: null
				}
			</div>

			<div class="ActionBar">
				${Object.keys(player.spellbook).length > 0
					? Object.keys(player.spellbook).map((name, index) =>
						SpellIcon(game, name, index + 1)
					)
					: ''
				}
			</div>

			${Monitor(game)}

			<div class="Combatlog" onclick=${(event: Event) =>
				(event.currentTarget as Element).classList.toggle('sticky')
			}>
				<ul class="Log Log--scroller"></ul>
			</div>
		</div>
	`
}
