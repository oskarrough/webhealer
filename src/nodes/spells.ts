import {Spell} from './spell'
import PeriodicHeal from './hot'
import Audio from './audio'
import Tank from './tank'

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

class RenewHOT extends PeriodicHeal {
	name = 'Renew'
	heal = 970
	interval = 3000
	repeat = 5
}

// Note, we extends HOT, not Spell here.
export class Renew extends Spell {
	name = 'Renew'
	cost = 450
	// heal = RenewHOT.heal // doesn't have heal, but the HOT does.
	delay = 0
	tick() {
		this.loop.find(Tank)?.add(new RenewHOT())
		this.loop.find(Audio)?.play('rejuvenation')
	}
}
