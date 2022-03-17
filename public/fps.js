import {html, Component} from '../web_modules/htm/preact/standalone.module.js'

export default class FpsCounter extends Component {
	constructor(props) {
		super()
	}

	componentDidMount() {
		const self = this

		this.setState({
			stop: false,
			startTime: performance.now(),
			fpsInterval: 1000 / this.props.fps,
		})

		function animate(callback) {
			const {stop, startTime, fpsInterval} = self.state
			let then
			let frameCount = 0

			if (stop) return

			// calc elapsed time since last loop
			const now = performance.now()
			const elapsed = now - (startTime || performance.now())
			self.setState({elapsed})

			requestAnimationFrame(animate)

			// if enough time has elapsed, draw the next frame
			if (elapsed > fpsInterval) {
				// Get ready for next frame by setting then=now, but...
				// Also, adjust for fpsInterval not being multiple of 16.67
				then = now - (elapsed % fpsInterval)

				// draw stuff here

				// TESTING...Report #seconds since start and achieved fps.
				var sinceStart = now - startTime
				var elapsedTime = Math.round((sinceStart / 1000) * 100) / 100
				self.setState({elapsedTime})
			}
		}

		animate()
		// request another frame
		// requestAnimationFrame(this.animate)
		// var fps, now, elapsed
	}

	render(props, state) {
		return html`<div>
			fps: ${props.fps} <br />
			elapsed time: ${state.elapsedTime}
		</div> `
	}
}
