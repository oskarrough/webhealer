import {Node} from './web_modules/vroum.js'
import {damage} from './actions.js'

export default class Boss extends Node {
	mount() {
		const x = this.parent.runAction.bind(this.parent)
		x(damage, {
			amount: 10,
			timing: {delay: 500, repeat: Infinity},
		})
		x(damage, {
			amount: 20,
			timing: {delay: 1000, duration: 5, repeat: Infinity},
		})
		x(damage, {timing: {delay: 7000, repeat: Infinity}, amount: 30})
	}
}
