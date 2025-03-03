import {Character} from './character'
import {Health} from './health'
import {GameLoop} from './game-loop'
import {SmallAttack, WarriorAttack, RogueAttack} from './damage-effect'
import {FACTION} from './types'
import {TargetingTask} from './targeting-task'

export class Tank extends Character {
	health = new Health(this, 4000)

	// Set up targeting for this tank - instantiation starts the task automatically
	targetingTask = new TargetingTask(this)

	// Create attack instance that will use this.currentTarget
	attackEffect = new SmallAttack(this)

	constructor(public parent: GameLoop) {
		super(parent)
		this.faction = FACTION.PARTY
	}
}

export class DPS extends Character {
	health = new Health(this, 2000)

	// Set up targeting for the DPS character - instantiation starts the task automatically
	targetingTask = new TargetingTask(this)

	constructor(public parent: GameLoop) {
		super(parent)
		this.faction = FACTION.PARTY
	}
}

export class Warrior extends DPS {
	// Just create the attack using the updated API - it will use this.currentTarget
	attackEffect = new WarriorAttack(this)

	constructor(public parent: GameLoop) {
		super(parent)

		// Additional setup - for example, we could add a DoT when the character targets
		// new enemies, but that's not necessary for basic functionality
	}
}

export class Rogue extends DPS {
	// Just create the attack using the updated API - it will use this.currentTarget
	attackEffect = new RogueAttack(this)

	constructor(public parent: GameLoop) {
		super(parent)

		// Additional setup - for example, we could add a DoT when the character targets
		// new enemies, but that's not necessary for basic functionality
	}
}
