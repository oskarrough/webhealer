import {Task} from 'vroum'
import {fct} from '../components/floating-combat-text'
import {log} from '../utils'
import {Character} from './character'

export class HOT extends Task {
	name = 'Periodic Heal'
	heal = 0
	interval = 3000
	repeat = 5

	constructor(public parent: Character) {
		super(parent)
	}

	mount() {
		// Add self to parent's effects when mounted
		this.parent.effects.add(this)
		log('hot:mount', this.name)
	}

	tick() {
		const character = this.parent
		const heal = this.heal / this.repeat

		// Apply healing directly to character's health node
		const actualHeal = character.health.heal(heal)

		// Show healing in UI
		fct(`+${actualHeal}`)
		log(`hot:${this.name}:tick`, this.cycles, this.repeat, this.heal, actualHeal)
	}

	destroy() {
		// Remove self from parent's effects when destroyed
		this.parent.effects.delete(this)
		log('hot:destroy', this.name)
	}
}
