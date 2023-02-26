import {Task} from 'vroum'
import {WebHealer} from '../game-loop'
import {clamp, log} from '../utils'
import Audio from './audio'
import Player from './player'
import Tank from './tank'

export class Spell extends Task {
	declare loop: WebHealer
	declare parent: Player

	name = ''
	cost = 0
	heal = 0
	repeat = 1

	mount() {
		log('spell:mount')
		const audio = this.loop.find(Audio)!
		audio.play('precast', true)
		this.parent.add(new GlobalCooldown())
	}
	tick = () => {
		log('spell:tick')
		const target = this.loop.find(Tank)!
		target.health = clamp(target.health + this.heal, 0, target.baseHealth)
		const audio = this.loop.find(Audio)!
		audio.play('cast')
	}
	destroy() {
		log('spell:destroy')

		const player = this.loop.find(Player)!
		player.lastCastTime = 0
		delete player?.lastCastSpell

		player.mana = player.mana - this.cost / 8
	}
}

export class GlobalCooldown extends Task {
	repeat = 1
	delay = 1500
	mount = () => {
		// log('gcd:start')
	}
	destroy() {
		// log('gcd:stop')
	}
}

export class Heal extends Spell {
	name = 'Heal'
	cost = 295
	heal = 675
	delay = 3000
}

export class FlashHeal extends Spell {
	name = 'Flash Heal'
	cost = 380
	heal = 900
	delay = 1500
}

export class GreaterHeal extends Spell {
	name = 'Greater Heal'
	cost = 710
	heal = 2100
	delay = 3000
}

export class HOT extends Spell {
	// overwrite the one from Spell, because we don't want a sound.
	mount() {
		log('hot:mount')
	}
	destroy() {
		log('hot:destroy')
		const player = this.parent as Player
		player.mana = player.mana - this.cost
		player.lastCastTime = 0
		delete player?.lastCastSpell

		const tank = this.loop.find(Tank)!
		tank.effects = tank.effects.filter((x) => !(x instanceof Renew))
	}
}

// Doesn't extend Spell because a heal over time acts differently.
export class Renew extends HOT {
	name = 'Renew'
	cost = 450
	heal = 970
	delay = 0
	repeat = 5
	interval = 3000 // time between ticks

	tick = () => {
		log('hot:tick', this.cycles, this.repeat)

		const loop = this.loop as WebHealer
		const tank = this.loop.find(Tank)!
		const player = this.parent as Player
		const audio = this.loop.find(Audio)!

		// Instantly cost mana + add buff to tank.
		if (this.cycles === 0) {
			log('hot:first tick')
			player.add(new GlobalCooldown())
			player.lastCastTime = 0
			player.mana = player.mana - this.cost
			tank.effects.push(new Renew())
			audio.play('rejuvenation')
		}

		const scaledHealing = tank.health + this.heal / this.repeat / loop.deltaTime
		const amount = clamp(scaledHealing, 0, tank.baseHealth)
		tank.health = amount
	}
}
