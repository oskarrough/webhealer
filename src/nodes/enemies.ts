import {Character} from './character'
import {Health} from './health'
import {FACTION} from './types'
import {BossTargetingTask, RandomTargetingTask} from './targeting-task'
import {SmallAttack, MediumAttack, HugeAttack} from './damage-effect'

export class Nakroth extends Character {
	name = 'Nakroth the Destroyer'
	health = new Health(this, 1000)
	targetingTask = new BossTargetingTask(this)
	
	// Create multiple attack instances that will use this.currentTarget
	smallAttack = new SmallAttack(this)
	mediumAttack = new MediumAttack(this)
	hugeAttack = new HugeAttack(this)
	
	constructor(public parent: any) {
		super(parent)
		this.faction = FACTION.ENEMY
	}
}

export class Imp extends Character {
	static image = 'imp.webp'
	
	name = 'Annoying Imp'
	health = new Health(this, 1000)
	targetingTask = new RandomTargetingTask(this)
	attackEffect = new SmallAttack(this)
	
	constructor(public parent: any) {
		super(parent)
		this.faction = FACTION.ENEMY
	}
}
