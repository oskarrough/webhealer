import {log} from './utils'
import {AudioPlayer} from './nodes/audio'
import {GameLoop} from './nodes/game-loop'

export function interrupt(game: GameLoop) {
	log('interrupt')

	const player = game.player

	// First, make sure spell sounds are stopped before playing the fizzle sound
	player.spell?.stopSounds?.()
	
	// Play the fizzle sound - make sure it works!
	log('interrupt: playing fizzle sound')
	const audio = AudioPlayer.play('spell.fizzle')
	if (!audio) {
		log('interrupt: failed to play fizzle sound!')
	}

	// Now disconnect the spell and GCD tasks
	player.spell?.disconnect()
	player.gcd?.disconnect()

	// Clean up all references
	player.spell = undefined
	player.gcd = undefined
}
