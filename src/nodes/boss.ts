import {Node} from 'vroum'
import {GameLoop} from './game-loop'
import {DamageEffect, SmallAttack, MediumAttack, HugeAttack} from './damage-effect'
import {createId} from '../utils'
import {Tank} from './tank'
import {Health} from './health'

/**
 * Base Boss class that defines common properties and methods for all bosses.
 */
export class Boss extends Node {
	// Instance properties
	readonly id: string
	image = ''
	name = ''
	attacks = new Set<DamageEffect>()
	
	// Health management
	health: Health

	// Static properties for boss definitions
	static image = ''
	static health = 0
	static maxHealth = 0
	static name = 'Generic Boss'
	static attackTypes: Array<typeof DamageEffect> = []

	constructor(public parent: GameLoop) {
		super(parent)
		this.id = createId()
		
		// Copy static properties to instance
		const constructor = this.constructor as typeof Boss
		this.image = constructor.image
		this.name = constructor.name
		
		// Create health system
		this.health = new Health(this, constructor.maxHealth)
		this.health.set(constructor.health)
	}

	mount() {
		// Find a tank to attack in the party
		const tank = this.parent.party.find(member => member instanceof Tank) as Tank;
		
		if (!tank) {
			console.warn('No tank found in party for boss to attack');
			return;
		}
		
		// Create attack instances based on the boss's attack types
		const constructor = this.constructor as typeof Boss
		constructor.attackTypes.forEach(AttackType => {
			this.attacks.add(new AttackType(tank))
		})
	}
	
	// Helper accessors
	get currentHealth(): number {
		return this.health.current;
	}
	
	get maxHealth(): number {
		return this.health.max;
	}
	
	// Apply damage using health system
	takeDamage(amount: number): number {
		return this.health.damage(amount);
	}
	
	// Check if boss is dead
	isDead(): boolean {
		return this.health.current <= 0;
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

/**
 * Minion - A lesser enemy
 */
export class Minion extends Boss {
	static image = 'minion.webp'
	static health = 2500
	static maxHealth = 2500
	static name = 'Fire Minion'
	static attackTypes = [SmallAttack] // Only uses small attacks
}

/**
 * Imp - A small, weak enemy
 */
export class Imp extends Boss {
	static image = 'imp.webp'
	static health = 1000
	static maxHealth = 1000
	static name = 'Annoying Imp'
	// Custom attack pattern: more frequent but weaker
	static attackTypes = [SmallAttack]
}
