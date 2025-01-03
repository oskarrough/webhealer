import {Node, Task} from 'vroum'
import {html, logger, randomIntFromInterval} from '../utils'
import {Tank} from './tank'
import {AudioPlayer} from './audio'

/**
 * This is an example boss that has three different attacks.
 */
export class Boss extends Node {
	image = 'nak.webp'

	build() {
		const smallAttack = DamageEffect.new({
			interval: 1500,
			sound: 'air_hit',
			damage: () => randomIntFromInterval(2, 10),
		})
		const mediumAttack = DamageEffect.new({
			delay: 3100,
			interval: 4000,
			sound: 'strong_punch',
			damage: () => randomIntFromInterval(400, 750),
		})
		const hugeAttack = DamageEffect.new({
			delay: 5950,
			interval: 8000,
			sound: 'fast_punch',
			damage: () => randomIntFromInterval(1100, 1500),
		})
		return [smallAttack, mediumAttack, hugeAttack]
	}
}

/* Define `damage` and `sound */
class DamageEffect extends Task {
	repeat = Infinity
	delay = 0 // delay the first cycle
	duration = 0 // tick once every cycle
	interval = 1000 // wait between cycles

	/* Name of a sound from our playlist to play on tick */
	sound = ''

	/* Overwrite this method to return the damage you need */
	damage() {
		return 0
	}

	build() {
		return [AudioPlayer.new()]
	}

	tick = () => {
		// Deal damage to our hardcoded tank target
		const target = this.Loop.query(Tank)!
		if (!target) return

		const audio = this.query(AudioPlayer)!
		const damage = this.damage()

		target.health = target.health - damage
		logger.debug(`Tank took ${damage} damage`)

		if (this.sound) audio?.play(this.sound)
		const targetElement = document.querySelector('.PartyMember img')
		animateHit(targetElement)

		// Create a floating combat text element for the UI
		const fct = html`<floating-combat-text>-${damage}</floating-combat-text>`.toDOM()
		const container = document.querySelector('.FloatingCombatText')!
		container.appendChild(fct)
	}
}

/* Animates a DOM element to shake and flash a bit */
function animateHit(element) {
	if (!element) return
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
		{
			duration: 200,
			easing: 'ease-in-out',
		},
	)

	animation.onfinish = () => {
		element.classList.remove('is-takingDamage')
	}
}
