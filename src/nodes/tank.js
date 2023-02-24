import {Task} from 'vroum'

export default class Tank extends Task {
	// keep track of Tank health
	health = 3000
	baseHealth = 3000

	// owns a list of Effects
	effects = []

	// apply different kind of DamageEffect to Boss
	tick = () => {
		if (this.health < 1) {
			this.health = 0
			this.parent.gameOver = true
		}
	}
}
