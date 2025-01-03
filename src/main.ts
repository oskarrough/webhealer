import {render} from './utils'
import {WebHealer} from './web-healer'
import {animatedStartGame, Menu} from './components/menu'
import './style.css'
import gsap from 'gsap'

/**
 * Main entry point for the game.
 * Renders two components, the splash "menu" and the "game" itself.
 */
function main() {
	const game = WebHealer.new()
	game.element = document.querySelector('#webhealer')
	game.render()
	// @ts-ignore
	window.webhealer = game

	render(document.querySelector('#menu')!, () => Menu(game))

	const urlParams = new URLSearchParams(window.location.search)
	const debugMode = urlParams.has('debug')
	gsap.to('.Frame', {opacity: 1, duration: 1})
	if (debugMode) {
		gsap.set('.Menu, .Frame-splashImage', {autoAlpha: 0})
		animatedStartGame(game, 1)
	} else {
		// gsap.to('.Frame', {opacity: 1, duration: 2})
	}
}

main()
