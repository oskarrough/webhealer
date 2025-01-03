import {Task} from 'vroum'
import {AudioPlayer} from './audio'
import {Player} from './player'
import {Tank} from './tank'
import {GlobalCooldown} from './global-cooldown'
import {fct} from '../components/floating-combat-text'
import {clamp, log, naturalizeNumber} from '../utils'

export class Spell extends Task {
	name = ''
	cost = 0
	heal = 0
	repeat = 1

	mount() {
		log('spell:mount')
		this.parent?.add(GlobalCooldown.new())

		// Only play for spells with a cast time
		if (this.delay) {
			this.add(AudioPlayer.new())
			this.query(AudioPlayer)?.play('precast', true)
		}
	}

	tick() {
		log('spell:tick')
		if (this.heal) this.applyHeal()
		this.query(AudioPlayer)?.stop()
		this.query(AudioPlayer)?.play('cast')
	}

	destroy() {
		log('spell:destroy')

		const player = this.Loop.query(Player)!
		delete player?.lastCastSpell

		// If the spell finished at least once, consume mana.
		if (this.cycles > 0) {
			player.mana = player.mana - this.cost
		}
	}

	applyHeal() {
		const target = this.Loop.query(Tank)!
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
