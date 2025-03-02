import {Character} from './character'
import {GameLoop} from './game-loop'
import {HOT} from './hot'
import {HEALTH_EVENTS} from './health'

export class Tank extends Character {
	// Array to store active effects on the tank
	effects: HOT[] = []

	constructor(public parent: GameLoop) {
		super(parent, {
			maxHealth: 4000,
			hasMana: false
		})
		
		// Listen for health empty event to end the game
		this.health.on(HEALTH_EVENTS.EMPTY, this.onHealthEmpty)
	}
	
	private onHealthEmpty = () => {
		this.parent.gameOver = true
	}
	
	// Method to add an effect to the tank
	addEffect(effect: HOT) {
		this.effects.push(effect)
	}
}
