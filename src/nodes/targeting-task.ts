import {Task} from 'vroum'
import {Character} from './character'
import {Tank} from './party-characters'

/**
 * Base targeting task that provides the framework for character targeting
 * This class contains the core targeting functionality with extension points
 */
export class TargetingTask extends Task {
	constructor(public parent: Character) {
		super(parent)
	}

	shouldTick() {
		// Don't update targeting if the character is dead
		return this.parent.health.current > 0
	}

	tick() {
		const currentTargetIsDead = !this.parent.currentTarget || this.parent.currentTarget.health.current <= 0
		if (currentTargetIsDead) this.parent.currentTarget = this.findTarget()
	}

	/**
	 * Find a target for the character using the strategy defined in subclasses
	 * This method orchestrates the targeting process: get candidates, then select one
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
	 * Base implementation doesn't filter by faction - this is implemented in subclasses
	 * @returns Array of alive potential targets
	 */
	getPotentialTargets(): Character[] {
		return []
	}

	/**
	 * Select a target from the potential targets
	 * Default implementation selects the first target in the list
	 * @param potentialTargets Array of potential targets to select from
	 * @returns The selected target or undefined if no targets
	 */
	selectTarget(potentialTargets: Character[]): Character | undefined {
		return potentialTargets.length > 0 ? potentialTargets[0] : undefined
	}
}

/**
 * Targeting task that targets the first alive characters of the opposite faction
 * This is the standard targeting behavior for most characters
 */
export class TargetOppositeFaction extends TargetingTask {
	/**
	 * Get a list of potential targets from the opposite faction
	 * Returns alive enemies for party members and alive party members for enemies
	 * @returns Array of alive potential targets from the opposite faction
	 */
	getPotentialTargets(): Character[] {
		// Party members target enemies, and enemies target party members
		const targets = this.parent.faction === 'party'
			? this.parent.parent.enemies
			: this.parent.parent.party

		// Filter for only alive targets
		return targets.filter((target) => target.health && target.health.current > 0)
	}
}

/**
 * Targets a random, alive character of the opposite faction
 */
export class RandomTargetingTask extends TargetOppositeFaction {
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
 * Prioritizes targeting tank characters if available
 */
export class BossTargetingTask extends TargetOppositeFaction {
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

	tick() {
		// Call the base implementation for standard retargeting on death
		super.tick()

		// Don't continue if character has no target
		if (!this.parent.currentTarget) {
			return
		}

		// Special case: If we're not targeting the tank but there's an alive tank, switch to it
		if (!(this.parent.currentTarget instanceof Tank)) {
			const alivePartyMembers = this.getPotentialTargets()
			const tank = alivePartyMembers.find((member) => member instanceof Tank)

			if (tank) {
				this.parent.currentTarget = tank
			}
		}
	}
}
