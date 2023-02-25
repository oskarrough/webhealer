import {html} from '../utils'
import {toPercent, roundOne} from '../utils'

/**
 * Use this bar to indicate progress.
 * @param {{
 * 	value: number,
 * 	max: number,
 * 	type: string,
 * 	showLabel?: boolean
 * }} props
 * @returns {HTMLElement}
 */
export function Bar({value, max, type, showLabel}) {
	const percent = toPercent(value, max)

	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${percent}%`}></div>
		<span ?hidden=${!showLabel}>${Math.round(value)}/${max} ${type}</span>
	</div>`
}

/**
 * The cast bar renders a bar for the game's currently cast spell.
 * @param {object} game
 * @returns {HTMLElement}
 */
export function CastBar(game) {
	const player = game.find('Player')
	if (!player.lastCastTime) return
	const spell = player.lastCastSpell
	const timeCast = game.elapsedTime - player.lastCastTime || 0

	return html`
		Casting ${spell.name} ${roundOne(timeCast / 1000)}
		${Bar({
			type: 'cast',
			value: spell.delay - timeCast,
			max: spell.delay,
		})}
	`
}

/**
 * Used for "bars" that indicate a min/max like health and mana.
 * <meter min="0" max=${max} value=${current}></meter>
 * @param {{
 *  value: number,
 *  max: number,
 *  type: string,
 *  potentialValue?: number,
 *  spell?: object
 * }} props
 * @returns {HTMLElement}
 */
export function Meter({value, max, type, potentialValue = 0, spell}) {
	if (spell?.delay === 0) {
		potentialValue = potentialValue - (potentialValue / spell.repeat) * spell.cycles
	}
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
