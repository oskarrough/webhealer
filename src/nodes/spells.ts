import {log} from '../utils'
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

// Note, we extends HOT, not Spell here.
export class Renew extends Spell {
	name = 'Renew'
	cost = 450
	heal = 970
	delay = 0
	// lasts 15 seconds but we can't see that, because it is define don the periodic heal.

	tick() {
		// Instantly cost mana + apply effect to tank.
		log('renew<Spell>:tick')

		// Apply effect to target.
		const tank = this.loop.find(Tank)!
		tank.add(new RenewHOT())

		// Play sound effect
		const audio = this.loop.find(Audio)!
		audio.play('rejuvenation')
	}
}

export class RenewHOT extends PeriodicHeal {
	name = 'Renew'
	heal = 970
	interval = 3000
	repeat = 5
}
