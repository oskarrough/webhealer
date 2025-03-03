import {Character} from './character'
import {Health} from './health'
import {GameLoop} from './game-loop'
import {DamageEffect} from './damage-effect'
import {FACTION} from './types'
import {AutoAttackTask} from './auto-attack-task'

export class Tank extends Character {
	health = new Health(this, 4000)

	constructor(public parent: GameLoop) {
		super(parent)
		this.faction = FACTION.PARTY
	}

	createAttacks(target: Character, task: AutoAttackTask) {
		const attack = new DamageEffect(this, target)
		attack.interval = 1800
		attack.minDamage = 60
		attack.maxDamage = 90
		attack.sound = 'combat.sword_hit'
		attack.name = 'Shield Bash'
		task.addAttack(attack)
	}
}
