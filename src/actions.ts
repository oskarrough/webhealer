import {log} from './utils'
import {AudioPlayer} from './nodes/audio'
import {GameLoop} from './nodes/game-loop'

export function interrupt(game: GameLoop) {
	log('interrupt')

	const player = game.player

	// Stop any sound and play expiration effect..
	player?.spell?.audio?.stop()
	const x = new AudioPlayer()
	x.play('spell_fizzle')

	// Disconnect both spell and GCD tasks
	player.spell?.disconnect()
	player.gcd?.disconnect()

	// Clean up all references
	player.spell = undefined
	player.gcd = undefined
}
