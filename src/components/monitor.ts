import {html, roundOne} from '../utils'
import { GameLoop } from '../nodes/game-loop'

export function Monitor(loop: GameLoop) {
	const player = loop.player
	const fps = loop.deltaTime > 0 ? Math.round(1000 / loop.deltaTime) : 0

	return html` <ul class="Log Monitor">
		<li>Time: ${roundOne(loop.elapsedTime / 1000)}s</li>
		<li>FPS: ${fps}</li>
		<li>GCD: ${player.gcd ? 'on' : 'off'}</li>
	</ul>`
}
