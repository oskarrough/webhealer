const {html} = window.uhtml
import {roundOne} from './utils.js'
import spells from './spells.js'
import {castSpell} from './actions.js'

function Spell({state, spellId, addAction}) {
	const spell = spells[spellId]
	if (!spell) throw new Error('no spell with id ' + spellId)

	// Readable cast time
	let castTime = roundOne(spell.cast / 1000)
	// ... we're currently casting this spell, use the state's cast time instead, which will be animated.
	if (state.castingSpellId === spellId) {
		castTime = roundOne(state.castTime / 1000)
	}

	function onTap() {
		addAction({type: 'castSpell', spellId})
	}

	return html`
		<button class="Spell" onClick=${() => onTap()}>
			<div class="Spell-inner">
				${spell.name}<br />
				<span hidden>${castTime}s<br /></span>
				<small>
					Heals for ${spell.heal}<br />
					${spell.cost} mana
				</small>
			</div>
			<div
				class="Spell-gcd"
				style=${`width: ${(state.gcd / state.config.globalCooldown) * 100}%`}
			></div>
		</button>
	`
}

function Bar({current, max, type, showLabel}) {
	return html`<div class="Bar" data-type=${type}>
		<progress min="0" max=${max} value=${current} />
		<span ?hidden=${!showLabel}>${Math.round(current)}/${max} ${type}</span>
	</div>`
}

function CastBar(state) {
	const spell = spells[state.castingSpellId]
	if (!spell) return html``
	// ${Bar({
	// 	type: 'cd',
	// 	max: state.config.globalCooldown,
	// 	current: state.gcd,
	// })}
	return html`
		Casting ${spell.name} ${roundOne(state.castTime / 1000)}
		${Bar({
			type: 'cast',
			max: spell.cast,
			current: spell.cast - state.castTime,
		})}
	`
}

function Monitor(state) {
	return html` <ul class="Monitor">
		<li>FPS: ${Math.round(state.config.fps)}</li>
		<li>Ticks: ${state.ticks}</li>
		<li>Time: ${Math.round(state.config.elapsedTime)}</li>
		<li title="Global cooldown">GCD: ${state.gcd && roundOne(state.gcd / 1000)}</li>
		<li>Cast: ${state.castTime > 0 ? roundOne(state.castTime / 1000) + 's' : ''}</li>
		<li>Spell: ${state.castingSpellId}</li>
	</ul>`
}

export default function App(state, addAction) {
	const {player} = state
	const {tank} = state.party

	function restart() {
		window.location.reload()
	}

	function handleShortcuts({key}) {
		console.log('Pressed', key)
		if (key === '1') castSpell(state, 'heal')
		if (key === '2') castSpell(state, 'flashheal')
		if (key === '3') castSpell(state, 'greaterheal')
		// if (key === '4') castSpell(state, 'renew')
		// if (key === 'a' || key === 'd' || key === 'Escape') {
		// 	state.gcd = state.config.globalCooldown
		// 	state.castTime = 0
		// 	state.castingSpellId = null
		// 	clearTimeout(window.webhealer.castTimer)
		// }
	}

	function SmartSpell(id) {
		return Spell({state, addAction, spellId: id})
	}

	return html`<div class="Game" onkeyup=${handleShortcuts} tabindex="0">
		<header>
			<h1>Web Healer</h1>
			<p>How long can you keep the party alive?</p>
			<button onClick=${restart}>Restart</button>
		</header>
		<div class="PartyGroup">
			${state.gameOver
				? html`<p>
						Game Over! You survived for ${roundOne(state.config.elapsedTime / 1000)}
						seconds
						<button onClick=${restart}>Try again</button>
				  </p>`
				: html``}
			${Bar({
				type: 'health',
				max: tank.baseHealth,
				current: tank.health,
				showLabel: true,
			})}
		</div>
		<div class="Player">
			${CastBar(state)}
			<br />
			${Bar({type: 'mana', max: player.baseMana, current: player.mana, showLabel: true})}
		</div>
		<div class="ActionBar">
			${SmartSpell('heal')}
			${SmartSpell('flashheal')}
			${SmartSpell('greaterheal')}
		</div>
		${Monitor(state)}
	</div>`
}
