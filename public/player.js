import {Task} from './web_modules/vroum.js'
import {clamp, log} from './utils.js'
import {Heal, FlashHeal, GreaterHeal, Renew} from './spells.js'

// class Spellbook extends Node {}

export default class Player extends Task {
	mana = 1900
	baseMana = 2000

	// owns a list of Spells
	spells = {Heal, FlashHeal, GreaterHeal, Renew}

	/** @prop {{time: Number, spell: Spell}} */
	casting = undefined

	get castTime() {
		return this.parent.elapsedTime - this.casting?.time
	}

	/**
	 * Global cooldown is active X ms after finishing a spell cast.
	 * @prop {Boolean} */
	get gcd() {
		return this.castTime > this.parent.gcd
	}

	build() {
		// const spellbook = new Spellbook()
		// spellbook.add()
		return [new ManaRegen()]
	}

	tick() {
		// if (this.casting && this.castTime > this.casting.spell.delay) {
		// 	delete this.casting
		// }
	}

	// has a method to start casting spells
	castSpell(spellName) {
		const player = this
		const spell = new player.spells[spellName]()
		log('castSpell', spellName, spell.name)

		// // const sameSpell = spellId === player.lastSpellId
		if (player.gcd) throw new Error('Can not cast during global cooldown')
		if (spell.cost > player.mana) throw new Error('Not enough player mana')

		player.casting = {
			time: this.loop.elapsedTime,
			spell,
		}
		player.add(spell)
	}
}

class ManaRegen extends Task {
	repeat = Infinity
	tick = (loop) => {
		const t = this.parent
		loop.del
		// Regenerate mana after X seconds
		const timeSinceLastCast = loop.elapsedTime - (t.casting?.time || 0)
		if (timeSinceLastCast > 2000) {
			t.mana = clamp(t.mana + 1 / loop.deltaTime, 0, t.baseMana)
		}
	}
}
