import {html} from '../utils.js'
import {roundOne} from '../utils.js'
import Bar from './bar.js'

export default function CastBar(game) {
	const player = game.find('Player')

	if (!player.lastCastTime) return

	const spell = player.lastCastSpell
	const timeCast = game.elapsedTime - player.lastCastTime || 0

	return html`
		Casting ${spell.name} ${roundOne(timeCast / 1000)}
		${Bar({
			type: 'cast',
			value: spell.delay - timeCast,
			max: spell.delay,
		})}
	`
}
