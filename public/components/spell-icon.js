// @ts-ignore
const {html} = window.uhtml
import * as actions from '../actions.js'
import spells from '../spells.js'
import {roundOne} from '../utils.js'

export default function SpellIcon({game, spellId, shortcut, runAction}) {
	const spell = spells[spellId]
	if (!spell) throw new Error('no spell with id ' + spellId)

	const player = game.find('Player')

	// Readable cast time
	const beingCast = player.casting?.spell?.id === spellId
	const castTime = beingCast
		? roundOne(player.castTime / 1000)
		: roundOne(spell.cast / 1000)

	// Circular-progress UI
	const gcdPercentage = player.castTime / game.gcd
	const angle = gcdPercentage ? (1 - gcdPercentage) * 360 : 0

	return html`
		<button class="Spell" onClick=${() => runAction(actions.castSpell, {spellId})}>
			<div class="Spell-inner">
				${spell.name}<br />
				<span hidden>${castTime}s<br /></span>
				<small>
					🔵 ${spell.cost} 🟢 ${spell.heal}<br />
					⏲ ${spell.cast / 1000}s
				</small>
			</div>
			<div class="Spell-gcd" style=${`--progress: ${angle}deg`}></div>
			${shortcut ? html`<small class="Spell-shortcut">${shortcut}</small>` : html``}
		</button>
	`
}
