const {html} = window.uhtml
import spells from './spells.js'
import {roundOne} from './utils.js'

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

	const gcdPercentage = state.gcd / state.config.globalCooldown
	const angle = gcdPercentage ? (1 - gcdPercentage) * 360 : 0

	return html`
		<button class="Spell" onClick=${() => onTap()}>
			<div class="Spell-inner">
				${spell.name}<br />
				<span hidden>${castTime}s<br /></span>
				<small>
					🔵 ${spell.cost}<br />
					⏲ ${spell.cast / 1000}s<br />
					🟢 ${spell.heal}
				</small>
			</div>
			<div class="Spell-gcd" style=${`--progress: ${angle}deg`}></div>
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
	if (!spell) return
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
	const {ticks, gcd, castTime, castingSpellId} = state
	const {fps, elapsedTime} = state.config

	return html` <ul class="Monitor">
		<li>FPS: ${Math.round(fps)}</li>
		<li>Ticks: ${ticks}</li>
		<li>Time: ${roundOne(elapsedTime / 1000)}s</li>
		<li title="Global cooldown">GCD: ${gcd && roundOne(gcd / 1000)}</li>
		<li>Cast: ${castTime > 0 ? roundOne(castTime / 1000) + 's' : ''}</li>
		<li>Spell: ${castingSpellId}</li>
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
		if (key === '1') addAction({type: 'castSpell', spellId: 'heal'})
		if (key === '2') addAction({type: 'castSpell', spellId: 'flashheal'})
		if (key === '3') addAction({type: 'castSpell', spellId: 'greaterheal'})
		if (key === 'a' || key === 'd' || key === 'Escape') {
			addAction({type: 'interrupt'})
		}
	}

	const SmartSpell = (id) => Spell({state, addAction, spellId: id})

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
			${FCT('Go!')}
			${Bar({
				type: 'health',
				max: tank.baseHealth,
				current: tank.health,
				showLabel: true,
			})}
			<ul class="Effects">
				${state.party.tank.effects.map(
					(effect) => html`
						<div class="Spell">
							<div class="Spell-inner">
								${effect.name}<br />
								<small><span class="spin">⏲</span> ${effect.ticks}</small>
							</div>
						</div>
					`
				)}
			</ul>
		</div>
		<div class="Player">
			${CastBar(state)}
			<br />
			${Bar({type: 'mana', max: player.baseMana, current: player.mana, showLabel: true})}
		</div>
		<div class="ActionBar">
			${SmartSpell('heal')} ${SmartSpell('flashheal')} ${SmartSpell('greaterheal')}
			${SmartSpell('renew')}
		</div>
		${Monitor(state)}
	</div>`
}

function FCT(value) {
	return html`<div class="FCT">${Math.round(value) || value}</div>`
}
