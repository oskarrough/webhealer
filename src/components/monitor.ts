import {html} from '../utils'
import {roundOne} from '../utils'

export default function Monitor(loop) {
	const player = loop.find('Player')
	const fps = loop.deltaTime > 0 ? Math.round(1000 / loop.deltaTime) : 0

	return html` <ul class="Monitor">
		<li>${loop.running ? 'Started' : 'Stopped'}</li>
		<li>${loop.paused ? 'Paused' : 'Playing'}</li>
		<li>FPS: ${fps}</li>
		<li>Time: ${roundOne(loop.elapsedTime / 1000)}s</li>
		<li>GCD: ${player.find('GlobalCooldown') ? 'YES' : 'NO'}</li>
	</ul>`
}
