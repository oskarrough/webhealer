import {Loop} from 'vroum'
import {log, render} from '../utils'
import {Player} from './player'
import {Tank} from './tank'
import {Boss, Nakroth} from './boss'
import {AudioPlayer} from './audio'
import {UI} from '../components/ui'

export class GameLoop extends Loop {
	gameOver = false

	// A global cooldown window that starts after each successful cast. Spells can not be cast during global cooldown.
	gcd = 1500
	element: HTMLElement | null = null // where to render the UI
	muted = true

	audio = new AudioPlayer(this)
	player = new Player(this)
	tank = new Tank(this)
	boss = new Nakroth(this)

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
