const {html} = window.uhtml

export function Bar({current, max, type, showLabel}) {
	// <progress min="0" max=${max} value=${current}></progress>
	const percentage = Math.round((current / max) * 100) + '%'
	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${percentage}`}></div>
		<span ?hidden=${!showLabel}>${Math.round(current)}/${max} ${type}</span>
	</div>`
}

export function Meter({current, max, type}) {
	// <meter min="0" max=${max} value=${current}></meter>
	const percentage = Math.round((current / max) * 100) + '%'
	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${percentage}`}></div>
		<span>${Math.round(current)}/${max}</span>
	</div>`
}

export default Bar
