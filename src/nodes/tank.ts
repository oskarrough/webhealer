import {Character, FACTION} from './character'
import {Health} from './health'
import {GameLoop} from './game-loop'
import {TargetingTask} from './targeting-task'
import {TankAutoAttackTask} from './auto-attack-task'

export class Tank extends Character {
	health = new Health(this, 4000)

	static TargetingTaskType = TargetingTask
	static AutoAttackTaskType = TankAutoAttackTask

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
