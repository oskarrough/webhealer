import {render} from './utils'
import {WebHealer} from './web-healer'
import Menu from './components/menu'
import './style.css'

// Create a new game and store it on `window.webhealer`
const game = WebHealer.new()
game.element = document.querySelector('#webhealer')

// @ts-ignore
window.webhealer = game

// Render the menu into #menu
render(document.querySelector('#menu')!, () => Menu(game))

// After a short delay, start animating the splash screen in
setTimeout(() => {
	document.documentElement.classList.add('loaded')
}, 100)
