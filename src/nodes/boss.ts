import {Node, Task} from 'vroum'
import {html, log, randomIntFromInterval} from '../utils'
import {Tank} from './tank'

/**
 * This is an example boss that has three different attacks.
 */
export class Boss extends Node {
	image = 'nak.webp'

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

		if (!target) return

		target.health = target.health - damage
		log(`tank took ${damage} damage`)

		const targetElement = document.querySelector('.PartyMember img')
		if (targetElement) {
			targetElement.classList.add('is-takingDamage')
			const animation = targetElement.animate(
				[
					{ transform: 'translate(0, 0)', filter: 'none' },
					{
						transform: `translate(${randomIntFromInterval(-2, 2)}px, ${randomIntFromInterval(-2, 2)}px)`,
						filter: 'brightness(0.5)'
					},
					{ transform: 'translate(0, 0)', filter: 'none' }
				],
				{
					duration: 200,
					easing: 'ease-in-out'
				}
			);

			animation.onfinish = () => {
				targetElement.classList.remove('is-takingDamage');
			};
		}

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
