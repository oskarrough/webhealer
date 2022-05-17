const {html, render} = window.uhtml
import {WebHealer} from './game-loop.js'

const rootEl = document.querySelector('#root')
const wh = WebHealer(rootEl)

const splashEl = document.querySelector('#splash')
const splash = () => html`
	<header class="Header">
		<h1>Web Healer</h1>
		<p>How long can you keep the tank alive?</p>
		<button onClick=${() => wh.start()}>Start</button>
		<button onClick=${() => wh.stop()}>Stop</button>
		<button onClick=${() => wh.restart()}>Restart</button>
	</header>
`
render(splashEl, splash)

// webHealer.start()
// webHealer.stop()
// webHealer.restart()
