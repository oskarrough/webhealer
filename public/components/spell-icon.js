import {html} from '../utils.js'
import * as spells from '../spells.js'
import {roundOne} from '../utils.js'

export default function SpellIcon(game, spellName, shortcut) {
	const spell = new spells[spellName]()
	if (!spell) throw new Error('no spell' + spellName)

	const player = game.find('Player')

	// Readable cast time
	const beingCast = player.lastCastSpell instanceof spells[spellName]
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
