import {html} from '../web_modules/uhtml.js'
import {roundOne} from '../utils.js'

export default function Monitor(game) {
	const player = game.find('Player')

	return html` <ul class="Monitor">
		<li>${game.running ? 'Started' : 'Stopped'}</li>
		<li>${game.paused ? 'Paused' : 'Playing'}</li>
		<li>Ticks: ${game.ticks}</li>
		<li>Time: ${roundOne(game.elapsedTime / 1000)}s</li>
		<li>GCD: ${player.gcd}</li>
	</ul>`
}
