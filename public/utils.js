export function roundOne(num) {
	return Math.round(num * 10) / 10
}

export function clamp(x, lower, upper) {
	return Math.max(lower, Math.min(x, upper))
}

const {log} = console

export {log}
