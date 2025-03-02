import {Character} from './character'
import {GameLoop} from './game-loop'
import {HOT} from './hot'
import {HEALTH_EVENTS} from './health'
import {TankAttack} from './damage-effect'

export class Tank extends Character {
	// Array to store active effects on the tank
	effects: HOT[] = []
	
	// Attacks collection
	attacks = new Set<TankAttack>()

	constructor(public parent: GameLoop) {
		super(parent, {
			maxHealth: 4000,
			hasMana: false,
		})

		// Listen for health empty event to end the game
		this.health.on(HEALTH_EVENTS.EMPTY, this.onHealthEmpty)
	}

	mount() {
		// Find an enemy to attack
		if (this.parent.enemies.length > 0) {
			const firstEnemy = this.parent.enemies[0];
			if (firstEnemy) {
				// Create attack task targeting the first enemy
				const attack = new TankAttack(this, firstEnemy);
				this.attacks.add(attack);
			}
		}
	}

	private onHealthEmpty = () => {
		this.parent.gameOver = true
	}

	// Method to add an effect to the tank
	addEffect(effect: HOT) {
		this.effects.push(effect)
	}
}
