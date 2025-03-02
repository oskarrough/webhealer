import {Task} from 'vroum'
import {AudioPlayer} from './audio'
import {GlobalCooldown} from './global-cooldown'
import {fct} from '../components/floating-combat-text'
import {clamp, log, naturalizeNumber} from '../utils'
import { Player } from './player'

export class Spell extends Task {
	name = ''
	cost = 0
	heal = 0
	repeat = 1

	audio = new AudioPlayer(this)

	constructor(public parent: Player) {
		super(parent)
	}

	mount() {
		log('spell:mount')
		this.parent.gcd = new GlobalCooldown(this.parent)

		// Only play for spells with a cast time
		if (this.delay) {
			this.audio.play('precast', true)
		}
	}

	tick() {
		log('spell:tick')
		if (this.heal) this.applyHeal()
		this.audio?.stop()
		this.audio?.play('cast')
	}

	destroy() {
		log('spell:destroy')

		const player = this.parent
		delete player?.lastCastSpell

		// If the spell finished at least once, consume mana.
		if (this.cycles > 0) {
			player.mana = player.mana - this.cost
		}
	}

	applyHeal() {
		const target = this.root?.tank
		if (!target) return

		const heal = naturalizeNumber(this.heal)
		const amount = clamp(target.health + heal, 0, target.baseHealth)
		// const healed = amount - tank.health
		// const overheal = heal - healed
		target.health = amount
		fct(`+${heal}`)
		log(`spell:${this.name}:applyHeal`, heal)
	}
}
