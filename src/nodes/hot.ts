import {Task} from 'vroum'
import Tank from './tank'
import {fct} from '../components/floating-combat-text'
import {clamp, log} from '../utils'

export default class HealOverTime extends Task {
	name = 'Periodic Heal'
	heal = 0
	interval = 3000
	repeat = 5

	mount() {
		log('hot:mount')
	}
	tick() {
		const tank = this.Loop.query(Tank)!
		const heal = this.heal / this.repeat
		const amount = clamp(tank.health + heal, 0, tank.baseHealth)
		// const scaledHealing = tank.health + this.heal / this.repeat / this.loop.deltaTime
		tank.health = amount
		fct(`+${heal}`)
		log('<PeriodicHeal>:tick', this.cycles, this.repeat, this.heal, heal)
	}
	destroy() {
		log('hot:destroy')
	}
}
