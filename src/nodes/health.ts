import {Node} from 'vroum'
import {Resource} from './resource'
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
 * Health node with heal + damage methods
 */
export class Health extends Resource {
	constructor(parent: Node, max = 100) {
		super(parent, max, HEALTH_EVENTS)
	}

	heal(amount: number) {
		return this.set(this.current + amount)
	}

	damage(amount: number) {
		const gameLoop = this.root as GameLoop
		if (gameLoop?.godMode) return this.current

		return this.set(this.current - amount)
	}
}
