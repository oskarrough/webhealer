import {Node} from './web_modules/vroum.js'
import * as actions from './actions.js'
// import {clamp, log} from './utils.js'

export default class Tank extends Node {
	// keep track of Tank health
	health = 500
	baseHealth = 500
	// owns a list of Effects
	effects = []
	// apply different kind of DamageEffect to Boss

	mount() {
		const x = this.parent.runAction.bind(this.parent)
		x(actions.damage, {
			amount: 1,
			timing: {delay: 100, repeat: Infinity},
		})
		x(actions.damage, {
			amount: 20,
			timing: {delay: 1000, duration: 5, repeat: Infinity},
		})
		x(actions.damage, {timing: {delay: 7000, repeat: Infinity}, amount: 100})
	}

	tick() {
		if (this.health > 0) {
			// this.health = this.health - 0.2
		} else {
			this.health = 0
			this.parent.gameOver = true
		}

		actions.reduceTankEffects(this.parent)
	}
}
