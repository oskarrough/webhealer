import {html} from '../utils'
import {GameLoop} from '../nodes/game-loop'

export function SpellIcon(game: GameLoop, spellName: string, shortcut: string | number) {
	const player = game.player
	const Spell = player.spellbook[spellName]

	if (!Spell) throw new Error('no spell' + spellName)

	// console.log('here', spell.cost)

	// Readable cast time
	/* const beingCast = player.lastCastSpell instanceof spells.Spell */
	const realCastTime = (game?.elapsedTime || 0) - player.lastCastTime
	/* const castTime = beingCast */
	/* 	? roundOne(realCastTime / 1000) */
	/* 	: roundOne(spell.delay / 1000) */

	// Circular-progress UI
	const gcdPercentage = realCastTime / game.gcd
	const angle = gcdPercentage ? (1 - gcdPercentage) * 360 : 0

	return html`
		<button
			class="Spell"
			onclick=${() => player.castSpell(spellName)}
			.disabled=${game.gameOver}
		>
			<div class="Spell-inner">
				<h3>${Spell.name}</h3>
				<p>
					<span>🔵 ${Spell.cost} </span>
					<span>🟢 ${Spell.heal}</span>
					<span>⏲ ${Spell.delay / 1000}s</span>
				</p>
			</div>
			<div class="Spell-gcd" style=${`--progress: ${angle}deg`}></div>
			${shortcut ? html`<small class="Spell-shortcut">${shortcut}</small>` : html``}
		</button>
	`
}
