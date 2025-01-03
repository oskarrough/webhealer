import {render} from './utils'
import {GameLoop} from './nodes/game-loop'
import {animatedStartGame, Menu} from './components/menu'
import './style.css'
import gsap from 'gsap'

/**
 * Main entry point for the game.
 * Renders two components, the splash "menu" and the "game" itself.
 */
function main() {
	const game = GameLoop.new()
	game.element = document.querySelector('#webhealer')
	game.render()
	// @ts-ignore
	window.webhealer = game

	render(document.querySelector('#menu')!, () => Menu(game))

	gsap.to('.Frame', {opacity: 1, duration: 1})

	const urlParams = new URLSearchParams(window.location.search)

	const muted = urlParams.has('muted')
	if (muted) game.muted = true

	const debug = urlParams.has('debug')
	if (debug) {
		gsap.set('.Menu, .Frame-splashImage', {autoAlpha: 0})
		animatedStartGame(game, 1)
	} else {
		// gsap.to('.Frame', {opacity: 1, duration: 2})
	}
}

main()
