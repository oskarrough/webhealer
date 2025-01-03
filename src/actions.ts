import {log} from './utils'
import {GlobalCooldown} from './nodes/global-cooldown'
import {Spell} from './nodes/spell'
import {AudioPlayer} from './nodes/audio'
import {GameLoop} from './nodes/game-loop'
import {Player} from './nodes/player'

export function interrupt(game: GameLoop) {
	log('interrupt')

	// Stop the spell.
	const player = game.query(Player)!

	// Stop any sound and play expiration effect..
	const audio = player.query(Spell)?.query(AudioPlayer)
	audio?.stop()

	const x = AudioPlayer.new()
	game.add(x)
	x.play('spell_fizzle')

	// Remove spell and gcd.
	const spell = player.query(Spell)!
	const gcd = player.query(GlobalCooldown)
	if (spell) spell.disconnect()
	if (gcd) gcd.disconnect()

	// Clean up
	delete player?.lastCastSpell
}
