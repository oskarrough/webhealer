const {html} = window.uhtml
import spells from './spells.js'
import {roundOne} from './utils.js'
import * as actions from './actions.js'

export default function App(state) {
	const {player, runAction} = state
	const {tank} = state.party

	function restart() {
		window.location.reload()
	}

	function handleShortcuts({key}) {
		console.log('Pressed', key)
		if (key === '1') runAction(actions.castSpell, 'heal')
		if (key === '2') runAction(actions.castSpell, 'flashheal')
		if (key === '3') runAction(actions.castSpell, 'greaterheal')
		if (key === '4') runAction(actions.castSpell, 'renew')
		if (key === 'a' || key === 's' || key === 'd' || key === 'w' || key === 'Escape') {
			runAction(actions.interrupt)
		}
	}

	const SmartSpell = (id, shortcut) => Spell({state, spellId: id, shortcut})

	return html`<div class="Game" onkeyup=${handleShortcuts} tabindex="0">
		<header>
			<h1>Web Healer</h1>
			<p>How long can you keep the tank alive?</p>
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
			<p>Tank</p>
			${Meter({type: 'health', max: tank.baseHealth, current: tank.health})}
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
			${CastBar(state)} <br />
			${Meter({type: 'mana', max: player.baseMana, current: player.mana})}
			<p>You</p>
		</div>
		<div class="ActionBar">
			${SmartSpell('heal', '1')} ${SmartSpell('flashheal', '2')}
			${SmartSpell('greaterheal', '3')} ${SmartSpell('renew', '4')}
		</div>
		${Monitor(state)}
	</div>`
}

function Spell({state, spellId, shortcut}) {
	const spell = spells[spellId]
	if (!spell) throw new Error('no spell with id ' + spellId)

	// Readable cast time
	let castTime = roundOne(spell.cast / 1000)
	// ... we're currently casting this spell, use the state's cast time instead, which will be animated.
	if (state.castingSpellId === spellId) {
		castTime = roundOne(state.castTime / 1000)
	}

	function onTap() {
		// if (spell.duration && spell.ticks) {
		// 	scheduleAction(
		// 		{delay: spell.duration / spell.ticks, repeat: spell.ticks},
		// 		actions.heal,
		// 		spell.heal / spell.ticks
		// 	)
		// }
		state.runAction(actions.castSpell, spellId)
	}

	const gcdPercentage = state.gcd / state.config.globalCooldown
	const angle = gcdPercentage ? (1 - gcdPercentage) * 360 : 0

	return html`
		<button class="Spell" onClick=${() => onTap()}>
			<div class="Spell-inner">
				${spell.name}<br />
				<span hidden>${castTime}s<br /></span>
				<small>
					🔵 ${spell.cost} ⏲ ${spell.cast / 1000}s<br />
					🟢 ${spell.heal}
				</small>
			</div>
			<div class="Spell-gcd" style=${`--progress: ${angle}deg`}></div>
			${shortcut ? html`<small class="Spell-shortcut">${shortcut}</small>` : html``}
		</button>
	`
}

function Bar({current, max, type, showLabel}) {
	// <progress min="0" max=${max} value=${current}></progress>
	const percentage = Math.round((current / max) * 100) + '%'
	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${percentage}`}></div>
		<span ?hidden=${!showLabel}>${Math.round(current)}/${max} ${type}</span>
	</div>`
}

function Meter({current, max, type}) {
	// <meter min="0" max=${max} value=${current}></meter>
	const percentage = Math.round((current / max) * 100) + '%'
	return html`<div class="Bar" data-type=${type}>
		<div style=${`width: ${percentage}`}></div>
		<span>${Math.round(current)}/${max}</span>
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

function FCT(value) {
	return html`<div class="FCT">${Math.round(value) || value}</div>`
}
