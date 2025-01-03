import {Loop, Query} from 'vroum'
import {logger, render} from '../utils'
import {Player} from './player'
import {Tank} from './tank'
import {Boss} from './boss'
import {AudioPlayer} from './audio'
import {UI} from '../components/ui'

export class GameLoop extends Loop {
	gameOver = false

	// A global cooldown window that starts after each successful cast.
	// Spells can not be cast during global cooldown.
	gcd = 1500

	// Where the UI will be rendered.
	element: HTMLElement | null = null

	muted = false

	AudioNode = Query(AudioPlayer)

	build() {
		return [Player.new(), AudioPlayer.new(), Tank.new(), Boss.new()]
	}

	mount() {
		logger.info('mount')
		this.render()
	}

	begin() {
		logger.info('begin')
	}

	tick = () => {
		if (this.gameOver) {
			this.onGameOver()
		}
		this.render()
	}

	render() {
		render(this.element!, UI(this))
	}

	onGameOver() {
		logger.info('game over, pausing game loop')
		this.AudioNode.stop()
		this.pause()
	}
}
