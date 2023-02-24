import {html} from '../utils.js'
import {roundOne} from '../utils.js'
import Bar from './bar.js'

export default function CastBar(game) {
	const player = game.find('Player')
	let spell = player.casting?.spell

	if (!spell) return

	const timeCast = game.elapsedTime - player.casting?.time

	return html`
		Casting ${spell.name} ${roundOne(timeCast / 1000)}
		${Bar({
			type: 'cast',
			value: spell.delay - timeCast,
			max: spell.delay,
		})}
	`
}
