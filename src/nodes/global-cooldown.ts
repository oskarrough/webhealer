import {Task} from 'vroum'

export class GlobalCooldown extends Task {
	repeat = 1
	delay = 1500
	mount = () => {
		// log('gcd:start')
	}
	destroy() {
		// log('gcd:stop')
	}
}
