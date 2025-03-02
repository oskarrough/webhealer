import {Spell} from './spell'
import {HOT} from './hot'
import {GameLoop} from './game-loop'

export class Heal extends Spell {
	name = 'Heal'
	static cost = 295
	static heal = 675
	delay = 3000
}

export class FlashHeal extends Spell {
	name = 'Flash Heal'
	static cost = 380
	static heal = 900
	delay = 1500
}

export class GreaterHeal extends Spell {
	name = 'Greater Heal'
	static cost = 710
	static heal = 2100
	delay = 3000
}

export class Renew extends Spell {
	name = 'Renew'
	static cost = 450
	delay = 0

	tick() {
		/** Renew heals indirectly by adding a "RenewHOT" to the target */
		// this.parent?.tank?.effects.push(new RenewHOT())
		// this.parent?.audio?.play('rejuvenation')
	}
}

class RenewHOT extends HOT {
	name = 'Renew'
	static heal = 970
	interval = 3000
	repeat = 5
}
