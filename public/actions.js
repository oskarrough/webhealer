import {log} from './utils.js'

export function interrupt(game) {
	log('interrupt')
	game.find('Audio').stop()
	const player = game.find('Player')
	delete player.lastCastTime
	delete player.lastCastSpell
}
