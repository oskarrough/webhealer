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


		if (Number(this.textContent) > 950) this.classList.add('crit')

		if (this.textContent[0] === '-') {
			this.classList.add('damage')
			this.style.left = `${randomIntFromInterval(5, 10)}rem`
		} else {
			this.style.left = `${randomIntFromInterval(-5, 5)}rem`
		}

		this.addEventListener('animationend', this.remove)
	}
}

export function register() {
	customElements.define('floating-combat-text', FloatingCombatText)
}

