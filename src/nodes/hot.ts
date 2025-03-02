import {Task} from 'vroum'
import {fct} from '../components/floating-combat-text'
import {clamp, log} from '../utils'
import {Tank} from './tank'

export class HOT extends Task {
	name = 'Periodic Heal'
	heal = 0
	interval = 3000
	repeat = 5

	constructor(public parent: Tank) {
		super(parent)
	}

	mount() {
		log('hot:mount')
	}

	tick() {
		const tank = this.parent
		const heal = this.heal / this.repeat
		const amount = clamp(tank.health + heal, 0, tank.baseHealth)
		// const scaledHealing = tank.health + this.heal / this.repeat / this.Loop.deltaTime
		tank.health = amount
		fct(`+${heal}`)
		log('<PeriodicHeal>:tick', this.cycles, this.repeat, this.heal, heal)
	}
	destroy() {
		log('hot:destroy')
	}
}
