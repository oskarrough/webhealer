import {Loop} from 'vroum'
import {log, render} from '../utils'
import {Player} from './player'
import {Tank} from './tank'
import {Nakroth, Imp} from './boss'
import {Warrior} from './dps'
import {AudioPlayer} from './audio'
import {UI} from '../components/ui'
import { DevConsole } from '../components/dev-console'

/**
 * Types of characters in the game
 */
type Character = Player | Tank | Warrior
type Enemy = Nakroth | Imp

/**
 * Main game loop that manages the game state and updates
 */
export class GameLoop extends Loop {
	gameOver = false

	// A global cooldown window that starts after each successful cast. Spells can not be cast during global cooldown.
	gcd = 1500
	element: HTMLElement | null = null // where to render the UI
	
	// Private mute state - use getter/setter to sync with AudioPlayer
	private _muted = true

	audio = new AudioPlayer(this)

	// Game state arrays
	party: Character[] = []
	enemies: Enemy[] = []

	// Developer mode properties
	godMode = false
	infiniteMana = false
	speed = 1.0
	developerConsole!: DevConsole

	constructor() {
		super()

		// Initialize players and party
		const player = new Player(this)
		const tank = new Tank(this)
		const dps = new Warrior(this)

		// Initialize enemies
		const boss = new Nakroth(this)
		const imp = new Imp(this)
		
		// Add to respective arrays
		this.party.push(player, tank, dps)
		this.enemies.push(boss, imp)

		// Set initial target for the player
		player.setTarget(tank)

		// DevConsole is now initialized in main.ts
	}
	
	// Getter and setter for muted property that syncs with AudioPlayer
	get muted(): boolean {
		return this._muted
	}
	
	set muted(value: boolean) {
		// Only update if value is changing
		if (this._muted !== value) {
			this._muted = value
			log(`game: mute set to ${value}`)
			
			// Sync with AudioPlayer
			if (AudioPlayer.global) {
				AudioPlayer.global.muted = value
				log(`game: synced mute state with AudioPlayer: ${value}`)
			}
		}
	}

	get player(): Player {
		return this.party[0] as Player
	}

	get tank(): Tank {
		return this.party[1] as Tank
	}

	mount() {
		log('game:mount')
		this.on(GameLoop.PLAY, this.handlePlay)
		this.on(GameLoop.PAUSE, this.handlePause)
	}

	handlePlay() {
		log('game:play')
	}

	handlePause() {
		log('game:pause')
	}

	begin() {
		log('game:begin')
	}

	tick() {
		if (this.gameOver) {
			this.onGameOver()
		}
		this.render()
	}

	render() {
		if (!this.element) {
			console.warn('No element to render to')
			return
		}
		render(this.element, UI(this))
	}

	onGameOver() {
		log('game over, pausing game loop')
		this.audio.stop()
		this.pause()
	}
}
