import {Task} from 'vroum'
import {WebHealer} from '../game-loop'
import {clamp, log, naturalizeNumber} from '../utils'
import Audio from './audio'
import Player from './player'
import Tank from './tank'
import {GlobalCooldown} from './global-cooldown'

export class Spell extends Task {
	declare loop: WebHealer
	declare parent: Player

	name = ''
	cost = 0
	heal = 0
	repeat = 1

	mount() {
		log('spell:mount')
		this.parent.add(new GlobalCooldown())

		if (this.delay) {
			const audio = this.loop.find(Audio)!
			audio.play('precast', true)
		}
	}
	tick() {
		log('spell:tick')
		if (this.heal) heal(this.loop.find(Tank)!, this.heal)
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

function heal(target: Tank, value: number) {
	const heal = naturalizeNumber(value)
	const amount = clamp(target.health + heal, 0, target.baseHealth)
	const healed = amount - target.health
	/* const overheal = heal - healed */
	target.health = amount

	const container = document.querySelector('.FloatingCombatText')!
	const fct = document.createElement('floating-combat-text')
	fct.textContent = `+${healed}`
	container.appendChild(fct)
}
