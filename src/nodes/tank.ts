import {Task} from 'vroum'
import {GameLoop} from './game-loop'

export class Tank extends Task {
	// keep track of Tank health
	health = 4000
	baseHealth = 4000

	constructor(public parent: GameLoop) {
		super(parent)
	}

	shouldEnd() {
		if (this.health < 1) {
			this.health = 0
			this.parent.gameOver = true
			return true
		}
		return super.shouldEnd()
	}
}
