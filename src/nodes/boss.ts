import {Node} from 'vroum'
import {GameLoop} from './game-loop'
import {DamageEffect, SmallAttack, MediumAttack, HugeAttack} from './damage-effect'

/**
 * Base Boss class that defines common properties and methods for all bosses.
 */
export class Boss extends Node {
	// Instance properties
	image = ''
	health = 0
	maxHealth = 0
	name = ''
	attacks = new Set<DamageEffect>()

	// Static properties for boss definitions
	static image = ''
	static health = 0
	static maxHealth = 0
	static name = 'Generic Boss'
	static attackTypes: Array<typeof DamageEffect> = []

	constructor(public parent: GameLoop) {
		super(parent)
		
		// Copy static properties to instance
		const constructor = this.constructor as typeof Boss
		this.image = constructor.image
		this.health = constructor.health
		this.maxHealth = constructor.maxHealth
		this.name = constructor.name
	}

	mount() {
		// Create attack instances based on the boss's attack types
		const constructor = this.constructor as typeof Boss
		constructor.attackTypes.forEach(AttackType => {
			this.attacks.add(new AttackType(this.parent.tank))
		})
	}
}

/**
 * Nakroth - The first boss
 */
export class Nakroth extends Boss {
	static image = 'nak.webp'
	static health = 10000
	static maxHealth = 10000
	static name = 'Nakroth the Destroyer'
	static attackTypes = [SmallAttack, MediumAttack, HugeAttack]
}
