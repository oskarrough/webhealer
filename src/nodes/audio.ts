import {Node} from 'vroum'
import {WebHealer} from '../web-healer'
import {logger} from '../combatlog'

/**
 * Meant to be used as a global sound manager
 * Define the sounds in the `playlist`, and call `play(sound)`
 */
export class AudioPlayer extends Node {
	declare parent: WebHealer

	folder = '/assets/sounds/'
	disabled = false

	playlist: {[key: string]: string} = {
		// spells
		precast: '1694002.ogg',
		precast_deep: '566717.ogg',
		precast_celestial: '568144.ogg',
		cast: '568017.ogg',
		rejuvenation: '1687853.ogg',
		spell_fizzle: '569772.ogg',
		// hits
		air_hit: 'air-in-a-hit-2161.wav',
		arrow: 'arrow-shot-through-air-2771.wav',
		ball_tap: 'game-ball-tap-2073.wav',
		body_punch: 'body-punch-quick-hit-2153.wav',
		fast_blow: 'fast-blow-2144.wav',
		fast_punch: 'martial-arts-fast-punch-2047.wav',
		punch_through_air: 'punch-through-air-2141.mp3',
		quick_punch: 'soft-quick-punch-2151.wav',
		strong_punch: 'strong-punches-to-the-body-2198.wav',
		strong_punch2: 'impact-of-a-strong-punch-2155.mp3'
	}

	audioElements: HTMLAudioElement[] = []

	mount() {}

	play(sound: string, loop?: boolean) {
		if (this.disabled) return
		logger.debug(`audio:${sound}`)
		const src = this.folder + this.playlist[sound]
		const a = new Audio(src)
		a.volume = 0.5
		a.loop = Boolean(loop)
		a.muted = this.disabled
		// a.onended = () => {
		// 	a.pause()
		// 	a.remove()
		// }
		this.audioElements.push(a)
		a.play()
	}

	stop() {
		for (const a of this.audioElements) {
			a.pause()
			a.currentTime = 0
		}
	}
}

// https://www.wowhead.com/sounds/name:precast
// https://www.wowhead.com/sounds/name:greater+heal#0-5
