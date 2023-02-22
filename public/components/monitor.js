// @ts-ignore
const {html} = window.uhtml
import {roundOne} from '../utils.js'

// const gui = new window.dat.GUI({name: 'WebHealer'})
// let firstRun = true

export default function Monitor(game) {
	const player = game.find('Player')

	// if (firstRun) {
	// 	gui.add(game, 'gcd', 0, 10000)
	// 	firstRun = false
	// }

	return html` <ul class="Monitor">
		<li>${game.running ? 'Started' : 'Stopped'}</li>
		<li>${game.paused ? 'Paused' : 'Playing'}</li>
		<li>Ticks: ${game.ticks}</li>
		<li>Time: ${roundOne(game.elapsedTime / 1000)}s</li>
		<li>GCD: ${player.gcd}</li>
	</ul>`
}
