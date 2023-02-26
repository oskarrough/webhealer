import {Node} from 'vroum'
import {WebHealer} from '../game-loop'

export default class Audio extends Node {
	declare parent: WebHealer

	folder = '/assets/sounds/'

	playlist: {[key: string]: string} = {
		precast: '1694002.ogg',
		precast_deep: '566717.ogg',
		precast_celestial: '568144.ogg',
		cast: '568017.ogg',
		rejuvenation: '1687853.ogg',
		spell_fizzle: '569772.ogg'
	}

	sound = 'precast'

	element?: HTMLAudioElement

	get src() {
		return this.folder + this.playlist[this.sound]
	}

	// Pass `true` if the sound should repeat loop forever.
	play(sound: string, loop?: boolean) {
		this.sound = sound
		if (!this.element) return
		this.element.src = this.src
		this.element.loop = Boolean(loop)
		this.element.play()
	}

	stop() {
		if (!this.element) return
		this.element.pause()
		this.element.currentTime = 0
	}

	mount() {
		const game = this.parent

		// @todo get rid of this setTimeout
		setTimeout(() => {
			const el = game.element?.querySelector('audio')
			if (el) {
				this.element = el
				this.element.volume = 0.5
			}
		}, 16)
	}
}

// https://www.wowhead.com/sounds/name:precast
// https://www.wowhead.com/sounds/name:greater+heal#0-5
