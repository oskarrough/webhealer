import {html} from 'uhtml'
import {WebHealer} from '../game-loop'
import Audio from '../nodes/audio'
import {logger} from '../combatlog'

export default function Menu(game: WebHealer) {
	const audio = game.find(Audio)!

	function start() {
		logger.info('start new game')
		game.stop()
		game.gameOver = false

		game.start()
		document.documentElement.classList.add('is-starting')
		// animation that hides the menu lasts around 1300ms

		// reveal the playing ui
		setTimeout(() => {
			document.documentElement.classList.add('is-mounted')
		}, 600)
	}

	//@ts-ignore
	const handleChange = ({target}) => {
		audio.disabled = !target.checked
		if (audio.element) audio.element.volume = target.checked ? 0.5 : 0
	}

	return html`
		<div class="Menu">
			<h1>Web Healer</h1>
			<p style="font-size: 2vw">How long can you keep the tank alive?</p>
			<nav>
				<button class="Spell Button" type="button" onClick=${() => start()}>
					Enter dungeon
				</button>
			</nav>
			<label> <input type="checkbox" onchange=${handleChange} checked /> Sound </label>
		</div>

		<nav class="IngameMenu">
			<p hidden>dsa ${game.paused ? 'paued' : 'playing'}</p>
			<button class="Spell Button" type="button" onClick=${() => start()}>
				Reset
			</button>
			<button class="Spell Button" type="button" onClick=${() => game.play()}>
				Play
			</button>
			<button class="Spell Button" type="button" onClick=${() => game.pause()}>
				Pause
			</button>
		</nav>
	`
}
