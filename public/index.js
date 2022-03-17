import {
	html,
	render,
	Component,
} from './web_modules/htm/preact/standalone.module.js'
// import produce from '../web_modules/immer.js'
// import App from '../components/app.js'
import FpsCounter from './fps.js'

const spells = {
	heal: {
		name: 'Heal',
		heal: 30, // 307-353
		cost: 155,
		cast: 3000,
	},
	renew: {
		name: 'Renew',
		heal: 45,
		cost: 30,
		cast: 3000,
		duration: 15000 // ticks ever 3 secs?
	},
}

function CooldownBar(props) {
	return html`<div>global cooldown ${props.gcd}</div>`
}

export default class App extends Component {
	cast(spellName) {
		console.log('casting', spellName)
		const spell = spells[spellName]
		this.setState({gcd: 1500})

		//
		setTimeout(() => {
			this.setState({gcd: 0})
		}, spell.cast)

	}
	render(props, state) {
		return html`
			<h1>Nuts</h1>
				<button onClick=${() => this.cast('heal')}>Cast Heal</button>
			<${FpsCounter} fps=${60}></${FpsCounter}>
			<${CooldownBar} gcd=${state.gcd}></${CooldownBar}>
		`
	}
}

const rootEl = document.querySelector('#root')
render(html` <${App} /> `, rootEl)
