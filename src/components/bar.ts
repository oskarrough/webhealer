import {WebHealer} from '../game-loop'
import Player from '../nodes/player'
import {Spell} from '../nodes/spells'
import {html} from '../utils'
import {toPercent, roundOne} from '../utils'

/**
 * Use this bar to indicate progress.
 */
export function Bar({
	value,
	max,
	type,
	showLabel,
}: {
	value: number
	max: number
	type: string
	showLabel?: boolean
}) {
	const percent = toPercent(value, max)

	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${percent}%`}></div>
		<span ?hidden=${!showLabel}>${Math.round(value)}/${max} ${type}</span>
	</div>`
}

/**
 * The cast bar renders a bar for the game's currently cast spell.
 */
export function CastBar(game: WebHealer) {
	const player = game.find(Player)!
	const spell = player.lastCastSpell

	if (!spell || !player.lastCastTime) return

	const timeCast = game.elapsedTime - player.lastCastTime

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
 */
export function Meter({
	value,
	max,
	type,
	potentialValue = 0,
	spell,
}: {
	value: number
	max: number
	type: string
	potentialValue?: number
	spell?: Spell
}) {
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
