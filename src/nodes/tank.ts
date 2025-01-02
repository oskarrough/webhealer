import {Task} from 'vroum'
import {WebHealer} from '../web-healer'

export class Tank extends Task {
	// keep track of Tank health
	health = 4000
	baseHealth = 4000

	// apply different kind of DamageEffect to Boss
	tick = () => {
		if (this.health < 1) {
			this.health = 0
			const game = this.Loop as WebHealer
			this.disconnect()
			game.gameOver = true
		}
	}
}
