/**
 * `src/nodes/hit.ts` imports `fct` from here, so this file has to load in a simulation, where
 * there is no DOM at all — hence no uhtml (it wants one the moment it loads) and the element
 * class declared in here rather than at the top level (`extends HTMLElement` is evaluated where
 * it is written). Called once, from `ui.ts`.
 */
export function register() {
	class FloatingCombatText extends HTMLElement {
		connectedCallback() {
			// Remove decimals
			this.textContent = String(Math.round(Number(this.textContent)))

			// Damage
			const isDamage = this.textContent[0] === '-'
			this.classList.add(isDamage ? 'damage' : 'heal')

			// Put heals to the left, damage to the right, jittered so equal numbers don't stack.
			// `Math.random`, never the fight's dice — see `wobble` in effects.ts.
			const jitter = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
			this.style.left = `${isDamage ? jitter(8, 14) : jitter(1, 7)}rem`
			// A sideways lean, so two numbers that start on the same pixel don't travel as one.
			this.style.setProperty('--fct-drift', `${jitter(-9, 9) / 10}rem`)

			// Remove node once the CSS animation is done
			this.addEventListener('animationend', () => this.remove())
		}
	}
	customElements.define('floating-combat-text', FloatingCombatText)
}

/**
 * One FCT container per unit frame, cached by unit id — hits land many times a second
 * and each would otherwise cost a DOM query. uhtml patches the frames in place, so a cached
 * container survives re-renders; it only goes stale when the frame leaves the DOM (a unit
 * died, the fight reloaded), which `isConnected` catches.
 */
const containers = new Map<string, Element>()

function containerFor(unitId: string) {
	// `applyHit` calls this on every hit, and a simulation has no document to float anything over.
	if (typeof document === 'undefined') return
	const cached = containers.get(unitId)
	if (cached?.isConnected) return cached
	const container = document.querySelector(`[data-unit-id="${unitId}"] .FloatingCombatText`)
	if (container) containers.set(unitId, container)
	else containers.delete(unitId)
	return container
}

/**
 * Floats a number over the frame of the unit it happened to. `weight` (see `weigh()` in
 * `impact.ts`) scales it, so hits are told apart by size before they are read. `variant` adds a
 * modifier class, e.g. `sweet-spot` — how it landed, which is independent of how big it was.
 */
export function fct(unitId: string, text: string | number, weight = 0, variant?: string) {
	const container = containerFor(unitId)
	if (!container) return
	const element = document.createElement('floating-combat-text')
	element.textContent = String(text)
	if (variant) element.classList.add(variant)
	// 0.8–1.55: a tick stays quiet, and a big hit still can't cover the frame.
	element.style.setProperty('--fct-scale', String(0.8 + weight * 0.75))
	if (weight > BIG) element.classList.add('big')
	container.appendChild(element)
}

/** The share of a health bar a single hit has to take before it is allowed to shout. */
const BIG = 0.5
