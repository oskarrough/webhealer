import {Loop, Node} from './web_modules/vroum.js'
// const {uhtml} = window
const {render} = window.uhtml
import UI from './ui.js'
import * as actions from './actions.js'
import {clamp} from './utils.js'

class Player extends Node {
	// keep track of Player mana
	mana = 400
	baseMana = 500

	/** @prop {Boolean | {time: Number, spell: Spell}} */
	casting = false

	get castTime() {
		return this.parent.elapsedTime - this.casting?.time
	}

	/**
	 * Global cooldown is active X ms after finishing a spell cast.
	 * @returns {Boolean} */
	get gcd() {
		return this.castTime > 1500
	}

	tick() {
		const now = performance.now()
		const {casting} = this

		// Finish spell
		if (this.casting) {
			const done = this.parent.elapsedTime - casting.time >= casting.spell.cast
			if (done) {
				actions.applySpell(this.parent, casting.spell)
				this.casting = false
			}
		}

		// Regenerate mana after X seconds
		const timeSinceLastCast = this.parent.elapsedTime - (casting?.time || 0)
		if (timeSinceLastCast > 2000) {
			this.mana = clamp(this.mana + 0.3, 0, this.baseMana)
		}
	}

	// owns a list of Spell
	// spells = []
	// has a method to start casting spells
}

class Tank extends Node {
	// keep track of Tank health
	health = 500
	baseHealth = 500
	// owns a list of Effects
	effects = []
	// apply different kind of DamageEffect to Boss

	tick() {
		if (this.health > 0) {
			this.health = this.health - 0.2
		} else {
			this.health = 0
			this.parent.gameOver = true
		}
	}
}

// class Boss extends Node {
// 	// keep track of Boss health
// 	// apply different kind of DamageEffect to Tank
// }

// class Spell extends Node {
// 	// keep track of spell casting state
// 	// list spell properties (heal amount, duration, etc)
// 	// apply HealEffect to Tank when cast
// }

// class HealEffect extends Schedule {
// 	// heal target on a given schedule
// 	// can destroy itself when done
// }

// class DamageEffect extends Schedule {
// 	// damage target on a given schedule
// 	// can destroy itself when done
// }

export class WebHealer extends Loop {
	ticks = 0

	beforeMount() {
		this.add(new Player())
		this.add(new Tank())
	}
	mount() {
		console.log('mount', this)
		// runAction(actions.bossAttack, {timing: {delay: 30, repeat: Infinity}, amount: 1})
		// runAction(actions.bossAttack, {
		// 	timing: {delay: 1000, duration: 5, repeat: Infinity},
		// 	amount: 20,
		// })
		// runAction(actions.bossAttack, {timing: {delay: 7000, repeat: Infinity}, amount: 200})
	}
	tick() {
		this.ticks = this.ticks + 1

		if (this.gameOver) {
			console.log('game over')
			this.stop()
		}

		render(this.element, UI(this))
	}

	/**
	 *
	 * @param {Function} action
	 * @param {*} props
	 */
	runAction(action, props) {
		console.log('runAction()', action.name, props)
		const result = action(this, props)
		console.log('result', result)
	}
}
