const {html} = window.uhtml

function toPercent(current, max) {
	return Math.round((current / max) * 100)
}

// Used for bars to indicate time
// <progress min="0" max=${max} value=${value}></progress>
export function Bar({value, max, type, showLabel}) {
	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${toPercent(value, max)}`}></div>
		<span ?hidden=${!showLabel}>${Math.round(value)}/${max} ${type}</span>
	</div>`
}

// Used for "bars" that indicate a min/max
// <meter min="0" max=${max} value=${current}></meter>
export function Meter({value, max, type, potentialValue = 0}) {
	const percent = toPercent(value, max)
	const barStyles = `width: ${percent}%`
	const potentialBarStyles = `left: ${percent}%; width: ${toPercent(
		potentialValue,
		max
	)}%`

	return html`<div class="Bar" data-type=${type}>
		<div style="${barStyles}"></div>
		<div class="Bar-potentialValue" style=${potentialBarStyles}></div>
		<span>${Math.round(value)}/${max}</span>
	</div>`
}

export default Bar
