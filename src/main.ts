import {render} from './utils'
import {WebHealer} from './web-healer'
import {Menu} from './components/menu'
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

	// const urlParams = new URLSearchParams(window.location.search)
	// if (urlParams.has('debug')) game.start()
	gsap.to('.Frame', {opacity: 1, duration: 1})
}

main()
