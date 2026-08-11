/**
 * What a unit frame does when something lands on it. Called from `applyHit()`.
 *
 * Web Animations rather than classes or inline styles: uhtml patches these frames many times a
 * second and would clobber a style, but a WAAPI animation is invisible to it.
 */

/** One frame per unit id, cached — a query per hit would be many per second. */
const frames = new Map<string, HTMLElement>()

function frameFor(unitId: string) {
	// `applyHit` calls this on every hit, and a simulated fight has no document to react in.
	if (typeof document === 'undefined') return
	const cached = frames.get(unitId)
	if (cached?.isConnected) return cached
	const frame = document.querySelector<HTMLElement>(`[data-unit-id="${unitId}"]`)
	if (frame) frames.set(unitId, frame)
	else frames.delete(unitId)
	return frame
}

/** Replace rather than stack: two overlapping reactions average into a flicker. */
function replace(element: Element, id: string) {
	for (const animation of element.getAnimations()) {
		if (animation.id === id) animation.cancel()
	}
}

/** How big a hit felt, 0–1, as a share of the target's max health. Relative, so the same reaction
 * reads on a 240hp wolf and a 3000hp boss. */
export function weigh(amount: number, maxHealth: number): number {
	if (!maxHealth) return 0
	return Math.min(1, Math.abs(amount) / maxHealth / 0.25)
}

/**
 * Damage jolts and reddens, healing swells and brightens — opposite directions, so they read apart
 * without the number. Sized by `weight`, which is what keeps a ticking aura from strobing.
 */
export function impact(unitId: string, amount: number, weight: number) {
	const frame = frameFor(unitId)
	if (!frame) return

	const id = 'impact'
	replace(frame, id)

	const damage = amount < 0
	// Never nothing: even the smallest tick gets a floor, or a chip of damage would read as a bug.
	const strength = 0.35 + weight * 0.65

	// `drop-shadow`, not `box-shadow`: that one belongs to `data-condition`, and animating it would
	// blink an injured unit's red ring off on every tick it takes.
	const glow = damage
		? `drop-shadow(0 0 ${0.5 * strength}rem hsla(4, 90%, 50%, ${0.9 * strength}))`
		: `drop-shadow(0 0 ${0.6 * strength}rem hsla(140, 75%, 45%, ${0.85 * strength}))`
	const tint = damage
		? `brightness(${1 + 0.22 * strength}) saturate(${1 + 0.5 * strength})`
		: `brightness(${1 + 0.3 * strength})`

	frame.animate(
		[
			{offset: 0, transform: 'scale(1)', filter: 'none'},
			{
				offset: 0.18,
				transform: `scale(${damage ? 1 - 0.035 * strength : 1 + 0.03 * strength})`,
				filter: `${tint} ${glow}`,
			},
			{offset: 1, transform: 'scale(1)', filter: 'none'},
		],
		{duration: damage ? 260 : 340, easing: 'ease-out', id},
	)
}

/** The frame drops and settles. The greyed-out corpse it lands on is CSS. */
export function death(unitId: string) {
	const frame = frameFor(unitId)
	if (!frame) return

	const id = 'death'
	replace(frame, id)
	replace(frame, 'impact')

	frame.animate(
		[
			{offset: 0, transform: 'scale(1) translateY(0)', filter: 'brightness(2.2) saturate(0)'},
			{offset: 0.12, transform: 'scale(1.04) translateY(-3px)', filter: 'brightness(1.6) saturate(0.4)'},
			{offset: 1, transform: 'scale(0.96) translateY(5px)', filter: 'none'},
		],
		{duration: 520, easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)', id},
	)
}
