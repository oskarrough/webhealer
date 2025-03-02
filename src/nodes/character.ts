import {Node} from 'vroum'
import {createId} from '../utils'
import {Health, HEALTH_EVENTS} from './health'
import {Mana} from './mana'
import {GameLoop} from './game-loop'
import {HOT} from './hot'
import {DoT} from './dot'
import {DamageEffect} from './damage-effect'
import {log} from '../utils'
import {TargetingTask} from './targeting-task'
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
	currentTarget: Character | undefined

	// Controls whether the character automatically updates targeting
	autoPilot = true

	// Indicates which faction this character belongs to
	faction: Faction = FACTION.ENEMY

	// Tasks for AI behavior
	targetingTask?: TargetingTask
	autoAttackTask?: AutoAttackTask

	// Define default task types to use
	static TargetingTaskType = TargetingTask
	static AutoAttackTaskType = AutoAttackTask

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
	 * Set this character's target
	 * Common implementation used by all derived classes
	 * @param character The character to target or undefined to clear target
	 */
	setTarget(character: Character | undefined) {
		this.currentTarget = character
		log(
			`${this.constructor.name}:target:${character ? character.constructor.name : 'none'}`,
		)
	}

	/**
	 * Get a list of potential targets for this character
	 * Default implementation returns alive enemies
	 * Can be overridden by subclasses to implement different targeting rules
	 * @returns Array of alive potential targets
	 */
	getPotentialTargets(): Character[] {
		// By default, party members target enemies, and enemies target party members
		const targets = this.isPartyMember() ? this.parent.enemies : this.parent.party

		// Filter for only alive targets
		return targets.filter((target) => target.health && target.health.current > 0)
	}

	/**
	 * Determine if this character is a party member
	 * Used to determine default targeting behavior
	 * @returns true if this character is in the party, false otherwise
	 */
	isPartyMember(): boolean {
		// Use the faction property to determine if this is a party member
		return this.faction === FACTION.PARTY
	}

	/**
	 * Select a target from the potential targets
	 * Base implementation selects the first target in the list
	 * Subclasses can override this to implement different selection strategies
	 * @param potentialTargets Array of potential targets to select from
	 * @returns The selected target or undefined if no targets
	 */
	selectTarget(potentialTargets: Character[]): Character | undefined {
		// Default strategy: select the first target
		return potentialTargets.length > 0 ? potentialTargets[0] : undefined
	}

	/**
	 * Find the best target for this character
	 * Uses getPotentialTargets() to get a list of targets and selectTarget() to pick one
	 * @returns The selected target or undefined if no valid targets
	 */
	findTarget(): Character | undefined {
		const potentialTargets = this.getPotentialTargets()
		if (potentialTargets.length === 0) {
			return undefined // No alive targets
		}

		return this.selectTarget(potentialTargets)
	}

	/**
	 * Clear all current attacks from this character
	 * Disconnects each attack and empties the attacks set
	 * Now delegates to the autoAttackTask if available
	 */
	clearAttacks() {
		if (this.autoAttackTask) {
			this.autoAttackTask.clearAttacks()
		}
	}

	/**
	 * Create appropriate attacks for this character against the target
	 * Base implementation creates no attacks - subclasses should override this
	 * Now delegates to the autoAttackTask if available
	 * @param target Character to attack
	 */
	createAttacks(target: Character) {
		if (this.autoAttackTask) {
			this.autoAttackTask.createAttacks(target)
		}
	}

	/**
	 * Start attacks against a target
	 * Clears any existing attacks and creates new ones
	 * Now delegates to the autoAttackTask if available
	 * @param target Character to attack
	 */
	startAttacks(target: Character) {
		if (this.autoAttackTask) {
			this.autoAttackTask.startAttacks(target)
		}
	}

	/**
	 * Called each frame by the game loop
	 * Default implementation does nothing - AI behavior is handled by tasks
	 */
	tick() {
		// Targeting and attack updates are now handled by the targeting task
	}
}
