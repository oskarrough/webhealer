import {render} from 'uhtml'
import {WebHealer} from './game-loop'
import Menu from './components/menu'
import './style.css'

const game = new WebHealer()
game.element = document.querySelector('#webhealer')

// @ts-ignore
window.webhealer = game

render(document.querySelector('#menu')!, () => Menu(game))

setTimeout(() => {
	document.documentElement.classList.add('loaded')
}, 100)
