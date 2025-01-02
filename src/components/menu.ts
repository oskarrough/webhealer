import {html} from 'uhtml'
import {WebHealer} from '../web-healer'
import {Audio} from '../nodes/audio'
import {logger} from '../combatlog'
import {Boss} from '../nodes/boss'
import {Tank} from '../nodes/tank'

export function Menu(game: WebHealer) {
	const audio = game.query(Audio)!

	function start() {
		logger.info('start new game')
		game.stop()
		game.gameOver = false
		game.start()
		document.documentElement.classList.add('is-started')
	}

	//@ts-ignore
	const handleChange = ({target}) => {
		// @todo audio doesn't exist because dungeon wasn't started..
		if (!audio) return
		audio.disabled = !target.checked
		if (audio.element) audio.element.volume = target.checked ? 0.5 : 0
	}

	return html`
		<div class="Menu">
			<h1>Web Healer</h1>
			<p style="font-size: 2vw">How long can you keep the tank alive?</p>
			<nav>
				<button class="Spell Button" type="button" onclick=${() => start()}>
					Enter dungeon
				</button>
			</nav>
			<label> <input type="checkbox" onchange=${handleChange} checked /> Sound </label>
		</div>

		<nav class="IngameMenu">
			<p hidden>${game.paused ? 'paued' : 'playing'}</p>
			<button class="Spell Button" type="button" onclick=${() => window.location.reload()}>
				Reset
			</button>
			<button class="Spell Button" type="button" onclick=${() => game.play()}>
				Play
			</button>
			<button class="Spell Button" type="button" onclick=${() => game.pause()}>
				Pause
			</button>
		</nav>
	`
}
