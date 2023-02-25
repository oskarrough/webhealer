import {Task} from 'vroum'
import {WebHealer} from '../game-loop'
import {Spell} from './spells'

export default class Tank extends Task {
	// keep track of Tank health
	health = 3000
	baseHealth = 3000

	// owns a list of Effects
	effects: Spell[] = []

	// apply different kind of DamageEffect to Boss
	tick = () => {
		if (this.health < 1) {
			this.health = 0
			const game = this.loop as WebHealer
			game.gameOver = true
		}
	}
}
