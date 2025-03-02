import {log} from '../utils'
import {GameLoop} from './game-loop'
import {Spell} from './spell'
import {Heal, FlashHeal, GreaterHeal, Renew} from './spells'
import {GlobalCooldown} from './global-cooldown'
import {Character, FACTION} from './character'
import {Mana} from './mana'
import {Health} from './health'

export class Player extends Character {
	// keep track of spell casting
	lastCastTime = 0
	lastCastCompletedTime = 0
	spell: Spell | undefined
	gcd: GlobalCooldown | undefined

	// owns a list of Spells
	spellbook: Record<string, typeof Spell> = {
		Heal: Heal,
		'Flash Heal': FlashHeal,
		'Greater Heal': GreaterHeal,
		Renew: Renew,
	}

	health = new Health(this, 1500)
	mana = new Mana(this, 2000)

	constructor(public parent: GameLoop) {
		super(parent)
		this.autoPilot = false
		this.faction = FACTION.PARTY
	}

	/**
	 * Mount the player
	 * Player is controlled by user so doesn't need automatic targeting
	 */
	mount() {
		// Player is controlled by user, so no automatic targeting needed
		// Other initialization can go here if needed
	}

	// Override setTarget to handle Boss targets
	// Need to override since base class method only accepts Character | undefined
	setTarget(character: Character | undefined) {
		// Boss is already a Character type, so we don't need special handling
		this.currentTarget = character
		log(
			`${this.constructor.name}:target:${character ? character.constructor.name : 'none'}`,
		)
	}

	castSpell(spellName: string) {
		log(`player:cast:${spellName}`)

		if (this.spell) return console.warn('Can not cast while already casting')
		if (this.health.current <= 0) return console.warn('Can not cast while dead. Dummy')
		if (this.gcd) return console.warn('Can not cast during GCD')
		const SpellClass = this.spellbook[spellName]
		if (!SpellClass) {
			console.warn(`Spell ${spellName} not found in spellbook`)
			return
		}

		if (SpellClass.cost && this.mana && this.mana.current < SpellClass.cost) {
			console.warn('Not enough mana to cast spell')
			return
		}

		this.spell = new SpellClass(this)
		this.lastCastTime = this.parent.elapsedTime
	}
}
