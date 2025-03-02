import {Character} from './character'
import {GameLoop} from './game-loop'
import {Boss} from './boss'
import {DamageEffect, WarriorAttack, RogueAttack} from './damage-effect'

/**
 * DPS class that automatically attacks enemies
 */
export class DPS extends Character {
	// Attacks collection
	attacks = new Set<DamageEffect>()

	constructor(public parent: GameLoop) {
		super(parent, {
			maxHealth: 2000,
			hasMana: false,
		})
	}

	mount() {
		// Find an enemy to attack
		if (this.parent.enemies.length > 0) {
			// Target a random enemy (for variety in combat)
			const randomIndex = Math.floor(Math.random() * this.parent.enemies.length);
			const target = this.parent.enemies[randomIndex];
			
			if (target) {
				// Create attack based on DPS child class (Warrior, Rogue, etc.)
				this.createAttack(target);
			}
		}
	}
	
	// Create appropriate attack based on DPS subclass
	createAttack(target: Boss) {
		// This will be overridden in child classes
		const attack = new DamageEffect(this, target);
		this.attacks.add(attack);
	}
}

/**
 * Warrior DPS - Melee fighter with strong attacks
 */
export class Warrior extends DPS {
	createAttack(target: Boss) {
		const attack = new WarriorAttack(this, target);
		this.attacks.add(attack);
	}
}

/**
 * Rogue DPS - Fast attacker with moderate damage
 */
export class Rogue extends DPS {
	createAttack(target: Boss) {
		const attack = new RogueAttack(this, target);
		this.attacks.add(attack);
	}
}
