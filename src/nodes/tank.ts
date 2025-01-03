import {Task} from 'vroum'
import {GameLoop} from './game-loop'

export class Tank extends Task {
	// keep track of Tank health
	health = 4000
	baseHealth = 4000

	// apply different kind of DamageEffect to Boss
	tick = () => {
		if (this.health < 1) {
			this.health = 0
			const game = this.Loop as GameLoop
			this.disconnect()
			game.gameOver = true
		}
	}
}
