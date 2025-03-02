import {Task} from 'vroum'
import {html, log, randomIntFromInterval} from '../utils'
import {AudioPlayer} from './audio'
import {Character} from './character'

/**
 * Base class for all damage effects (attacks from any character to any character)
 */
export class DamageEffect extends Task {
	// Instance properties
	delay = 0 // delay the first cycle
	interval = 1000 // wait between cycles
	duration = 0 // tick once every cycle
	repeat = Infinity
	sound = ''
	name = ''
	minDamage = 0
	maxDamage = 0
	
	// Track attacker and target for proper logging
	attackerName = ''
	targetId: string = ''

	// Static properties for attack definitions
	static delay = 0
	static interval = 1000
	static sound = ''
	static name = 'Generic Attack'
	static minDamage = 0
	static maxDamage = 0

	constructor(public attacker: Character, public target: Character) {
		super(attacker)

		// Copy static properties to instance
		const constructor = this.constructor as typeof DamageEffect
		this.delay = constructor.delay
		this.interval = constructor.interval
		this.sound = constructor.sound
		this.name = constructor.name
		this.minDamage = constructor.minDamage
		this.maxDamage = constructor.maxDamage

		// Store target ID and attacker name for targeting and logs
		this.targetId = target.id
		this.attackerName = attacker.constructor.name
	}

	/* Calculate damage based on min and max damage values */
	damage() {
		return randomIntFromInterval(this.minDamage, this.maxDamage)
	}

	tick() {
		// Skip if target is dead
		if (this.target.health.current <= 0) {
			// Find a new target if available (only for party members attacking)
			if (this.isPartyMemberAttack()) {
				this.findNewTarget();
			}
			return;
		}

		// Deal damage to our target
		const damage = this.damage()

		// Apply damage directly to the health
		const actualDamage = this.target.health.damage(damage)

		// Format log message differently based on attacker
		const attackerType = this.isPartyMemberAttack() ? this.attackerName.toLowerCase() : 'boss';
		log(`${attackerType}: ${this.name} dealt ${actualDamage} damage to ${this.target.constructor.name}`)

		// Sound and animation
		const audio = new AudioPlayer(this.attacker)
		if (this.sound) audio?.play(this.sound)

		// For boss attacks on tanks, animate the hit
		if (!this.isPartyMemberAttack()) {
			this.animateHitOnTank();
		}

		// Create floating combat text
		const cssClass = this.isPartyMemberAttack() 
			? `damage ${this.attackerName.toLowerCase()}-damage` 
			: 'damage';
			
		const fct = html`<floating-combat-text class="${cssClass}"
			>-${actualDamage}</floating-combat-text
		>`.toDOM()
		
		const container = document.querySelector('.FloatingCombatText')
		if (container) {
			container.appendChild(fct)
		}
	}
	
	// Helper to determine if this is a party member attack
	isPartyMemberAttack() {
		// Now we can check more safely since all entities extend Character
		if (!('parent' in this.attacker)) return false;
		
		const parent = this.attacker.parent;
		if (!parent || !parent.enemies) return false;
		
		// Check if target is in the enemies list
		return parent.enemies.some(enemy => enemy === this.target);
	}
	
	// Find a new target for party member attacks
	findNewTarget() {
		if (!('parent' in this.attacker)) return;
		
		const parent = this.attacker.parent;
		if (!parent || !parent.enemies) return;
		
		const newTarget = parent.enemies.find(enemy => enemy.health.current > 0);
		if (newTarget) {
			this.target = newTarget;
			this.targetId = newTarget.id;
		}
	}
	
	// Animate hit on tank (for boss attacks)
	animateHitOnTank() {
		const targetElement = document.querySelector(
			`.PartyMember[data-character-id="${this.targetId}"] .Character-avatar`
		);
		
		if (targetElement) {
			this.animateHit(targetElement);
		}
	}
	
	/* Animates a DOM element to shake and flash a bit */
	animateHit(element: Element) {
		element.classList.add('is-takingDamage')
		const animation = element.animate(
			[
				{transform: 'translate(0, 0)', filter: 'none'},
				{
					transform: `translate(${randomIntFromInterval(-2, 2)}px, ${randomIntFromInterval(-2, 2)}px)`,
					filter: 'brightness(0.5)',
				},
				{transform: 'translate(0, 0)', filter: 'none'},
			],
			{duration: 200, easing: 'ease-in-out'},
		)

		animation.onfinish = () => {
			element.classList.remove('is-takingDamage')
		}
	}
}

/**
 * Small, frequent attack with low damage
 */
export class SmallAttack extends DamageEffect {
	static delay = 0
	static interval = 1500
	static minDamage = 2
	static maxDamage = 10
	static sound = 'air_hit'
	static name = 'Quick Strike'
}

/**
 * Medium attack with moderate damage and frequency
 */
export class MediumAttack extends DamageEffect {
	static delay = 3100
	static interval = 4000
	static minDamage = 400
	static maxDamage = 750
	static sound = 'strong_punch'
	static name = 'Heavy Blow'
}

/**
 * Heavy attack with high damage but infrequent
 */
export class HugeAttack extends DamageEffect {
	static delay = 8000
	static interval = 10000
	static minDamage = 800
	static maxDamage = 1200
	static sound = 'fast_punch'
	static name = 'Devastating Slam'
}

/**
 * Tank attack - lower damage but consistent
 */
export class TankAttack extends DamageEffect {
	static interval = 2000
	static minDamage = 60
	static maxDamage = 90
	static sound = 'sword_hit'
	static name = 'Shield Bash'
}

/**
 * Warrior attack - high damage, slower attack speed
 */
export class WarriorAttack extends DamageEffect {
	static interval = 2000
	static minDamage = 120
	static maxDamage = 180
	static sound = 'sword_hit'
	static name = 'Mighty Swing'
}

/**
 * Rogue attack - lower damage but fast attack speed
 */
export class RogueAttack extends DamageEffect {
	static interval = 1000
	static minDamage = 65
	static maxDamage = 95
	static sound = 'sword_hit'
	static name = 'Quick Slash'
}
