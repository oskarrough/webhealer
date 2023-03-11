import {clamp, log} from '../utils'
import Tank from './tank'
import {WebHealer} from '../game-loop'
import {Task} from 'vroum'

export default class PeriodicHeal extends Task {
	name = 'Periodic Heal'
	// heal = 970 // copy paste from Renew
	// interval = 3000
	// repeat = 5

	mount() {
		log('hot:mount')
	}
	tick = () => {
		log('renew<PeriodicHeal>:tick', this.cycles, this.repeat)

		const loop = this.loop as WebHealer
		const tank = this.loop.find(Tank)!

		const scaledHealing = tank.health + this.heal / this.repeat / loop.deltaTime
		const amount = clamp(scaledHealing, 0, tank.baseHealth)
		tank.health = amount

		const container = document.querySelector('.FloatingCombatText')!
		const fct = document.createElement('floating-combat-text')
		fct.textContent = String(scaledHealing)
		container.appendChild(fct)
	}
	destroy() {
		log('hot:destroy')
	}
}
