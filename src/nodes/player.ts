import {Character} from './character'
import {log} from '../utils'
import {Heal, FlashHeal, GreaterHeal, Renew} from './spells'
import {Spell} from './spell'
import {GlobalCooldown} from './global-cooldown'
import {GameLoop} from './game-loop'
import {Boss} from './boss'

export class Player extends Character {
	// keep track of spell casting
	lastCastTime: number = 0
	spell: Spell | undefined
	gcd: GlobalCooldown | undefined

	// Track the player's current target
	currentTarget: Character | Boss | undefined

	// owns a list of Spells
	spellbook: Record<string, typeof Spell> = {
		Heal: Heal,
		'Flash Heal': FlashHeal,
		'Greater Heal': GreaterHeal,
		Renew: Renew,
	}

	constructor(public parent: GameLoop) {
		super(parent, {
			maxHealth: 1500,
			hasMana: true,
			maxMana: 2000,
		})

		// Set initial values
		this.lastCastTime = 0

		// We'll set the initial target in the game init code instead of here
	}

	// Set the player's current target
	setTarget(character: Character | Boss | undefined) {
		this.currentTarget = character
		log(`player:target:${character ? character.constructor.name : 'none'}`)
	}

	castSpell(spellName: string) {
		log(`player:cast:${spellName}`)

		// Situations where we do not allow casting.
		if (this.spell) return console.warn('Can not cast while already casting')
		if (this.parent.gameOver) return console.warn('Can not cast while dead. Dummy')
		if (this.gcd) return console.warn('Can not cast during GCD')

		const SpellClass = this.spellbook[spellName]
		if (!SpellClass) {
			console.warn(`Spell ${spellName} not found in spellbook`)
			return
		}

		// Check mana cost BEFORE creating the spell instance
		// Access the static cost property from the SpellClass
		if (SpellClass.cost && this.mana && this.mana.current < SpellClass.cost) {
			console.warn('Not enough mana to cast spell')
			return
		}

		// Only create the spell instance after all checks have passed
		this.spell = new SpellClass(this)

		// Set cast time
		this.lastCastTime = this.parent.elapsedTime
	}
}
