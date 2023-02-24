import {Task} from './web_modules/vroum.js'
import {clamp, log} from './utils.js'
import {Heal, FlashHeal, GreaterHeal, Renew} from './spells.js'

export default class Player extends Task {
	mana = 1900
	baseMana = 2000

	// owns a list of Spells
	spellbook = {Heal, FlashHeal, GreaterHeal, Renew}

	// keep track of spell casting
	lastCastTime = 0
	lastCastSpell = undefined
	get castTime() {
		return this.parent.elapsedTime - this.lastCastTime
	}

	build() {
		return [new ManaRegen()]
	}

	castSpell(spellName) {
		const now = this.loop.elapsedTime

		const player = this

		const spell = new player.spellbook[spellName]()

		spell.target = 'Tank'

		if (spell.cost > player.mana) throw new Error('Not enough player mana')

		if (player.find('GlobalCooldown')) {
			throw new Error('Can not cast during global cooldown')
		}

		log('castSpell', spellName, spell.name)
		player.lastCastTime = now
		player.lastCastSpell = spell

		player.add(spell)
	}
}

// Regenerate mana after X seconds
class ManaRegen extends Task {
	repeat = Infinity
	downtime = 2000
	tick = (loop) => {
		const t = this.parent
		const timeSinceLastCast = loop.elapsedTime - (t.lastCastTime || 0)
		if (timeSinceLastCast > this.downtime) {
			t.mana = clamp(t.mana + 1 / loop.deltaTime, 0, t.baseMana)
		}
	}
}
