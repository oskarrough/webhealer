import {Task} from 'vroum'
import {Character} from './character'
import {Tank} from './party-characters'

/** Base targeting framework */
export class Targeting extends Task {
	constructor(public parent: Character) {
		super(parent)
	}

	shouldTick() {
		return this.parent.health.current > 0
	}

	shouldSelect(): boolean {
		return !this.parent.currentTarget || this.parent.currentTarget.health.current <= 0
	}

	shouldReconsider(): boolean {
		return false  // Default: stay with chosen target
	}

	tick() {
		if (this.shouldSelect() || this.shouldReconsider()) {
			this.parent.currentTarget = this.preferredTarget()
		}
	}

	/** Returns empty target list by default */
	getPotentialTargets(): Character[] {
		return []
	}

	preferredTarget(): Character | undefined {
		const targets = this.getPotentialTargets()
		if (targets.length === 0) return undefined
		return targets[0]
	}
}

/** Targets alive characters from opposite faction */
export class TargetOppositeFaction extends Targeting {
	/** Returns alive characters from opposite faction */
	getPotentialTargets(): Character[] {
		// Party members target enemies, and enemies target party members
		const targets =
			this.parent.faction === 'party'
				? this.parent.parent.enemies
				: this.parent.parent.party

		return targets.filter((target) => target.health && target.health.current > 0)
	}
}

/** Randomly selects a target from opposite faction */
export class RandomTargeting extends TargetOppositeFaction {
	/** Selects random target */
	preferredTarget(): Character | undefined {
		const targets = this.getPotentialTargets()
		if (targets.length === 0) return undefined

		const randomIndex = Math.floor(Math.random() * targets.length)
		return targets[randomIndex]
	}
}

/** Prioritizes targeting tanks */
export class TankTargeting extends TargetOppositeFaction {
	/** Returns tank if available, otherwise first target */
	preferredTarget(): Character | undefined {
		const targets = this.getPotentialTargets()
		if (targets.length === 0) return undefined

		const tank = targets.find((target) => target instanceof Tank)
		return tank || targets[0]
	}

	shouldReconsider(): boolean {
		return !!(
			this.parent.currentTarget && 
			!(this.parent.currentTarget instanceof Tank) &&
			this.getPotentialTargets().some(t => t instanceof Tank)
		)
	}

	tick() {
		// Call the base implementation for standard targeting
		super.tick()

		// Normally we don't switch targets while target is alive
		if (this.parent.currentTarget && !(this.parent.currentTarget instanceof Tank)) {
			const targets = this.getPotentialTargets()
			const tank = targets.find((target) => target instanceof Tank)
			if (tank) this.parent.currentTarget = tank
		}
	}
}

/** Targets character with lowest health percentage */
export class LowestHealth extends TargetOppositeFaction {
	preferredTarget(): Character | undefined {
		const targets = this.getPotentialTargets()
		if (targets.length === 0) return undefined

		return targets.sort(
			(a, b) => a.health.current / a.health.max - b.health.current / b.health.max,
		)[0]
	}
}
