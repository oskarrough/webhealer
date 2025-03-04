import {Character} from './character'
import {Health} from './health'
import {FACTION} from './types'
import {TankTargetingTask, RandomTargetingTask} from './targeting-task'
import {SmallAttack, MediumAttack, HugeAttack} from './damage-effect'

export class Nakroth extends Character {
	faction = FACTION.ENEMY
	name = 'Nakroth the Destroyer'
	health = new Health(this, 4000)
	targetingTask = new TankTargetingTask(this)
	mediumAttack = new MediumAttack(this)
	hugeAttack = new HugeAttack(this)
}

export class Imp extends Character {
	faction = FACTION.ENEMY
	name = 'Annoying Imp'
	health = new Health(this, 1000)
	targetingTask = new RandomTargetingTask(this)
	attackEffect = new SmallAttack(this)
}
