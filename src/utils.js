import {html, render} from 'uhtml'

// min and max included
export function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function roundOne(num) {
	return Math.round(num * 10) / 10
}

export function clamp(x, lower, upper) {
	return Math.max(lower, Math.min(x, upper))
}

/**
 * @param {number} value
 * @param {number} max
 * @returns {number}
 */
export function toPercent(value, max) {
	return Math.round((value / max) * 100)
}

const {log} = console

export {log, html, render}
