import {Task} from 'vroum'
import {GameLoop} from './game-loop'
import {HOT} from './hot'
import {createId} from '../utils'

export class Tank extends Task {
	// Unique identifier for each tank
	readonly id: string

	// keep track of Tank health
	health = 4000
	baseHealth = 4000
	
	// Array to store active effects on the tank
	effects: HOT[] = []

	constructor(public parent: GameLoop) {
		super(parent)
		this.id = createId()
	}

	shouldEnd() {
		if (this.health < 1) {
			this.health = 0
			this.parent.gameOver = true
			return true
		}
		return super.shouldEnd()
	}
	
	// Method to add an effect to the tank
	addEffect(effect: HOT) {
		this.effects.push(effect)
	}
}
