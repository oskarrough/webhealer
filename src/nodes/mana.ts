import {Node, Task} from 'vroum'
import {clamp} from '../utils'
import {Player} from './player'
import {GameLoop} from './game-loop'

/**
 * Events emitted by the Mana node
 */
export const MANA_EVENTS = {
	CHANGE: 'mana:change',
	EMPTY: 'mana:empty',
	FULL: 'mana:full',
} as const

/**
 * Mana node with direct property access and event notifications
 * Can be attached to any caster character type
 */
export class Mana extends Node {
	max = 0
	current = 0

	manaRegen = new ManaRegen(this)

	constructor(
		public parent: Node,
		max: number = 100,
	) {
		super(parent)
		this.max = max
		this.current = max
	}

	/**
	 * Set mana to a new value and emit appropriate events
	 * This is the core method that handles constraints and events
	 */
	set(amount: number) {
		const oldValue = this.current
		this.current = clamp(amount, 0, this.max)

		// Emit events only if the value changed
		if (oldValue !== this.current) {
			this.emit(MANA_EVENTS.CHANGE, {
				previous: oldValue,
				current: this.current,
			})

			if (this.current <= 0) {
				this.emit(MANA_EVENTS.EMPTY)
			} else if (this.current === this.max && oldValue < this.max) {
				this.emit(MANA_EVENTS.FULL)
			}
		}

		return this.current
	}

	/**
	 * Attempt to spend mana - used where validation is required
	 * Returns false if not enough mana is available
	 */
	spend(amount: number): boolean {
		const gameLoop = this.root as GameLoop
		if (gameLoop.infiniteMana) return true
		if (amount > this.current) return false
		this.set(this.current - amount)
		return true
	}
}

/**
 * Task that handles mana regeneration over time
 */
export class ManaRegen extends Task {
	repeat = Infinity
	interval = 100
	regenRate = 1.5 // mana per tick
	downtime = 3000 // ms to wait after spending mana

	constructor(public parent: Mana) {
		super(parent)
	}

	tick() {
		const gameLoop = this.root as GameLoop
		const player = this.parent.parent as Player
		const mana = this.parent as Mana
		const timeSinceLastCast = gameLoop.elapsedTime - player.lastCastCompletedTime
		if (timeSinceLastCast < this.downtime) return
		mana.set(mana.current + this.regenRate)
	}
}
