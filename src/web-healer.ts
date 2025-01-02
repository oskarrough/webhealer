import {Loop, Query} from 'vroum'
import {logger, render} from './utils'
import {Player} from './nodes/player'
import {Tank} from './nodes/tank'
import {Boss} from './nodes/boss'
import {Audio} from './nodes/audio'
import {UI} from './ui'

export class WebHealer extends Loop {
	gameOver = false

	// A global cooldown window that starts after each successful cast.
	// Spells can not be cast during global cooldown.
	gcd = 1500

	// Where the UI will be rendered.
	element: HTMLElement | null = null

	AudioNode = Query(Audio)

	build() {
		return [Player.new(), Audio.new(), Tank.new(), Boss.new()]
	}

	mount() {
		logger.info('mount')
		this.render()
	}
	
	render() {
		render(this.element!, UI(this))
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

	onGameOver() {
		logger.info('game over, pausing game loop')
		this.AudioNode.stop()
		this.pause()
	}
}
