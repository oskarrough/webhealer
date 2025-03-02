import {Loop} from 'vroum'
import {log, render} from '../utils'
import {Player} from './player'
import {Tank} from './tank'
import {Nakroth} from './boss'
import {AudioPlayer} from './audio'
import {UI} from '../components/ui-debug'

export class GameLoop extends Loop {
	gameOver = false

	// A global cooldown window that starts after each successful cast. Spells can not be cast during global cooldown.
	gcd = 1500
	element: HTMLElement | null = null // where to render the UI
	muted = true

	audio = new AudioPlayer(this)
	player = new Player(this)
	
	// Replace single tank/boss with arrays for multiple party members and enemies
	party: Tank[] = []
	enemies: Nakroth[] = []

	constructor() {
		super()
		// Initialize with default tank in party
		this.party.push(new Tank(this))
		// Initialize with default boss in enemies
		this.enemies.push(new Nakroth(this))
	}

	// Add helper methods to manage party and enemies
	addPartyMember(member: Tank) {
		this.party.push(member)
	}

	removePartyMember(member: Tank) {
		const index = this.party.indexOf(member)
		if (index > -1) {
			this.party.splice(index, 1)
		}
	}

	addEnemy(enemy: Nakroth) {
		this.enemies.push(enemy)
	}

	removeEnemy(enemy: Nakroth) {
		const index = this.enemies.indexOf(enemy)
		if (index > -1) {
			this.enemies.splice(index, 1)
		}
	}

	// For backwards compatibility, expose tank and boss as getters
	get tank() {
		return this.party[0]
	}

	get boss() {
		return this.enemies[0]
	}

	set boss(value: Nakroth) {
		if (this.enemies.length > 0) {
			this.enemies[0] = value
		} else {
			this.enemies.push(value)
		}
	}

	mount() {
		log('game:mount')
		this.on(GameLoop.PLAY, this.handlePlay)
		this.on(GameLoop.PAUSE, this.handlePause)
		// this.render()
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
