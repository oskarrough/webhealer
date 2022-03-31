// @ts-check

/**
 * @typedef {(time: number, task: Task) => void} Task
 *
 * @typedef {{
 * 	delay?: number;
 * 	duration?: number;
 * 	repeat?: number
 * }} TimeConfig
 *
 * @typedef {{
 * 	run: Task,
 * 	startedAt: number,
 *	updatedAt: number,
 * 	delay: number,
 * 	duration: number,
 * 	repeat: number
 *  runs: number
 * }} TimedTask
 */

class Scheduler {
	constructor() {
		this.time = performance.now()

		/** @type TimedTask[] */
		this.tasks = []
	}

	/**
	 * Sync current scheduler time with external source
	 * and run the appropriate tasks according to it
	 *
	 * @param {number} time
	 */
	sync(time) {
		this.time = time

		const tasks = [...this.tasks]
		tasks.forEach((task) => {
			// task has been repeated enough
			if (task.repeat <= 0) {
				// remove the task from the list
				this.tasks = this.tasks.filter((t) => t.run !== task.run)
				return
			}

			// actually run the task if the timing is right
			const elapsedTime = this.time - task.updatedAt
			if (elapsedTime > task.delay) {
				task.run(this.time, task)
				task.runs = task.runs + 1
			}

			// decrement the remaining number of repetition
			// when the task has reached the end of its current cycle
			const remainingTime = task.updatedAt + task.delay + task.duration - this.time
			if (remainingTime < 0) {
				task.repeat--
				task.updatedAt = this.time
				return
			}
		})
	}

	/**
	 * Register a new task that will be executed at the time specified in the timing argument
	 *
	 * @param {Task} task
	 * @param {TimeConfig} config
	 */
	register(task, config) {
		this.tasks.push({
			run: task,
			startedAt: this.time,
			updatedAt: this.time,
			delay: config.delay || 0,
			duration: config.duration || 0,
			repeat: config.repeat || 1,
			runs: 0,
		})
	}

	/**
	 * Unregisters all tasks
	 */
	reset() {
		this.tasks = []
	}
}

export default function newScheduler() {
	return new Scheduler()
}

// example task
// can be registered outside the gameloop
// or inside in which case you have to make sure it is registered only once per specific task
// scheduler.register((time) => console.log(`the action happened at ${time}ms`), {
// 	delay: 2000, // will wait 2s before each cycle
// 	duration: 1000, // will run for 1s for each cycle
// 	repeat: Infinity, // will repeat the cycles for ever
// })
