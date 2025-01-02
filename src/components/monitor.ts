import {Loop} from 'vroum'
import {html, roundOne} from '../utils'
import {Player} from '../nodes/player'
import {GlobalCooldown} from '../nodes/global-cooldown'

export function Monitor(loop: Loop) {
	const player = loop.query(Player)!
	const fps = loop.deltaTime > 0 ? Math.round(1000 / loop.deltaTime) : 0

	return html` <ul class="Log Monitor">
		<li>Time: ${roundOne(loop.elapsedTime / 1000)}s</li>
		<li>FPS: ${fps}</li>
		<li>GCD: ${player.query(GlobalCooldown) ? 'on' : 'off'}</li>
	</ul>`
}
