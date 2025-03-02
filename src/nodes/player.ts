import {Task} from 'vroum'
import {clamp, log} from '../utils'
import {Heal, FlashHeal, GreaterHeal, Renew} from './spells'
import {Spell} from './spell'
import {GlobalCooldown} from './global-cooldown'
import {GameLoop} from './game-loop'

export class Player extends Task {
	mana = 1900
	baseMana = 2000

	constructor(public parent: GameLoop) {
		super(parent)
	}

	manaRegen = new ManaRegen(this)

	// owns a list of Spells
	spellbook = {Heal, FlashHeal, GreaterHeal, Renew}

	// keep track of spell casting
	startedCastingAt: number = 0
	lastCastSpell: Spell | undefined
	spell: Spell | undefined
	gcd: GlobalCooldown | undefined

	castSpell(spellName: string) {
		const player = this
		log(`player:cast:${spellName}`)

		// Situations where we do not allow casting.
		// if (player.spell) return console.warn('Can not cast while already casting')
		// if (this.parent.gameOver) return console.warn('Can not cast while dead. Dummy')
		// if (spell.cost > player.mana) return console.warn('Not enough player mana')
		// if (player.gcd) return console.warn('Can not cast during GCD')

		const Spell = player.spellbook[spellName]
		console.log('@todo', Spell.cost, Spell.heal, Spell.delay)

		player.startedCastingAt = this.parent.elapsedTime
		player.lastCastSpell = Spell
		player.spell = new Spell(this.parent.tank)
	}
}

// Regenerate mana after X seconds
export class ManaRegen extends Task {
	repeat = Infinity
	downtime = 2000

	constructor(public parent: Player) {
		super(parent)
	}

	tick() {
		const player = this.parent
		if (!player) return
		const timeSinceLastCast = this.root.elapsedTime - player.lastCastTime
		if (timeSinceLastCast > this.downtime) {
			player.mana = clamp(player.mana + 1 / this.root.deltaTime, 0, player.baseMana)
		}
	}
}
