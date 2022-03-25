const {html} = window.uhtml
import {roundOne} from './utils.js'
import spells from './spells.js'
import {castSpell} from './actions.js'
import gameLoop from './game-loop.js'

function Spell(state, spellId) {
	const spell = spells[spellId]
	if (!spell) throw new Error('no spell with id ' + spellId)

	// Readable cast time
	let castTime = roundOne(spell.cast / 1000)
	// ... we're currently casting this spell, use the state's cast time instead, which will be animated.
	if (state.castingSpellId === spellId) {
		castTime = roundOne(state.castTime / 1000)
	}

	function onTap() {
		castSpell(state, spellId)
	}

	return html`
		<button class="Spell" onClick=${() => onTap()}>
			<div class="Spell-inner">
				${spell.name}<br />
				<span hidden>${castTime}s<br /></span>
				<small>${spell.cost} mana</small><br />
				<small>Heals for ${spell.heal}</small>
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
		<li>Time: ${state.config.elapsedTime}</li>
		<li>FPS: ${Math.round(state.config.fps)}</li>
		<li title="Global cooldown">gcd: ${state.gcd && roundOne(state.gcd / 1000)}</li>
		<li>Cast: ${state.castTime > 0 ? roundOne(state.castTime / 1000) + 's' : ''}</li>
	</ul>`
}

export default function App(state) {
	const {player} = state
	const {tank} = state.party
	let isPaused = false

	function toggleGame() {
		if (isPaused) {
			isPaused = false
			requestAnimationFrame(gameLoop)
		} else {
			window.cancelAnimationFrame(state.globalTimer)
			isPaused = true
		}
	}

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
		// 	clearTimeout(state.timeoutId)
		// }
	}

	return html`<div class="Game" onkeyup=${handleShortcuts} tabindex="0">
		<header>
			<h1>Web Healer</h1>
			<p>How long can you keep the party alive?</p>
			<button onClick=${toggleGame}>${isPaused ? 'Resume' : 'Pause'}</button>
			<button onClick=${restart}>Restart</button>
		</header>
		<div class="PartyGroup">
			${Bar({type: 'health', max: tank.maxHealth, current: tank.health, showLabel: true})}
		</div>
		<div class="Player">
			${CastBar(state)}
			<br />
			${Bar({type: 'mana', max: player.maxMana, current: player.mana, showLabel: true})}
		</div>
		<div class="ActionBar">
			${Spell(state, 'heal')} ${Spell(state, 'flashheal')} ${Spell(state, 'greaterheal')}
		</div>
		${Monitor(state)}
	</div>`
}
