import {Task} from './web_modules/vroum.js'
import {clamp, log} from './utils.js'

export class Spell extends Task {
	cost = 0
	heal = 0
	// delay = 0
	// repeat = 1
	// interval = 0
	mount() {
		this.parent.casting = {
			time: this.loop.elapsedTime,
			spell: this,
		}
		this.target = this.loop.find('Tank')
	}
	tick = () => {
		console.log('spell tick')
		const {target} = this
		target.health = clamp(target.health + this.heal, 0, target.baseHealth)
	}
	beforeDestroy() {
		this.parent.mana = this.parent.mana - this.cost
		delete this.parent.casting
		console.log('destroyed')
	}
}

export class Heal extends Spell {
	name = 'Heal'
	cost = 295
	heal = 675
	delay = 3000
	repeat = 1
}

export class FlashHeal extends Spell {
	name = 'Flash Heal'
	cost = 380
	heal = 880
	delay = 1500
	repeat = 1
}

export class GreaterHeal extends Spell {
	name = 'Greater Heal'
	cost = 370
	heal = 1100
	delay = 3000
	repeat = 1
}

export class Renew extends Task {
	name = 'Renew'
	cost = 410
	heal = 970
	delay = 0
	repeat = 5
	interval = 5000 / 5

	mount() {
		this.parent.mana = this.parent.mana - this.cost
		this.target = this.loop.find('Tank')

		delete this.parent.casting
	}
	tick = (loop) => {
		const {target} = this

		if (this.cycles === 0) {
			target.effects.push(this)
		}

		const amount = clamp(
			target.health + this.heal / this.repeat / loop.deltaTime,
			0,
			target.baseHealth
		)
		target.health = amount
	}

	beforeDestroy() {
		this.parent.mana = this.parent.mana - this.cost
		log('@todo remove renew effect from tank')
	}

	// tick = (loop) => {
	// 	const target = loop.find('Tank')
	// 	const amount = clamp(target.health + this.heal / this.repeat, 0, target.baseHealth)
	// 	console.log('tick', this.cycles, amount)
	// 	target.health = amount
	// }
}
