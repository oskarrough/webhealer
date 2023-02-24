import {html} from '../utils'
import * as spells from '../nodes/spells'
import {roundOne} from '../utils'
import {WebHealer} from '../game-loop'
import Player from '../nodes/player'

export default function SpellIcon(game: WebHealer, spellName: string, shortcut: string) {
	const spell = new spells[spellName]() as spells.Spell
	if (!spell) throw new Error('no spell' + spellName)

	const player = game.find('Player') as Player

	// Readable cast time
	const beingCast = player.lastCastSpell instanceof spells.Spell
	const castTime = beingCast
		? roundOne(player.castTime / 1000)
		: roundOne(spell.delay / 1000)

	// Circular-progress UI
	const gcdPercentage = player.castTime / game.gcd
	const angle = gcdPercentage ? (1 - gcdPercentage) * 360 : 0

	return html`
		<button class="Spell" onClick=${() => player.castSpell(spellName)}>
			<div class="Spell-inner">
				${spell.name}<br />
				<span hidden>${castTime}s<br /></span>
				<small>
					🔵 ${spell.cost} 🟢 ${spell.heal}<br />
					⏲ ${spell.delay / 1000}s
				</small>
			</div>
			<div class="Spell-gcd" style=${`--progress: ${angle}deg`}></div>
			${shortcut ? html`<small class="Spell-shortcut">${shortcut}</small>` : html``}
		</button>
	`
}
