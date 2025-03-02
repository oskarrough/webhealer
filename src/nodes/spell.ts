import {Task} from 'vroum'
import {AudioPlayer} from './audio'
import {GlobalCooldown} from './global-cooldown'
import {fct} from '../components/floating-combat-text'
import {clamp, log, naturalizeNumber} from '../utils'
import {Player} from './player'
import {GameLoop} from './game-loop'

export class Spell extends Task {
	repeat = 1

	// Instance properties
	name = ''
	cost = 0
	heal = 0
	// We'll use castTime instead of delay to avoid conflicts with Task API
	
	// Static properties for spell definitions
	static name = ''
	static cost = 0
	static heal = 0
	static castTime = 0 // Cast time in milliseconds

	audio = new AudioPlayer(this)

	constructor(public parent: Player) {
		super(parent)
		
		// Copy static properties to instance
		const constructor = this.constructor as typeof Spell
		this.name = constructor.name || this.name
		this.cost = constructor.cost || this.cost
		this.heal = constructor.heal || this.heal
		this.delay = constructor.castTime || 0 // Set Task.delay from castTime
	}

	mount() {
		log('spell:mount')
		this.parent.gcd = new GlobalCooldown(this.parent)

		// Only play for spells with a cast time
		if (this.delay) {
			this.audio.play('precast', true)
		}
	}

	tick() {
		log('spell:tick')
		if (this.heal) this.applyHeal()
		this.audio?.stop()
		this.audio?.play('cast')
	}

	destroy() {
		log('spell:destroy')

		const player = this.parent
		
		// Clean up player references
		player.spell = undefined
		
		// If the GCD is not explicitly cleared, it will stay active
		// even after the spell is done
		player.gcd = undefined

		// If the spell finished at least once, consume mana.
		if (this.cycles > 0 && player.mana) {
			player.mana.spend(this.cost)
		}
	}

	applyHeal() {
		const gameLoop = this.root as GameLoop
		const target = gameLoop.tank
		if (!target) return

		const healAmount = naturalizeNumber(this.heal)
		
		// Apply healing using the health node
		const actualHeal = target.heal(healAmount)
		
		// Display and log the healing
		fct(`+${actualHeal}`)
		log(`spell:${this.name}:applyHeal`, actualHeal)
	}
}
