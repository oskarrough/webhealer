const {html} = window.uhtml
import * as actions from '../actions.js'
import spells from '../spells.js'
import {roundOne} from '../utils.js'

export default function SpellIcon({game, state, spellId, shortcut, runAction}) {
	const spell = spells[spellId]
	if (!spell) throw new Error('no spell with id ' + spellId)

	const player = game.find('Player')

	// Readable cast time
	let castTime = roundOne(spell.cast / 1000)
	// ... we're currently casting this spell, use the state's cast time instead, which will be animated.
	if (state.lastSpellId === spellId) {
		castTime = roundOne(state.timers.castTime / 1000)
	}

	function onTap() {
		runAction(actions.castSpell, {spellId})
	}

	const gcd = game.elapsedTime - player.casting?.time
	const gcdPercentage = gcd / game.gcd
	const angle = gcdPercentage ? (1 - gcdPercentage) * 360 : 0

	return html`
		<button class="Spell" onClick=${onTap}>
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
