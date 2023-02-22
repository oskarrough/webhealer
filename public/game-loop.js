// @ts-ignore
const {render} = window.uhtml

import {Loop} from './web_modules/vroum.js'
import UI from './ui.js'
import {log} from './utils.js'
import newScheduler from './scheduler.js'

import Player from './player.js'
import Tank from './tank.js'
import Boss from './boss.js'

export class WebHealer extends Loop {
	scheduler = newScheduler()

	// Where the UI will be rendered.
	element = undefined

	// A global cooldown window that starts after each successful cast.
	// Spells can not be cast during global cooldown.
	gcd = 1500

	ticks = 0

	gameOver = false

	beforeMount() {
		this.add(new Player(), new Tank(), new Boss())
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
	 * Runs an "action" function from actions.js. All will receive the game object + props.
	 * Supports scheduling of actions.
	 * @param {Function} action
	 * @param {Object} props
	 * @param {Object} [props.timing]
	 * @returns {Void}
	 */
	runAction(action, props) {
		// wrap the passed in action with a scheduled one.
		if (!props?.timing) {
			log(`action:${action.name}`, props)
			return action(this, props)
		}

		const timing = props.timing
		delete props.timing

		const task = () => this.runAction(action, props)
		this.scheduler.register(task, timing)

		log(`action:${action.name}`, props)
		const result = action(this, props)

		if (typeof result === 'function') {
			result(this.runAction, this.scheduler, this)
		}
	}
}

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
