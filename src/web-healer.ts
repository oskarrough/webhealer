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
		return [Player.new(), Tank.new(), Boss.new(), Audio.new()]
	}

	mount() {
		render(this.element!, UI(this))
		logger.info('mount')
	}

	begin() {
		logger.info('begin')
	}

	tick = () => {
		if (this.gameOver) {
			this.gameover()
		}
		render(this.element!, UI(this))
	}

	gameover() {
		logger.info('game over')
		this.AudioNode.stop()
		this.pause()
		// document.documentElement.classList.add('gameover')
		// document.documentElement.classList.remove('is-started')
	}
}
