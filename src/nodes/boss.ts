import {Node, Task} from 'vroum'
import {html, log, randomIntFromInterval} from '../utils'
import {GameLoop} from './game-loop'
import {AudioPlayer} from './audio'
import {Player} from './player'
import {Tank} from './tank'

/**
 * This is an example boss that has three different attacks.
 */
export class Boss extends Node {
	image = 'nak.webp'
	attacks = new Set<DamageEffect>()
	health = 10000

	constructor(public parent: GameLoop) {
		super(parent)
	}

	mount() {
		// console.log('this.root.tasks', this.root.tasks)
		// this.attacks.add(new smallAttack(this.parent?.tank))
		// this.attacks.add(new mediumAttack(this.parent.tank))
		// this.attacks.add(new hugeAttack(this.parent.tank))
		// this.damageEffects.forEach(effect => effect.play())
	}
}

/* Define `damage` and `sound */
class DamageEffect extends Task {
	delay = 0 // delay the first cycle
	interval = 1000 // wait between cycles
	duration = 0 // tick once every cycle
	repeat = Infinity

	/* Name of a sound from our playlist to play on tick */
	sound = ''

	constructor(public parent: Player | Tank | Boss) {
		super(parent)
	}

	/* Overwrite this method to return the damage you need */
	damage() {
		return 0
	}

	tick() {
		const target = this.parent
		if (!target) return

		// Deal damage to our hardcoded tank target
		const damage = this.damage()
		target.health = target.health - damage
		log(`boss: dealt ${damage} damage to tank`)

		// Sound and animation
		const audio = new AudioPlayer(this.parent)
		if (this.sound) audio?.play(this.sound)
		const targetElement = document.querySelector('.PartyMember img')!
		animateHit(targetElement)

		// Create a floating combat text element for the UI
		const fct = html`<floating-combat-text>-${damage}</floating-combat-text>`.toDOM()
		const container = document.querySelector('.FloatingCombatText')!
		container.appendChild(fct)
	}
}

class smallAttack extends DamageEffect {
	interval = 1500
	damage = () => randomIntFromInterval(2, 10)
	sound = 'air_hit'
}

class mediumAttack extends DamageEffect {
	delay = 3100
	interval = 4000
	damage = () => randomIntFromInterval(400, 750)
	sound = 'strong_punch'
}

class hugeAttack extends DamageEffect {
	delay = 5950
	interval = 8000
	damage = () => randomIntFromInterval(1100, 1500)
	sound = 'fast_punch'
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
