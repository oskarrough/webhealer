const {html} = window.uhtml
import {roundOne} from '../utils.js'
// import * as dat from '../web_modules/dat.gui.min.js'

// const gui = new window.dat.GUI({name: 'WebHealer'})
// gui.add({name: 'Sam'}, 'name')
// gui.add({age: 321}, 'age', 0, 321)
// const folder1 = gui.addFolder('Flow field')
// gui.add(game, 'running')

export default function Monitor(game) {
	const player = game.find('Player')

	return html` <ul class="Monitor">
		<li>${game.running ? 'Started' : 'Stopped'}</li>
		<li>${game.paused ? 'Paused' : 'Playing'}</li>
		<li>Ticks: ${game.ticks}</li>
		<li>Time: ${roundOne(game.elapsedTime / 1000)}s</li>
		<li>GCD: ${player.gcd}</li>
		<br />
		<li>Cast: ${player.castTime > 0 ? roundOne(player.castTime / 1000) + 's' : ''}</li>
		<li>Spell: ${player.casting?.spell?.id}</li>
		<li>Last spellcast: ${player.casting?.time}</li>
	</ul>`
}
