// import produce from '../web_modules/immer.js'
// import {html, render, Component} from './web_modules/htm/preact/standalone.module.js'

class Countdown extends Component {
	componentDidMount() {
		console.log('countdown')
		this.setState({x: Number(this.props.number)})
		var timer = setInterval(() => {
			if (this.state.x === 0) {
				clearInterval(timer)
			} else {
				this.setState({x: this.state.x - 1})
			}
			log(this.state.x)
		}, 16)
	}
	render(props, state) {
		console.log('countdown render')
		return html`<div>
			<div>countdown ${props.number} / ${state.x}</div>
		</div>`
	}
}

export default class App extends Component {
	constructor() {
		super()
		this.state = {
			gcd: 0,
			castTimer: 0,
		}
	}
	render(props, state) {
		return html`
			<h1>Web Healer</h1>
			<!-- <${FpsCounter} fps=${16}></${FpsCounter}> -->
			<!-- <${CooldownBar} gcd=${state.gcd}></${CooldownBar}> -->
			cast timer: ${state.castTimer}
			<!-- <${Countdown} number=${state.castTimer} /> -->
			<hr />
			<${Spell} spellId="heal" app=${this} />
			<${Spell} spellId="renew" app=${this} />
		`
	}
}


let stopMain

function pauseGame() {
	window.cancelAnimationFrame(stopMain)
}

// const debugEl = document.querySelector('#debug')
// function what(event) {
// 	console.log(event)
// }
// window.uhtml.render(
// 	debugEl,
// 	window.uhtml.html`<div tabindex="0" onclick=${what} onkeyup=${what}>hey</div>`
// )


	// function toggleGame() {
	// 	if (isPaused) {
	// 		isPaused = false
	// 		requestAnimationFrame(gameLoop)
	// 	} else {
	// 		window.cancelAnimationFrame(window.webhealer.timer)
	// 		isPaused = true
	// 	}
	// }
			// <button onClick=${toggleGame}>${isPaused ? 'Resume' : 'Pause'}</button>
