import {Node, Task} from './web_modules/vroum.js'

function randomIntFromInterval(min, max) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min)
}

class DamageEffect extends Task {
	repeat = Infinity
	duration = 600 // run each cycle for X
	delay = 500 // wait before running the first cycle of the task
	interval = 1500 // wait between successive animation cycles

	damage() {
		return randomIntFromInterval(0, 3)
	}

	tick = (loop) => {
		// const step = Math.round(loop.deltaTime / 16)
		const tank = loop.find('Tank')
		// const isOdd = this.cycles % 2 === 0
		tank.health = tank.health - this.damage()
	}
}

export default class Boss extends Node {
	mount() {
		const eff1 = new DamageEffect()
		eff1.damage = () => 3
		const eff2 = new DamageEffect()
		eff2.damage = () => 5
		eff2.delay = 1000
		eff2.duration = 5
		const eff3 = new DamageEffect()
		eff3.delay = 2000
		eff3.interval = 7000
		eff3.damage = () => randomIntFromInterval(7, 10)
		this.add(eff1, eff2, eff3)
	}
}
