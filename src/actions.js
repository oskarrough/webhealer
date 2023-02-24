import {log} from './utils.js'
import {Spell} from './nodes/spells'

export function interrupt(game) {
	log('interrupt')
	game.find('Audio').stop()
	const player = game.find('Player')
	const spell = player.find(Spell)
	console.log(spells)
	spell.disconnect()
	delete player.lastCastTime
	delete player.lastCastSpell
}
