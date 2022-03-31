/* eslint-disable no-unused-vars, no-undef */

// This is just an example of the proposed API of the game.
// So we can play around until it feels gooooood.
function Game() {
	let state = {}

	// A map of functions to update the state.
	const actions = {
		// An example action. Takes a state, returns a new one. Could use immer.js. Doesn't have to.
		heal(baseState, props) {
			const state = window.structuredClone(baseState)
			state.props.hp = state.props.hp + props.amount
			return state
		}
	}

	// This is internal, no need to use directly.
	const scheduler = new Scheduler()
	// scheduler.register(task, timing)

	function runAction(action, props) {
		function createScheduledAction(action, props) {
			return () => (runAction, scheduler) => {
				const task = (time, task) => runAction(action, props)
				scheduler.register(task, timing)
			}
		}

		if (props.timing) {
			action = createScheduledAction(action, props.timing, props)
		}
		return runAction(action, props)
	}

	// An example time config.
	const timing = {delay: 1000, duration: 2000, repeat: Infinity}

	runAction(actions.heal)
	runAction(actions.heal, {amount: 1})
	runAction(actions.heal, {timing})
	runAction(actions.heal, {amount: 1, timing})

	function loop() {
		scheduler.sync(time)
		state = update(state)
		render(state)
	}
	function update(state) {
		state = actions.tick(state)
		render()
	}
	function render() {
		const el = document.querySelector('body')
		const app = window.uhtml.html`<p>Current mana: ${state.mana}</p>`
		window.uhtml.render(el, app)
	}

	const start = () => state.timer = requestAnimationFrame(loop)
	const stop = () => cancelAnimationFrame(state.timer)

	return {
		start,
		stop
	}
}
