import {Node} from 'vroum'
import {createId} from '../utils'
import {Health} from './health'
import {Mana} from './mana'
import {GameLoop} from './game-loop'

/**
 * Base Character class that all character types can inherit from
 */
export class Character extends Node {
	// Unique identifier
	readonly id: string = ''

	// Character stats - directly accessible
	health: Health
	mana?: Mana
	hasMana: boolean = false

	constructor(
		public parent: GameLoop,
		options: {
			maxHealth: number
			hasMana?: boolean
			maxMana?: number
		},
	) {
		super(parent)
		this.id = createId()

		// Create health node
		this.health = new Health(this, options.maxHealth)

		// Create mana node if needed
		this.hasMana = options.hasMana || false
		if (this.hasMana && options.maxMana) {
			this.mana = new Mana(this, options.maxMana)
		}
	}

	/**
	 * Spend mana (returns false if not enough)
	 */
	spendMana(amount: number): boolean {
		if (!this.mana) return false
		return this.mana.spend(amount)
	}

	/**
	 * Deal damage to this character
	 * Returns the actual amount of damage dealt
	 */
	damage(amount: number): number {
		return this.health.damage(amount)
	}
}
