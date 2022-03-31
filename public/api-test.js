/* eslint:disable no-unused-vars, no-undef */

// This is just an example of the proposed API of the game.
// So we can play around until it feels gooooood.
function Game() {
	let state = {}
	const timer = null

	// A map of functions to update the state.
	const actions = {}

	// This is internal, no need to use directly.
	const scheduler = new Scheduler()
	scheduler.register(task, timing)
	scheduler.sync(time)

	// Helpers to run actions on the state,
  // but without  having to pass game state around manually.
	// function runAction(action, ...actionArgs) {}
	// function scheduleAction(action, timeConfig, ...actionArgs) {}

	// An example action. Takes a state, returns a new one.
	function healAction(state, {props}) {
		const newState = {...state}
		newState.props.hp = props.amount
		return newState
	}

	// An example time config.
	const timing = {delay: 1000, duration: 2000, repeat: Infinity}
	const props = {amount: 1}

	function queue(action, props) {
		if (props.timing) {
			action = scheduleAction(action, props.timing, props)
		}
		return runAction(action, props)
	}

	queue(healAction)
	queue(healAction, {amount: 1})
	queue(healAction, {timing})
	queue(healAction, {amount: 1, timing})

	function loop() {
		state = update(getState())
		render(state)
	}
	function update(state) {}
	function render(state, element) {}

	const start = () => timer = requestAnimationFrame(loop)
	const stop = () => cancelAnimationFrame(timer)

	return {
		getState,
		runAction,
		scheduleAction,
		start,
		stop
	}
}
