import {Node} from 'vroum'
import {clamp} from '../utils'

export type ResourceEvents = {
	CHANGE: string
	EMPTY: string
	FULL: string
}

/**
 * Base class for resources like health, mana, stamina, etc.
 */
export class Resource extends Node {
	max = 0
	current = 0

	constructor(
		public parent: Node,
		max: number = 100,
		public events: ResourceEvents,
	) {
		super(parent)
		this.max = max
		this.current = max
	}

	/**
	 * Set resource to a new value and emit appropriate events
	 */
	set(amount: number) {
		const oldValue = this.current
		this.current = clamp(amount, 0, this.max)

		// Emit events only if the value changed
		if (oldValue !== this.current) {
			this.emit(this.events.CHANGE, {
				previous: oldValue,
				current: this.current,
			})

			if (this.current <= 0) {
				this.emit(this.events.EMPTY)
			} else if (this.current === this.max && oldValue < this.max) {
				this.emit(this.events.FULL)
			}
		}

		return this.current
	}
}
