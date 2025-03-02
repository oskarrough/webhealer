import {Task} from 'vroum'
import {Player} from './player'

/**
 * Global Cooldown
 * 
 * When this task is added to a character as `gcd` property, it will prevent them from casting spells
 * while it exists.
 * 
 */
export class GlobalCooldown extends Task {
	repeat = 1
	delay = 1500

	constructor(public parent: Player) {
		super(parent)
	}

	destroy() {
		this.parent.gcd = undefined
	}
}
