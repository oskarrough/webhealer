import {render} from './utils'
import {WebHealer} from './web-healer'
import {Menu} from './components/menu'
import './style.css'

function main() {
	// Create a new game and store it on `window.webhealer`
	const game = WebHealer.new()
	game.element = document.querySelector('#webhealer')

	// @ts-ignore
	window.webhealer = game

	// Render the menu into #menu
	render(document.querySelector('#menu')!, () => Menu(game))

	// Jump directly into a game if ?debug param is set.
	const urlParams = new URLSearchParams(window.location.search)
	if (urlParams.has('debug')) {
		// game.start()
	}

	// After a minimal delay (because otherwise CSS animations won't trigger),
	// start animating the splash screen in
	setTimeout(() => {
		document.documentElement.classList.add('loaded')
	}, 16)
}

main()
