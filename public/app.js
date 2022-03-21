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

	// If we're currently casting this spell, use the state's cast time instead,
	// which will be animated.
	if (state.castingSpellId === spellId) {
		castTime = roundOne(state.castTime / 1000)
	}

	function onTap() {
		castSpell(state, spellId)
	}

	return html`
		<button class="Spell" onClick=${() => onTap()}>
			${spell.name}<br />
			${castTime}s<br />
			<small>${spell.cost} mana</small><br />
			<small>Heals for ${spell.heal}</small>
		</button>
	`
}

function Bar({current, max, type, hideLabel}) {
	return html`<div class="Bar" data-type=${type}>
		<progress min="0" max=${max} value=${current} />
		<span ?hidden=${hideLabel}>${Math.round(current)}/${max} ${type}</span>
	</div>`
}

function CastBar(state) {
	const spell = spells[state.castingSpellId]
	if (!spell) return
	const current = state.castTime
	const max = spell.cast
	const percentageComplete = Math.round(100 - (current / max) * 100)
	return html`
		Casting ${spell.name} ${roundOne(state.castTime / 1000)}<br />
		${Bar({max: 100, current: percentageComplete, hideLabel: true})}
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

	const {player} = state
	const {tank} = state.party

	return html`<div class="Game">
		<header>
			<h1>Web Healer</h1>
			<p>How long can you keep the party alive?</p>
			<button onClick=${toggleGame}>${isPaused ? 'Resume' : 'Pause'}</button>
			<button onClick=${restart}>Restart</button>
		</header>
		<div class="PartyGroup">
			${Bar({type: 'health', max: tank.maxHealth, current: tank.health})}
		</div>
		<div class="Player">
			${CastBar(state)}
			${Bar({type: 'cd', max: state.config.globalCooldown / 1000,
				current: state.gcd / 1000,
				hideLabel: true,
			})}
			${Bar({type: 'mana', max: player.maxMana, current: player.mana})}
		</div>
		<div class="ActionBar">
			${Spell(state, 'heal')}
			${Spell(state, 'flashheal')}
			${Spell(state, 'greaterheal')}
			${Spell(state, 'renew')}
		</div>
		${Monitor(state)}
	</div>`
}
