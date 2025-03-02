import {Task} from 'vroum'
import {html, log, randomIntFromInterval} from '../utils'
import {AudioPlayer} from './audio'
import {Tank} from './tank'

/**
 * Base class for all damage effects
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

	// Static properties for attack definitions
	static delay = 0
	static interval = 1000
	static sound = ''
	static name = 'Generic Attack'
	static minDamage = 0
	static maxDamage = 0

	constructor(public parent: Tank) {
		super(parent)
		
		// Copy static properties to instance
		const constructor = this.constructor as typeof DamageEffect
		this.delay = constructor.delay
		this.interval = constructor.interval
		this.sound = constructor.sound
		this.name = constructor.name
		this.minDamage = constructor.minDamage
		this.maxDamage = constructor.maxDamage
	}

	/* Calculate damage based on min and max damage values */
	damage() {
		return randomIntFromInterval(this.minDamage, this.maxDamage)
	}

	tick() {
		const target = this.parent
		if (!target) return

		// Deal damage to our target
		const damage = this.damage()
		target.health = target.health - damage
		log(`boss: ${this.name} dealt ${damage} damage to tank`)

		// Sound and animation
		const audio = new AudioPlayer(this.parent)
		if (this.sound) audio?.play(this.sound)
		
		// Update to target the placeholder avatar instead of img
		const targetElement = document.querySelector(`.PartyMember[data-member-id="${target.id}"] .placeholder-avatar`)
		if (targetElement) {
			animateHit(targetElement)
		}

		// Create a floating combat text element for the UI
		const fct = html`<floating-combat-text>-${damage}</floating-combat-text>`.toDOM()
		const container = document.querySelector('.FloatingCombatText')!
		container.appendChild(fct)
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
	static delay = 5950
	static interval = 8000
	static minDamage = 1100
	static maxDamage = 1500
	static sound = 'fast_punch'
	static name = 'Devastating Slam'
}

/* Animates a DOM element to shake and flash a bit */
function animateHit(element: Element) {
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