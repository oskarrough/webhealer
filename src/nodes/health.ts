import {Node} from 'vroum'
import {log} from '../utils'
import {GameLoop} from './game-loop'

/**
 * Events emitted by the Health node
 */
export const HEALTH_EVENTS = {
	CHANGE: 'health:change',
	EMPTY: 'health:empty',
	FULL: 'health:full',
} as const

/**
 * Health node with simplified health management and event handling
 */
export class Health extends Node {
	max = 0
	current = 0

	constructor(
		public parent: Node,
		max: number = 100,
	) {
		super(parent)
		this.max = max
		this.current = max
	}

	/**
	 * Get the game loop instance
	 */
	private getGameLoop(): GameLoop | null {
		// Walk up the parent chain to find GameLoop
		let node: Node | null = this.parent
		while (node) {
			if (node instanceof GameLoop) {
				return node
			}
			// Node parent might be undefined, so handle it
			node = node.parent || null
		}
		return null
	}

	/**
	 * Set the health to a new value and emit appropriate events
	 */
	set(amount: number) {
		const oldValue = this.current

		// Check for godMode protection
		const gameLoop = this.getGameLoop()
		const godModeEnabled = gameLoop?.godMode || false

		// If godMode is enabled and amount would reduce health to 0, set to 1 instead
		if (godModeEnabled && amount < 1 && oldValue > 0) {
			log(`godMode prevented death of ${this.parent.constructor.name}`)
			amount = 1 // Set to minimum health instead of 0
		}

		// Clamp the value
		this.current = Math.max(0, Math.min(amount, this.max))

		// Only emit events if the value changed
		if (oldValue !== this.current) {
			// Always emit change event
			this.emit(HEALTH_EVENTS.CHANGE, {
				previous: oldValue,
				current: this.current,
			})

			// Emit special events
			if (this.current <= 0) {
				this.emit(HEALTH_EVENTS.EMPTY)
				log(`${this.parent.constructor.name} has died`)
			} else if (this.current === this.max && oldValue < this.max) {
				this.emit(HEALTH_EVENTS.FULL)
			}
		}

		return this.current
	}

	/**
	 * Simpler healing function
	 */
	heal(amount: number) {
		if (this.current <= 0) return 0 // Can't heal if dead

		const oldValue = this.current
		this.set(this.current + amount)
		return this.current - oldValue // Return actual amount healed
	}

	/**
	 * Simpler damage function
	 */
	damage(amount: number) {
		if (this.current <= 0) return 0 // Already dead

		const oldValue = this.current
		this.set(this.current - amount)
		return oldValue - this.current // Return actual amount damaged
	}
}
