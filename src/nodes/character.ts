import {Node} from 'vroum'
import {createId} from '../utils'
import {Health, HEALTH_EVENTS} from './health'
import {Mana} from './mana'
import {GameLoop} from './game-loop'
import {DamageEffect} from './damage-effect'
import {HOT} from './hot'
import {DoT} from './dot'
import {AutoAttackTask} from './auto-attack-task'

// Common interface for all character effects (HOT, DoT, etc.)
export type CharacterEffect = HOT | DoT

/**
 * Represents the faction a character belongs to
 */
export type Faction = 'party' | 'enemy'

// Constants for faction values
export const FACTION = {
	PARTY: 'party' as Faction,
	ENEMY: 'enemy' as Faction,
} as const

/**
 * Base Character class that all character types can inherit from
 */
export class Character extends Node {
	readonly id: string = ''

	health = new Health(this)
	mana?: Mana

	// Store all active effects on this character
	effects = new Set<CharacterEffect>()

	// Track the character's current target (common across all combat character types)
	currentTarget?: Character

	// Indicates which faction this character belongs to
	faction: Faction = FACTION.ENEMY

	// Tasks for AI behavior
	autoAttackTask = new AutoAttackTask(this)

	constructor(public parent: GameLoop) {
		super(parent)
		this.id = createId()

		this.health.on(HEALTH_EVENTS.EMPTY, this.onHealthEmpty)
	}

	private onHealthEmpty = () => {
		console.log(`${this.constructor.name} is dead`)
		this.disconnect()
	}

	damage(amount: number) {
		return this.health.damage(amount)
	}

	/**
	 * Get potential targets based on faction
	 */
	protected getPotentialTargets(): Character[] {
		const targets =
			this.faction === FACTION.PARTY ? this.parent.enemies : this.parent.party
		return targets.filter((target) => target.health.current > 0)
	}

	/**
	 * Create attacks for this character
	 * Base implementation creates a simple damage effect
	 * Subclasses should override this for specialized attacks
	 */
	createAttacks(target: Character, task: AutoAttackTask) {
		const attack = new DamageEffect(this, target)
		task.addAttack(attack)
	}

	/**
	 * Core character behavior - find target and attack
	 */
	tick() {
		// No target or dead target - find new one
		if (!this.currentTarget?.health.current) {
			const targets = this.getPotentialTargets()
			this.currentTarget = targets[0]
		}

		// Attack current target
		if (this.currentTarget) {
			this.autoAttackTask.startAttacks(this.currentTarget)
		}
	}
}
