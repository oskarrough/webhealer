import {log} from './utils.js'

export function interrupt(game) {
	log('interrupt')
	const player = game.find('Player')
	delete player.lastCastTime
}
