import {randomIntFromInterval} from '../utils'

export class FloatingCombatText extends HTMLElement {
	connectedCallback() {
		/* const value = randomIntFromInterval(100, 2000) */
		/* const formattedNumber = */
		/* 	'+' + */
		/* 	new Intl.NumberFormat('de-DE', { */
		/* 		maximumFractionDigits: 0, */
		/* 	}).format(value) */
		/* this.textContent = this.textContent ? this.textContent : formattedNumber */
		this.textContent = String(Math.round(Number(this.textContent)))
		this.style.left = `${randomIntFromInterval(-5, 5)}rem`
		if (Number(this.textContent) > 950) this.classList.add('crit')
		this.addEventListener('animationend', this.remove)
	}
}

export function register() {
	customElements.define('floating-combat-text', FloatingCombatText)
}

// function autocombat() {
// 	setInterval(() => {
// 		const fct = document.createElement('floating-combat-text')
// 		containerEl.appendChild(fct)
// 	}, 1500)
// }

// autocombat()
