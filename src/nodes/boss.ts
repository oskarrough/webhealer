import {GameLoop} from './game-loop'
import {Character} from './character'
import {DamageEffect, SmallAttack, MediumAttack, HugeAttack} from './damage-effect'
import {Health} from './health'
import {FACTION} from './types'
import {AutoAttackTask} from './auto-attack-task'

/**
 * Base class for all boss enemies
 */
export class Boss extends Character {
	// Instance properties
	name = ''
	health = new Health(this, 5000)

	// Static properties for boss definitions
	static name = 'Generic Boss'
	static attackTypes: Array<typeof DamageEffect> = []

	constructor(public parent: GameLoop) {
		super(parent)
		this.faction = FACTION.ENEMY
		// Copy static properties to instance
		const constructor = this.constructor as typeof Boss
		this.name = constructor.name
	}

	createAttacks(target: Character, task: AutoAttackTask) {
		// Create attack instances based on the boss's attack types
		const constructor = this.constructor as typeof Boss
		constructor.attackTypes.forEach((AttackType) => {
			const attack = new AttackType(this, target)
			task.addAttack(attack)
		})
	}
}

/**
 * Nakroth - The first boss
 */
export class Nakroth extends Boss {
	static name = 'Nakroth the Destroyer'
	static attackTypes = [SmallAttack, MediumAttack, HugeAttack]
	health = new Health(this, 1000)
}

/**
 * Imp - A small, weak enemy
 */
export class Imp extends Boss {
	static image = 'imp.webp'
	static name = 'Annoying Imp'
	static attackTypes = [SmallAttack]
	health = new Health(this, 1000)
}
