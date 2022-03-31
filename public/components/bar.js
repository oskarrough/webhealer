const {html} = window.uhtml

function toPercent(current, max) {
	return Math.round((current / max) * 100) + '%'
}

export function Bar({current, max, type, showLabel}) {
	// <progress min="0" max=${max} value=${current}></progress>
	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${toPercent(current, max)}`}></div>
		<span ?hidden=${!showLabel}>${Math.round(current)}/${max} ${type}</span>
	</div>`
}

export function Meter({current, max, type, potentialValue}) {
	// console.log(potentialValue)
	// <meter min="0" max=${max} value=${current}></meter>
	const percentage = toPercent(current, max)
	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${percentage}`}></div>
		${potentialValue
			? html`<div
					class="Bar-potentialValue"
					style="${`left: ${percentage}; width: ${toPercent(potentialValue, max)}`}"
			  ></div>`
			: html``}
		<span>${Math.round(current)}/${max}</span>
	</div>`
}

export default Bar
