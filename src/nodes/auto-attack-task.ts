import {Task} from 'vroum'
import {Character} from './character'
import {DamageEffect} from './damage-effect'

/**
 * Handles automatic attack creation and management for characters
 */
export class AutoAttackTask extends Task {
	// Collection of active attacks
	attacks = new Set<DamageEffect>()
	currentTarget?: Character

	constructor(public parent: Character) {
		super(parent)
	}

	/**
	 * Clear all current attacks
	 */
	clearAttacks() {
		this.attacks.forEach((attack) => attack.disconnect())
		this.attacks.clear()
	}

	/**
	 * Add a new attack
	 */
	addAttack(attack: DamageEffect) {
		this.attacks.add(attack)
	}

	/**
	 * Start attacks against a target
	 */
	startAttacks(target: Character) {
		// Only recreate attacks if target changed
		if (this.currentTarget !== target) {
			this.clearAttacks()
			this.currentTarget = target
			// Let the character create its own attacks
			if (this.parent.createAttacks) {
				this.parent.createAttacks(target, this)
			}
		}
	}
}
