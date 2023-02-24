import {html, render} from './utils.js'
import {WebHealer} from './game-loop.js'

const game = new WebHealer()
game.element = document.querySelector('#root')
game.start()
window.webhealer = game

const splashEl = document.querySelector('#splash')
const splash = () => html`
	<header class="Header">
		<h1>Web Healer</h1>
		<p>How long can you keep the tank alive?</p>
		<button onClick=${() => game.start()}>Start</button>
		<button onClick=${() => game.stop()}>Stop</button>
		<button onClick=${() => game.play()}>Play</button>
		<button onClick=${() => game.pause()}>Pause</button>
	</header>
`
render(splashEl, splash)
