import {Task} from 'vroum'
import {Character} from './character'
import {DamageEffect, TankAttack, RogueAttack, WarriorAttack} from './damage-effect'
import {Tank} from './tank'
import {DPS, Warrior, Rogue} from './dps'
import {Boss} from './boss'
import {Bleed, Poison} from './dot'

/**
 * Handles automatic attack creation and management for characters
 * Can be attached to any Character to provide auto-attacking behavior
 */
export class AutoAttackTask extends Task {
	// Reference to the parent character this task is attached to
	protected character: Character

	// Collection of active attacks from this character
	attacks = new Set<DamageEffect>()

	constructor(public parent: Character) {
		super(parent)
		this.character = parent
	}

	/**
	 * Clear all current attacks from this character
	 * Disconnects each attack and empties the attacks set
	 */
	clearAttacks() {
		// Disconnect each attack to prevent memory leaks
		this.attacks.forEach((attack) => attack.disconnect())
		this.attacks.clear()
	}

	/**
	 * Create appropriate attacks for this character against the target
	 * Base implementation creates a simple damage effect
	 * Subclasses should override this for specialized attack behavior
	 * @param target Character to attack
	 */
	createAttacks(target: Character) {
		// Default creates a simple damage effect
		const attack = new DamageEffect(this.character, target)
		this.attacks.add(attack)
	}

	/**
	 * Start attacks against a target
	 * Clears any existing attacks and creates new ones
	 * @param target Character to attack
	 */
	startAttacks(target: Character) {
		// Clear any existing attacks before creating new ones
		this.clearAttacks()

		// Create appropriate attacks for this character type
		this.createAttacks(target)
	}
}

/**
 * Tank-specific auto attack task
 */
export class TankAutoAttackTask extends AutoAttackTask {
	/**
	 * Create tank-specific attacks
	 * @param target Character to attack
	 */
	createAttacks(target: Character) {
		const attack = new TankAttack(this.character, target)
		this.attacks.add(attack)
	}
}

/**
 * DPS-specific auto attack task
 */
export class DPSAutoAttackTask extends AutoAttackTask {
	/**
	 * Create appropriate attack based on DPS type
	 * @param target Character to attack
	 */
	createAttacks(target: Character) {
		// Base implementation for generic DPS
		const attack = new DamageEffect(this.character, target)
		this.attacks.add(attack)
	}
}

/**
 * Warrior-specific auto attack task
 */
export class WarriorAutoAttackTask extends DPSAutoAttackTask {
	/**
	 * Create warrior-specific attacks
	 * @param target Character to attack
	 */
	createAttacks(target: Character) {
		// Add warrior-specific attack
		const attack = new WarriorAttack(this.character, target)
		this.attacks.add(attack)

		// Add a bleed effect to the target
		if (this.character instanceof Warrior && this.character.currentTarget) {
			new Bleed(this.character.currentTarget, this.character)
		}
	}
}

/**
 * Rogue-specific auto attack task
 */
export class RogueAutoAttackTask extends DPSAutoAttackTask {
	/**
	 * Create rogue-specific attacks
	 * @param target Character to attack
	 */
	createAttacks(target: Character) {
		// Add rogue-specific attack
		const attack = new RogueAttack(this.character, target)
		this.attacks.add(attack)

		// Add a poison effect to the target
		if (this.character instanceof Rogue && this.character.currentTarget) {
			new Poison(this.character.currentTarget, this.character)
		}
	}
}

/**
 * Boss-specific auto attack task
 */
export class BossAutoAttackTask extends AutoAttackTask {
	/**
	 * Create boss-specific attacks based on attackTypes
	 * @param target Character to attack
	 */
	createAttacks(target: Character) {
		if (this.character instanceof Boss) {
			const constructor = this.character.constructor as typeof Boss

			// Create attack instances based on the boss's attack types
			constructor.attackTypes.forEach((AttackType) => {
				this.attacks.add(new AttackType(this.character, target))
			})
		}
	}
}
