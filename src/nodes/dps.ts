import {Character} from './character'
import {Health} from './health'
import {GameLoop} from './game-loop'
import {DamageEffect} from './damage-effect'
import {Bleed, Poison} from './dot'
import {FACTION} from './types'
import {AutoAttackTask} from './auto-attack-task'

/**
 * DPS class that automatically attacks enemies
 */
export class DPS extends Character {
	health = new Health(this, 2000)

	constructor(public parent: GameLoop) {
		super(parent)
		this.faction = FACTION.PARTY
	}
}

/**
 * Warrior DPS - Melee fighter with strong attacks and bleed effects
 */
export class Warrior extends DPS {
	createAttacks(target: Character, task: AutoAttackTask) {
		const attack = new DamageEffect(this, target)
		attack.interval = 2200
		attack.minDamage = 120
		attack.maxDamage = 220
		attack.sound = 'combat.sword_hit'
		attack.name = 'Mighty Swing'
		task.addAttack(attack)

		// Add bleed effect
		new Bleed(target, this)
	}
}

/**
 * Rogue DPS - Stealthy attacker with poison effects
 */
export class Rogue extends DPS {
	createAttacks(target: Character, task: AutoAttackTask) {
		const attack = new DamageEffect(this, target)
		attack.interval = 1000
		attack.minDamage = 65
		attack.maxDamage = 95
		attack.sound = 'combat.sword_hit'
		attack.name = 'Quick Slash'
		task.addAttack(attack)

		// Add poison effect
		new Poison(target, this)
	}
}
