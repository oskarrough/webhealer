import {Spell} from './spell'
import {HOT} from './hot'
import {GameLoop} from './game-loop'

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

export class Renew extends Spell {
	name = 'Renew'
	cost = 450
	delay = 0

	tick() {
		/** Renew heals indirectly by adding a "RenewHOT" to the target */
		// this.parent?.tank?.effects.push(new RenewHOT())
		// this.parent?.audio?.play('rejuvenation')
	}
}

class RenewHOT extends HOT {
	name = 'Renew'
	heal = 970
	interval = 3000
	repeat = 5
}
