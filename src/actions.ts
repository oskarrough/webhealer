import {log} from './utils'
import {Spell} from './nodes/spells'
import Audio from './nodes/audio'
import {WebHealer} from './game-loop'
import Player from './nodes/player'

export function interrupt(game: WebHealer) {
	log('interrupt')

	// Stop any sounds
	game.find(Audio)!.stop()

	// Stop the spell.
	const player = game.find(Player)!
	const spell = player.find(Spell)!
	if (spell) spell.disconnect()

	// Clean up
	player.lastCastTime = 0
	delete player.lastCastSpell
}
