import {Task} from 'vroum'
import {Character} from './character'
import {Tank} from './tank'

/**
 * Handles automatic target selection and updating for characters
 * Can be attached to any Character to provide automatic targeting behavior
 */
export class TargetingTask extends Task {
	// Reference to the parent character this task is attached to
	protected character: Character

	constructor(public parent: Character) {
		super(parent)
		this.character = parent
	}

	/**
	 * Called each frame by the game loop
	 * Updates the character's target if needed
	 */
	tick() {
		// Don't update targeting if the character is dead
		if (this.character.health.current <= 0) {
			return
		}

		// Check if current target is dead or missing
		const currentTargetIsDead =
			!this.character.currentTarget || this.character.currentTarget.health.current <= 0

		// If target is dead, find a new one
		if (currentTargetIsDead) {
			const newTarget = this.findTarget()
			if (newTarget) {
				this.character.setTarget(newTarget)

				// Start attacks against the new target
				this.character.startAttacks(newTarget)
			}
		}
	}

	/**
	 * Find a target for the character based on potential targets and selection strategy
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
	 * Get a list of potential targets for this character
	 * Default implementation returns alive enemies for party members and alive party members for enemies
	 * @returns Array of alive potential targets
	 */
	getPotentialTargets(): Character[] {
		// By default, party members target enemies, and enemies target party members
		const targets = this.character.isPartyMember()
			? this.character.parent.enemies
			: this.character.parent.party

		// Filter for only alive targets
		return targets.filter((target) => target.health && target.health.current > 0)
	}

	/**
	 * Select a target from the potential targets
	 * Default implementation selects the first target in the list
	 * @param potentialTargets Array of potential targets to select from
	 * @returns The selected target or undefined if no targets
	 */
	selectTarget(potentialTargets: Character[]): Character | undefined {
		// Default strategy: select the first target
		return potentialTargets.length > 0 ? potentialTargets[0] : undefined
	}
}

/**
 * DPS-specific targeting that randomly selects a target for variety in combat
 */
export class RandomTargetingTask extends TargetingTask {
	/**
	 * Randomly selects a target from the potential targets
	 * @param potentialTargets Array of potential targets
	 * @returns A randomly selected target or undefined if no targets
	 */
	selectTarget(potentialTargets: Character[]): Character | undefined {
		if (potentialTargets.length === 0) {
			return undefined
		}

		// Target a random enemy for variety in combat
		const randomIndex = Math.floor(Math.random() * potentialTargets.length)
		return potentialTargets[randomIndex]
	}
}

/**
 * Boss-specific targeting that prioritizes targeting tank characters
 */
export class BossTargetingTask extends TargetingTask {
	/**
	 * Prioritizes targeting tank characters if available
	 * @param potentialTargets Array of potential targets
	 * @returns Tank if available, otherwise first party member
	 */
	selectTarget(potentialTargets: Character[]): Character | undefined {
		if (potentialTargets.length === 0) {
			return undefined
		}

		// Boss prioritizes targeting the tank if available
		const tank = potentialTargets.find((target) => target instanceof Tank)
		return tank || potentialTargets[0]
	}

	/**
	 * Overrides the tick method to add special tank targeting behavior
	 */
	tick() {
		// Call the base implementation for standard retargeting on death
		super.tick()

		// Don't continue if character is dead or has no target
		if (this.character.health.current <= 0 || !this.character.currentTarget) {
			return
		}

		// Special case: If we're not targeting the tank but there's an alive tank, switch to it
		if (!(this.character.currentTarget instanceof Tank)) {
			const alivePartyMembers = this.getPotentialTargets()
			const tank = alivePartyMembers.find((member) => member instanceof Tank)

			if (tank) {
				this.character.setTarget(tank)
				this.character.startAttacks(tank)
			}
		}
	}
}
