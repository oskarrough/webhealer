import {log} from './utils'
import {GlobalCooldown} from './nodes/global-cooldown'
import {Spell} from './nodes/spell'
import Audio from './nodes/audio'
import {WebHealer} from './web-healer'
import Player from './nodes/player'

export function interrupt(game: WebHealer) {
	log('interrupt')

	// Stop the spell.
	const player = game.find(Player)!

	// Stop any sound and play expiration effect..
	const audio = game.find(Audio)!
	audio.stop()
	audio.play('spell_fizzle')

	// Remove spell and gcd.
	const spell = player.find(Spell)!
	const gcd = player.find(GlobalCooldown)
	if (spell) spell.disconnect()
	if (gcd) gcd.disconnect()

	// Clean up
	delete player?.lastCastSpell
}
