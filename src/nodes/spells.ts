import {Spell} from './spell'
import {HOT} from './hot'
import {GameLoop} from './game-loop'
import {AudioPlayer} from './audio'
import {Character} from './character'

export class Heal extends Spell {
	static name = 'Heal'
	static cost = 295
	static heal = 675
	static castTime = 3000
}

export class FlashHeal extends Spell {
	static name = 'Flash Heal'
	static cost = 380
	static heal = 900
	static castTime = 1500
}

export class GreaterHeal extends Spell {
	static name = 'Greater Heal'
	static cost = 710
	static heal = 2100
	static castTime = 3000
}

export class Renew extends Spell {
	static name = 'Renew'
	static cost = 450
	static castTime = 0

	tick() {
		/** Renew heals indirectly by adding a "RenewHOT" to the target */
		const gameLoop = this.root as GameLoop
		const player = this.parent

		// Use the player's current target if set, otherwise fall back to the tank
		const target = player.currentTarget || gameLoop.tank

		// Apply the RenewHOT effect to the target
		if (target) {
			new RenewHOT(target)
			AudioPlayer.play('spell.rejuvenation')
		}
	}
}

class RenewHOT extends HOT {
	static name = 'Renew'
	static heal = 970
	static interval = 3000
	static repeat = 5

	constructor(parent: Character) {
		super(parent)
		// Copy static properties to instance
		this.name = RenewHOT.name
		this.heal = RenewHOT.heal
		this.interval = RenewHOT.interval
		this.repeat = RenewHOT.repeat
	}
}
