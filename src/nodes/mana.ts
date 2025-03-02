import {Node, Task} from 'vroum'
import {clamp} from '../utils'

/**
 * Events emitted by the Mana node
 */
export const MANA_EVENTS = {
	CHANGE: 'mana:change',
	EMPTY: 'mana:empty',
	FULL: 'mana:full',
} as const

/**
 * Mana node with convenience mana management logic
 * Can be attached to any caster character type
 */
export class Mana extends Node {
	current = 0
	max = 0

	// Mana regeneration properties
	regenEnabled = true
	regenTask: ManaRegen

	constructor(
		public parent: Node,
		max: number = 100,
	) {
		super(parent)
		this.max = max
		this.current = max
		this.regenTask = new ManaRegen(this)
	}

	isFull() {
		return this.current === this.max
	}

	isEmpty() {
		return this.current <= 0
	}

	reset() {
		this.set(this.max)
	}

	spend(amount: number): boolean {
		if (amount > this.current) return false // Not enough mana

		this.set(this.current - amount)
		return true
	}

	restore(amount: number) {
		const oldValue = this.current
		this.set(this.current + amount)
		return this.current - oldValue // Return actual amount restored
	}

	set(amount: number) {
		const oldValue = this.current
		this.current = Math.max(0, Math.min(amount, this.max))

		// Emit events
		if (oldValue !== this.current) {
			this.emit(MANA_EVENTS.CHANGE, {
				previous: oldValue,
				current: this.current,
			})

			if (this.isEmpty()) {
				this.emit(MANA_EVENTS.EMPTY)
			} else if (this.isFull() && oldValue < this.max) {
				this.emit(MANA_EVENTS.FULL)
			}
		}

		return this.current
	}
}

/**
 * Task that handles mana regeneration over time
 */
export class ManaRegen extends Task {
	repeat = Infinity
	interval = 100
	regenRate = 0.5 // mana per tick
	downtime = 2000 // ms to wait after spending mana

	constructor(public parent: Mana) {
		super(parent)
	}

	tick() {
		if (!this.parent.regenEnabled) return

		// Get the root node (game loop)
		const root = this.root
		const player = this.parent.parent

		// Check if enough time has passed since last cast
		if (player && 'lastCastTime' in player) {
			const timeSinceLastCast = root.elapsedTime - (player.lastCastTime as number)
			if (timeSinceLastCast < this.downtime) return
		}

		// Regenerate mana
		if (!this.parent.isFull()) {
			this.parent.restore(this.regenRate)
		}
	}
}
