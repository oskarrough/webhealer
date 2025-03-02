import {Task} from 'vroum'
import {AudioPlayer} from './audio'
import {GlobalCooldown} from './global-cooldown'
import {fct} from '../components/floating-combat-text'
import {log, naturalizeNumber} from '../utils'
import {Player} from './player'
import {GameLoop} from './game-loop'

export class Spell extends Task {
	repeat = 1

	// Instance properties
	name = ''
	cost = 0
	heal = 0
	// We'll use castTime instead of delay to avoid conflicts with Task API

	// Track active audio elements for this spell
	private spellSounds: HTMLAudioElement[] = []

	// Static properties for spell definitions
	static name = ''
	static cost = 0
	static heal = 0
	static castTime = 0 // Cast time in milliseconds

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
			// Play and track the precast sound
			log(`spell:${this.name}:playing precast sound`)
			const audio = AudioPlayer.play('spell.precast', true)
			if (audio) {
				this.spellSounds.push(audio)
				log(`spell:${this.name}:tracked precast sound`)
			} else {
				log(`spell:${this.name}:failed to play precast sound`)
			}
		}
	}

	tick() {
		log('spell:tick')

		if (this.heal) this.applyHeal()

		// Stop current spell sounds
		this.stopSounds()

		// Play and track the cast sound
		log(`spell:${this.name}:playing cast sound`)
		const audio = AudioPlayer.play('spell.cast')
		if (audio) {
			this.spellSounds.push(audio)
			log(`spell:${this.name}:tracked cast sound`)
		} else {
			log(`spell:${this.name}:failed to play cast sound`)
		}
	}

	// Stop only this spell's sounds
	stopSounds() {
		const count = this.spellSounds.length
		if (count === 0) return

		log(`spell:${this.name}:stopping ${count} sounds`)
		// Stop all audio elements tracked by this spell
		this.spellSounds.forEach((audio) => {
			try {
				audio.pause()
				audio.currentTime = 0
			} catch (e) {
				log(`spell:error stopping sound: ${e}`)
			}
		})
		this.spellSounds = []
	}

	destroy() {
		log(`spell:${this.name}:destroy`)

		// Make sure to stop any sounds when the spell is destroyed
		this.stopSounds()

		const player = this.parent
		const gameLoop = this.root as GameLoop

		// Clean up player references
		player.spell = undefined

		// For instant cast spells (delay === 0), let the GCD expire naturally
		// Only clear GCD immediately for spells that were interrupted before completion
		if (this.delay > 0) {
			player.gcd = undefined
		}

		// If the spell finished at least once and infiniteMana is not enabled, consume mana
		if (this.cycles > 0 && player.mana && !gameLoop.infiniteMana) {
			player.mana.spend(this.cost)
		}
	}

	applyHeal() {
		const gameLoop = this.root as GameLoop
		const player = this.parent

		// Use the player's current target if set, otherwise fall back to the tank
		const target = player.currentTarget || gameLoop.tank
		if (!target) return

		const healAmount = naturalizeNumber(this.heal)

		// Apply healing directly to target's health node
		const actualHeal = target.health.heal(healAmount)

		// Display and log the healing
		fct(`+${actualHeal}`)
		log(`spell:${this.name}:applyHeal`, actualHeal)
	}
}
