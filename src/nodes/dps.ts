import {Character, FACTION} from './character'
import {Health} from './health'
import {GameLoop} from './game-loop'
import {RandomTargetingTask} from './targeting-task'
import {
	DPSAutoAttackTask,
	WarriorAutoAttackTask,
	RogueAutoAttackTask,
} from './auto-attack-task'

/**
 * DPS class that automatically attacks enemies
 */
export class DPS extends Character {
	health = new Health(this, 2000)

	static TargetingTaskType = RandomTargetingTask
	static AutoAttackTaskType = DPSAutoAttackTask

	constructor(public parent: GameLoop) {
		super(parent)
		this.faction = FACTION.PARTY
	}

	mount() {
		const target = this.findTarget()
		if (target) {
			this.setTarget(target)
			this.startAttacks(target)
		}
	}
}

/**
 * Warrior DPS - Melee fighter with strong attacks and bleed effects
 */
export class Warrior extends DPS {
	// Override just the auto attack task type
	static AutoAttackTaskType = WarriorAutoAttackTask
}

/**
 * Rogue DPS - Stealthy attacker with poison effects
 */
export class Rogue extends DPS {
	// Override just the auto attack task type
	static AutoAttackTaskType = RogueAutoAttackTask
}
