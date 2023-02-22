// @ts-ignore
const {render} = window.uhtml

import {Loop, Node} from './web_modules/vroum.js'
import UI from './ui.js'
import * as actions from './actions.js'
import {clamp, log} from './utils.js'
import newScheduler from './scheduler.js'

class Player extends Node {
	// keep track of Player mana
	mana = 400
	baseMana = 500

	/** @prop {{time: Number, spell: Spell}} */
	casting = undefined

	get castTime() {
		return this.parent.elapsedTime - this.casting?.time
	}

	/**
	 * Global cooldown is active X ms after finishing a spell cast.
	 * @returns {Boolean} */
	get gcd() {
		return this.castTime > this.parent.gcd
	}

	tick() {
		const now = performance.now()
		const {casting} = this

		// Clear any spell that finished casting.
		if (this.casting && this.casting.spell.cast === 0) {
			log('apply effect')
			actions.applyTankEffects(this.parent)
		}

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

	mount() {
		// runAction(actions.damage, {timing: {delay: 30, repeat: Infinity}, amount: 1})
		// runAction(actions.damage, {
		// 	timing: {delay: 1000, duration: 5, repeat: Infinity},
		// 	amount: 20,
		// })
		// runAction(actions.damage, {timing: {delay: 7000, repeat: Infinity}, amount: 200})
	}

	tick() {
		if (this.health > 0) {
			this.health = this.health - 0.2
		} else {
			this.health = 0
			this.parent.gameOver = true
		}

		actions.reduceTankEffects(this.parent)
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
	scheduler = newScheduler()

	// A global cooldown window that starts after each successful cast.
	// Spells can not be cast during global cooldown.
	gcd = 1500

	// Not used for anything but good to know.
	ticks = 0

	beforeMount() {
		this.add(new Player())
		this.add(new Tank())
	}
	mount() {
		log('mount', this)
	}
	tick() {
		this.scheduler.sync(this.elapsedTime)

		this.ticks = this.ticks + 1

		if (this.gameOver) {
			log('game over')
			this.stop()
		}

		render(this.element, UI(this))
	}

	/**
	 *
	 * @param {Function} action
	 * @param {Object} props
	 * @returns {Void | function}
	 */
	runAction(action, props) {
		// wrap the passed in action with a scheduled one.
		if (props?.timing) {
			const timing = props.timing
			delete props.timing
			const task = (time) => this.runAction(action, props)
			this.scheduler.register(task, timing)
			return
		}

		log(`action:${action.name}`, props)

		const result = action(this, props)
		if (typeof result === 'function') {
			result(this.runAction, this.scheduler, this)
		}
	}
}
