import {Task} from 'vroum'
import {fct} from '../components/floating-combat-text'
import {log} from '../utils'
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

		// Apply healing directly to tank's health node
		const actualHeal = tank.health.heal(heal)

		// Show healing in UI
		fct(`+${actualHeal}`)
		log('<PeriodicHeal>:tick', this.cycles, this.repeat, this.heal, actualHeal)
	}

	destroy() {
		log('hot:destroy')
	}
}
