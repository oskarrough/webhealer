import {html, render} from 'uhtml'

export {html, render}

const {log} = console
export {log}

// min and max included
export function randomIntFromInterval(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function roundOne(num: number) {
	return Math.round(num * 10) / 10
}

export function clamp(x: number, lower: number, upper: number) {
	return Math.max(lower, Math.min(x, upper))
}

export function toPercent(value: number, max: number) {
	return Math.round((value / max) * 100)
}
