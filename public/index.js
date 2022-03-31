import {WebHealer} from './game-loop.js'

const rootEl = document.querySelector('#root')
const webHealer = WebHealer(rootEl)

webHealer.start()
// webHealer.stop()
// webHealer.restart()
