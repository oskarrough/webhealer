import {html} from '../utils'
/* import * as spells from '../nodes/spells' */
/* import {roundOne} from '../utils' */
import {WebHealer} from '../game-loop'
import Player from '../nodes/player'

export default function SpellIcon(
	game: WebHealer,
	spellName: string,
	shortcut: string | number
) {
	const player = game.find(Player)!
	const spell = new player.spellbook[spellName]()
	if (!spell) throw new Error('no spell' + spellName)

	// Readable cast time
	/* const beingCast = player.lastCastSpell instanceof spells.Spell */
	const realCastTime = player.loop.timeSince(player.lastCastTime)
	/* const castTime = beingCast */
	/* 	? roundOne(realCastTime / 1000) */
	/* 	: roundOne(spell.delay / 1000) */

	// Circular-progress UI
	const gcdPercentage = realCastTime / game.gcd
	const angle = gcdPercentage ? (1 - gcdPercentage) * 360 : 0

	return html`
		<button
			class="Spell"
			onClick=${() => player.castSpell(spellName)}
			.disabled=${game.gameOver}
		>
			<div class="Spell-inner">
				<h3>${spell.name}</h3>
				<p>
					<span>🔵 ${spell.cost} </span>
					<span>🟢 ${spell.heal}</span>
					<span>⏲ ${spell.delay / 1000}s</span>
				</p>
			</div>
			<div class="Spell-gcd" style=${`--progress: ${angle}deg`}></div>
			${shortcut ? html`<small class="Spell-shortcut">${shortcut}</small>` : html``}
		</button>
	`
}
