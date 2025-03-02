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
import {Player} from '../nodes/player'
import {Warrior} from '../nodes/dps'
import {Character} from '../nodes/character'

// Create a union type for all character types
type GameCharacter = Player | Tank | Warrior | Boss

register()

// Unified component to render any character (party member or enemy)
function CharacterComponent(
	character: GameCharacter,
	spell: Spell | undefined,
	player: Player,
	type: 'party' | 'enemy',
) {
	// Get basic character information from health node
	const health = character.health.current
	const maxHealth = character.health.max
	const id = character.id
	const isPartyMember = type === 'party'
	const isEnemy = type === 'enemy'

	// Check if this character is the current target
	const isCurrentTarget = player.currentTarget === character

	// Get effects directly from the character
	const effects: HOT[] = character.effects ? Array.from(character.effects) : []

	// Name to display
	const displayName =
		isEnemy && character instanceof Boss && character.name
			? character.name
			: character.constructor.name

	return html`
		<div
			class=${`Character ${isPartyMember ? 'PartyMember' : 'Enemy'} ${isCurrentTarget ? 'Character--targeted' : ''}`}
			data-character-id=${id}
			onclick=${() => {
				// Set this character as the player's target when clicked
				player.setTarget(character)
			}}
		>
			<div class="Character-avatar">${displayName} ${isCurrentTarget ? '✓' : ''}</div>

			${Meter({
				type: 'health',
				value: health,
				max: maxHealth,
				// Only show potential healing on the current target for party members
				potentialValue: isCurrentTarget && isPartyMember && spell ? spell.heal : 0,
				spell: isPartyMember ? spell : undefined,
			})}
			${'mana' in character && character.mana
				? Meter({
						type: 'mana',
						value: character.mana.current,
						max: character.mana.max,
						potentialValue: 0,
						spell: undefined,
					})
				: null}
			${effects.length > 0
				? html`<ul class="Effects">
						${effects.map(EffectIcon)}
					</ul>`
				: null}
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
				? html` <div class="GameOver">
						<h2>Game Over!</h2>
						<p>You survived for ${roundOne(game.elapsedTime / 1000)} seconds</p>
						<button onclick=${() => location.reload()}>Play Again</button>
					</div>`
				: null}

			<div class="Enemies">
				${game.enemies.map((enemy) => CharacterComponent(enemy, spell, player, 'enemy'))}
			</div>

			<div class="PartyGroup">
				<div class="FloatingCombatText"></div>
				${game.party.map((member) => CharacterComponent(member, spell, player, 'party'))}
			</div>

			<div class="CastingInfo">
				${spell
					? html`
							<div class="CastBar" style="min-height: 2.5rem">
								<p>Casting ${spell.name} ${roundOne(timeSinceCast / 1000)}</p>
								${Meter({type: 'cast', value: timeSinceCast, max: spell.delay})}
							</div>
						`
					: null}
			</div>

			<div class="ActionBar">
				${Object.keys(player.spellbook).length > 0
					? Object.keys(player.spellbook).map((name, index) =>
							SpellIcon(game, name, index + 1),
						)
					: ''}
			</div>

			${Monitor(game)}

			<div
				class="Combatlog"
				onclick=${(event: Event) =>
					(event.currentTarget as Element).classList.toggle('sticky')}
			>
				<ul class="Log Log--scroller"></ul>
			</div>
		</div>
	`
}
