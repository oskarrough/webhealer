import {Spell} from './spell'
import {HOT} from './hot'
import {GameLoop} from './game-loop'
import {Tank} from './tank'

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
		const tank = gameLoop.tank

		if (tank) {
			const renewHOT = new RenewHOT(tank)
			tank.addEffect(renewHOT)
			this.audio?.play('rejuvenation')
		}
	}
}

class RenewHOT extends HOT {
	static name = 'Renew'
	static heal = 970
	static interval = 3000
	static repeat = 5

	name = 'Renew'
	heal = 970
	interval = 3000
	repeat = 5
}
