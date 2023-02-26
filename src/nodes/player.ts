import {Task} from 'vroum'
import {WebHealer} from '../game-loop'
import {clamp, logger} from '../utils'
import {Heal, FlashHeal, GreaterHeal, Renew, Spell} from './spells'

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
		if (this.root.gameOver) return
		if (spell.cost > player.mana) throw new Error('Not enough player mana')
		if (player.find('GlobalCooldown')) throw new Error('Can not cast during GCD')
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
