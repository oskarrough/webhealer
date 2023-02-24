import {Task} from './web_modules/vroum.js'
import {clamp, log} from './utils.js'

export class Spell extends Task {
	cost = 0
	heal = 0
	// delay = 0
	repeat = 1
	// interval = 0
	mount() {
		this.target = this.loop.find(this.target)
		this.parent.add(new GlobalCooldown())
	}
	tick = () => {
		log('spell tick')
		const {target} = this
		target.health = clamp(target.health + this.heal, 0, target.baseHealth)
	}
	beforeDestroy() {
		delete this.parent.lastCastTime
		this.parent.mana = this.parent.mana - this.cost / 8
		log('spell destroyed')
	}
}

export class GlobalCooldown extends Task {
	repeat = 1
	delay = 1500
	mount = () => {
		log('gcd start')
	}
	beforeDestroy() {
		log('gcd stop')
	}
}

export class Heal extends Spell {
	name = 'Heal'
	cost = 295
	heal = 675
	delay = 20000
}

export class FlashHeal extends Spell {
	name = 'Flash Heal'
	cost = 380
	heal = 880
	delay = 1500
}

export class GreaterHeal extends Spell {
	name = 'Greater Heal'
	cost = 370
	heal = 1100
	delay = 3000
}

// Doesn't extend Spell because a heal over time acts differently.
export class Renew extends Task {
	name = 'Renew'
	cost = 410
	heal = 970
	delay = 0
	repeat = 5
	interval = 5000 / 5

	tick = (loop) => {
		const target = this.loop.find('Tank')

		// Instantly cost mana + add buff to tank.
		if (this.cycles === 0) {
			this.parent.add(new GlobalCooldown())
			delete this.parent.lastCastTime
			this.parent.mana = this.parent.mana - this.cost
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
}
