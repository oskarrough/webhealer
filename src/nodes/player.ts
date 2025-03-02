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
	spellbook: Record<string, typeof Spell> = {
		'Heal': Heal,
		'Flash Heal': FlashHeal,
		'Greater Heal': GreaterHeal,
		'Renew': Renew
	}

	// keep track of spell casting
	startedCastingAt: number = 0
	lastCastTime: number = 0
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

		const SpellClass = player.spellbook[spellName]
		if (!SpellClass) {
			console.warn(`Spell ${spellName} not found in spellbook`)
			return
		}

		player.startedCastingAt = this.parent.elapsedTime
		player.lastCastTime = this.parent.elapsedTime
		player.lastCastSpell = new SpellClass(player)
		player.spell = player.lastCastSpell
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
