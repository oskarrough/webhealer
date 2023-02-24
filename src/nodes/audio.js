import {Node} from 'vroum'

export default class Audio extends Node {
	folder = './assets/sounds/'
	playlist = {
		precast: '1694002.ogg',
		precast_deep: '566717.ogg',
		precast_celestial: '568144.ogg',
		cast: '568017.ogg',
		rejuvenation: '1687853.ogg',
	}

	sound = 'precast'

	get src() {
		return this.folder + this.playlist[this.sound]
	}

	// Pass `true` if the sound should repeat loop forever.
	play(sound, loop) {
		this.sound = sound
		this.el.src = this.src
		this.el.loop = loop
		this.el.play()
	}

	stop() {
		this.el.pause()
		this.el.currentTime = 0
	}

	mount() {
		// @todo get rid of this setTimeout
		setTimeout(() => {
			this.el = this.parent.element.querySelector('audio')
			this.el.volume = 0.5
		}, 16)
	}
}

// https://www.wowhead.com/sounds/name:precast
// https://www.wowhead.com/sounds/name:greater+heal#0-5
