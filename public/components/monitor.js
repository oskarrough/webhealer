const {html} = window.uhtml
import {roundOne} from '../utils.js'

export default function Monitor(state) {
	const {castTime, gcd, elapsedTime, ticks} = state.timers

	return html` <ul class="Monitor">
		<li>FPS: ${Math.round(state.config.fps)}</li>
		<li>Ticks: ${ticks}</li>
		<li>Time: ${roundOne(elapsedTime / 1000)}s</li>
		<li title="Global cooldown">GCD: ${gcd && roundOne(gcd / 1000)}</li>
		<li>Cast: ${castTime > 0 ? roundOne(castTime / 1000) + 's' : ''}</li>
		<li>Spell: ${state.castingSpellId}</li>
	</ul>`
}
