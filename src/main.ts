import {html, render} from 'uhtml'
import { logger } from './combatlog'
import {WebHealer} from './game-loop'
import './style.css'

const game = new WebHealer()
game.element = document.querySelector('#root')
game.start()

// @ts-ignore
window.webhealer = game

function start() {
	logger.info('start new game')
	game.stop()
	game.gameOver = false
	game.start()
}

const splashEl = document.querySelector('#splash')
const splash = () => html`
	<header class="Splash">
		<h1>Web Healer</h1>
		<p>How long can you keep the tank alive?</p>
		<button type="button" onClick=${start}>Reset</button>
		<button type="button" onClick=${() => game.play()}>Play</button>
		<button type="button" onClick=${() => game.pause()}>Pause</button>
	</header>
`
if (splashEl) render(splashEl, splash)
