import {Node, Task} from 'vroum'
import {randomIntFromInterval} from '../utils'
import Tank from './tank'
import {html, log} from '../utils'

/**
 * This is an example boss that has three different attacks.
 */
export default class Boss extends Node {
	build() {
		const smallAttack = DamageEffect.new({damage: () => randomIntFromInterval(2, 10)})

		const mediumAttack = DamageEffect.new({delay: 3000, interval: 4000})
		mediumAttack.damage = () => randomIntFromInterval(400, 750)

		const hugeAttack = DamageEffect.new({delay: 6000, interval: 8000})
		hugeAttack.damage = () => randomIntFromInterval(1100, 1500)

		return [smallAttack, mediumAttack, hugeAttack]
	}
}

class DamageEffect extends Task {
	repeat = Infinity
	delay = 0 // delay the first cycle
	duration = 0 // tick once every cycle
	interval = 1500 // wait between cycles

	tick = () => {
		// Deal damage to our hardcoded tank target
		const damage = this.damage()
		const target = this.Loop.query(Tank)!
		target.health = target.health - damage
		log(`boss took ${damage} damage`)

		// Create a floating combat text element for the UI
		const fct = html`<floating-combat-text>-${damage}</floating-combat-text>`.toDOM()
		const container = document.querySelector('.FloatingCombatText')!
		container.appendChild(fct)
	}

	/* Overwrite this method to return the damage you need */
	damage() {
		return 0
	}
}
