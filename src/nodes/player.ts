import {Task} from 'vroum'
import {WebHealer} from '../game-loop'
import {clamp, logger} from '../utils'
import {Heal, FlashHeal, GreaterHeal, Renew} from './spells'
import {Spell} from './spell'

export default class Player extends Task {
	declare root: WebHealer
	mana = 1900
	baseMana = 2000

	// owns a list of Spells
	spellbook: {[key: string]: typeof Spell} = {Heal, FlashHeal, GreaterHeal, Renew}

	// keep track of spell casting
	lastCastTime: number = 0
	lastCastSpell: Spell | undefined

	build() {
		return [new ManaRegen()]
	}

	castSpell(spellName: string) {
		const player = this
		const spell = new player.spellbook[spellName]()
		logger.debug('player:cast', spellName)

		// Situations where we don't want to allow casting.
		if (player.lastCastTime > 0) return console.warn('Can not cast while already casting')
		if (this.root.gameOver) return console.warn('Can not cast while dead. Dummy')
		if (spell.cost > player.mana) return console.warn('Not enough player mana')
		if (player.find('GlobalCooldown')) return console.warn('Can not cast during GCD')

		player.lastCastTime = this.loop.elapsedTime
		player.lastCastSpell = spell
		player.add(spell)
	}
}

// Regenerate mana after X seconds
class ManaRegen extends Task {
	repeat = Infinity
	downtime = 2000
	tick = () => {
		const loop = this.loop
		const t = this.parent as Player
		const timeSinceLastCast = loop.elapsedTime - (t.lastCastTime || 0)
		if (t && timeSinceLastCast > this.downtime) {
			t.mana = clamp(t.mana + 1 / loop.deltaTime, 0, t.baseMana)
		}
	}
}
