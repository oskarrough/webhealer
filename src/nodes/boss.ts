import {Node, Task} from 'vroum'
import {randomIntFromInterval} from '../utils'
import Tank from './tank'

class DamageEffect extends Task {
	repeat = Infinity
	duration = 600 // run each cycle for X
	delay = 2000 // wait before running the first cycle of the task
	interval = 1500 // wait between successive animation cycles

	damage() {
		return randomIntFromInterval(1, 3)
	}

	tick = () => {
		// const step = Math.round(loop.deltaTime / 16)
		const tank = this.loop.find(Tank)!
		const x = this.damage()
		// const isOdd = this.cycles % 2 === 0
		tank.health = tank.health - x
		// logger.warn(`Tank took ${x} damage`)
	}
}

export default class Boss extends Node {
	build() {
		const eff1 = new DamageEffect()
		const eff2 = new DamageEffect()
		eff2.damage = () => 1
		eff2.delay = 3000
		eff2.duration = 5
		const eff3 = new DamageEffect()
		eff3.delay = 4000
		eff3.interval = 7000
		eff2.duration = 0
		eff3.damage = () => randomIntFromInterval(7, 10)
		return [eff1, eff2, eff3]
	}
}
