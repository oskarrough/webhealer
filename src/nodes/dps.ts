import {Character} from './character'
import {log, randomIntFromInterval, html} from '../utils'
import {GameLoop} from './game-loop'
import {Boss} from './boss'

/**
 * DPS class that automatically attacks enemies
 */
export class DPS extends Character {
	// Combat stats
	damage = 100
	baseAttackSpeed = 1500 // ms between attacks

	// Tracking
	lastAttackTime = 0
	targetEnemy: Boss | null = null

	constructor(public parent: GameLoop) {
		super(parent, {
			maxHealth: 2000,
			hasMana: false,
		})
	}

	mount() {
		// Find an enemy to attack
		this.updateTarget()
	}

	tick() {
		// Check if we have a target, otherwise find one
		if (!this.targetEnemy && this.parent.enemies.length > 0) {
			this.updateTarget()
		}

		// Don't attack if no target or if cooldown not ready
		if (!this.targetEnemy) return
		if (this.parent.elapsedTime - this.lastAttackTime < this.baseAttackSpeed) return

		// Attack the target
		this.attackTarget()
	}

	updateTarget() {
		// Find the first alive enemy
		this.targetEnemy =
			this.parent.enemies.find((enemy) => enemy.health.current > 0) || null
	}

	attackTarget() {
		if (!this.targetEnemy) return

		// Calculate damage with some randomness
		const damage = randomIntFromInterval(
			Math.floor(this.damage * 0.8),
			Math.floor(this.damage * 1.2),
		)

		// Apply damage to the target
		const actualDamage = this.targetEnemy.health.damage(damage)
		this.lastAttackTime = this.parent.elapsedTime

		// Log the attack
		log(
			`dps: ${this.constructor.name} dealt ${actualDamage} damage to ${this.targetEnemy.name}`,
		)

		// Create floating combat text
		const fct = html`<floating-combat-text class="damage"
			>-${actualDamage}</floating-combat-text
		>`.toDOM()

		// Find the enemy element in the DOM and attach the floating text
		// const enemySelector = `.Enemy[data-enemy-id="${this.targetEnemy.id}"]`
		const container = document.querySelector('.FloatingCombatText')
		if (container) {
			container.appendChild(fct)
		}

		// If the enemy died, find a new target
		if (this.targetEnemy.health.current <= 0) {
			log(`dps: ${this.constructor.name} killed ${this.targetEnemy.name}`)
			this.updateTarget()
		}
	}
}

/**
 * Warrior DPS - Melee fighter with strong attacks
 */
export class Warrior extends DPS {
	damage = 150
	baseAttackSpeed = 2000 // Slower but hits harder
}

/**
 * Rogue DPS - Fast attacker with moderate damage
 */
export class Rogue extends DPS {
	damage = 80
	baseAttackSpeed = 1000 // Faster attacks
}
