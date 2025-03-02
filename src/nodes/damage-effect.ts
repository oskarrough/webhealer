import {Task} from 'vroum'
import {html, log, randomIntFromInterval} from '../utils'
import {AudioPlayer} from './audio'
import {Character} from './character'

// Event names for damage effects
export const DAMAGE_EFFECT_EVENTS = {
	DAMAGE_APPLIED: 'damageApplied',
	TARGET_KILLED: 'targetKilled',
}

/**
 * Configuration interface for damage effects
 */
export interface DamageEffectConfig {
	name: string
	minDamage: number
	maxDamage: number
	interval: number
	delay: number
	sound?: string
}

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

	constructor(
		public attacker: Character,
		public target: Character,
	) {
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

	/**
	 * Calculate damage amount
	 */
	damage() {
		return randomIntFromInterval(this.minDamage, this.maxDamage)
	}

	/**
	 * Decide whether this task should tick during the current frame
	 * Overrides the default shouldTick to check if attacker is alive
	 * @returns true if the task should tick, false otherwise
	 */
	shouldTick() {
		// Direct attacks should stop if the attacker is dead
		if (this.attacker.health.current <= 0) {
			return false
		}

		// Otherwise, continue with default behavior
		return super.shouldTick()
	}

	/**
	 * Process an attack tick
	 */
	tick() {
		// Skip if target is dead
		if (this.target.health.current <= 0) {
			// Find a new target if available
			this.findNewTarget()
			return
		}

		// Calculate damage to our target
		const damage = this.damage()

		// Apply damage directly to the health
		const actualDamage = this.target.health.damage(damage)

		// Log the damage dealt
		const attackerName = this.attackerName.toLowerCase()
		log(
			`${attackerName}: ${this.name} dealt ${actualDamage} damage to ${this.target.constructor.name}`,
		)

		// Play sound effect
		this.playSound()

		// Create visual feedback
		this.createVisualEffects(actualDamage)

		// Emit event for other systems to use
		this.emit(DAMAGE_EFFECT_EVENTS.DAMAGE_APPLIED, {
			attacker: this.attacker,
			target: this.target,
			damage: actualDamage,
			attackName: this.name,
		})

		// Check if target died
		if (this.target.health.current <= 0) {
			this.emit(DAMAGE_EFFECT_EVENTS.TARGET_KILLED, {
				target: this.target,
			})
		}
	}

	/**
	 * Play sound effect if available
	 */
	playSound() {
		if (this.sound) {
			AudioPlayer.play(this.sound)
			log(`damage-effect: playing sound ${this.sound}`)
		}
	}

	/**
	 * Create visual effects for the attack
	 */
	createVisualEffects(damageAmount: number) {
		// Determine if this is a player/party attack or an enemy attack
		const isPartyAttack =
			this.attacker.parent === this.target.parent &&
			'enemies' in this.attacker.parent &&
			this.attacker.parent.enemies.some((enemy) => enemy === this.target)

		// For enemy attacks on party members, animate the hit
		if (!isPartyAttack) {
			const targetElement = document.querySelector(
				`.PartyMember[data-character-id="${this.targetId}"] .Character-avatar`,
			)
			if (targetElement) this.animateHit(targetElement)
		}

		// Create floating combat text
		const cssClass = isPartyAttack
			? `damage ${this.attackerName.toLowerCase()}-damage`
			: 'damage'

		const fct = html`<floating-combat-text class="${cssClass}"
			>-${damageAmount}</floating-combat-text
		>`.toDOM()

		const container = document.querySelector('.FloatingCombatText')
		if (container) {
			container.appendChild(fct)
		}
	}

	/**
	 * Find a new target when current target dies
	 */
	findNewTarget() {
		// Check if attacker has a parent with enemies list
		if (
			!('parent' in this.attacker) ||
			!this.attacker.parent ||
			!('enemies' in this.attacker.parent)
		) {
			return
		}

		// Use type guard to ensure parent has enemies property
		const parent = this.attacker.parent as unknown as {enemies?: Character[]}
		if (!parent.enemies) return

		// Try to find a living enemy
		const newTarget = parent.enemies.find((enemy) => enemy.health.current > 0)
		if (newTarget) {
			this.target = newTarget
			this.targetId = newTarget.id
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

/** Small, frequent attack with low damage */
export class SmallAttack extends DamageEffect {
	static delay = 0
	static interval = 1500
	static minDamage = 2
	static maxDamage = 10
	static sound = 'combat.air_hit'
	static name = 'Quick Strike'
}

/** Medium attack with moderate damage and frequency */
export class MediumAttack extends DamageEffect {
	static delay = 3100
	static interval = 2800
	static minDamage = 400
	static maxDamage = 850
	static sound = 'combat.strong_punch'
	static name = 'Heavy Blow'
}

/** Heavy attack with high damage but infrequent */
export class HugeAttack extends DamageEffect {
	static delay = 8000
	static interval = 10000
	static minDamage = 800
	static maxDamage = 1200
	static sound = 'combat.fast_punch'
	static name = 'Devastating Slam'
}

/** Tank attack - lower damage but consistent */
export class TankAttack extends DamageEffect {
	static interval = 1800
	static minDamage = 60
	static maxDamage = 90
	static sound = 'combat.sword_hit'
	static name = 'Shield Bash'
}

/** Warrior attack - high damage, slower attack speed */
export class WarriorAttack extends DamageEffect {
	static interval = 2200
	static minDamage = 120
	static maxDamage = 220
	static sound = 'combat.sword_hit'
	static name = 'Mighty Swing'
}

/** Rogue attack - lower damage but fast attack speed */
export class RogueAttack extends DamageEffect {
	static interval = 1000
	static minDamage = 65
	static maxDamage = 95
	static sound = 'combat.sword_hit'
	static name = 'Quick Slash'
}
