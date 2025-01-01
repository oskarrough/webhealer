import {Task} from 'vroum'
import Audio from './audio'
import Player from './player'
import Tank from './tank'
import {GlobalCooldown} from './global-cooldown'
import {fct} from '../components/floating-combat-text'
import {clamp, log, naturalizeNumber} from '../utils'

export default class Spell extends Task {
	name = ''
	cost = 0
	heal = 0
	repeat = 1

	applyHeal() {
		const tank = this.Loop.query(Tank)!

		const heal = naturalizeNumber(this.heal)
		const amount = clamp(tank.health + heal, 0, tank.baseHealth)
		// const healed = amount - tank.health
		// const overheal = heal - healed
		tank.health = amount
		fct(`+${heal}`)
		log(`spell:${this.name}:applyHeal`, heal)
	}

	mount() {
		log('spell:mount')
		this.parent?.add(GlobalCooldown.new())

		// Only play for spells with a cast time
		if (this.delay) {
			this.Loop.query(Audio)?.play('precast', true)
		}
	}

	tick() {
		log('spell:tick')
		if (this.heal) this.applyHeal()
		this.Loop.query(Audio)?.play('cast')
	}

	destroy() {
		log('spell:destroy')

		const player = this.Loop.query(Player)!
		delete player?.lastCastSpell

		player.mana = player.mana - this.cost
	}
}

export {Spell}
