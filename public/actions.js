// import produce from '../web_modules/immer.js'
import spells from './spells.js'
import {clamp} from './utils.js'
const {log} = console

export function newGame() {
	return {
		player: {
			maxMana: 300,
			mana: 300,
		},
		party: {
			tank: {
				health: 1320,
				maxHealth: 1320,
			},
			rangedDps: {
				health: 180,
				maxHealth: 180,
			},
			heal: {
				health: 999,
			},
		},
		config: {
			fps: 60,
			elapsedTime: 0,
			globalCooldown: 1500,
		},
		globalTimer: null,
		beginningOfTime: performance.now(),
		gcd: 0,
	}
}

export function castSpell(state, spellId) {
	const spell = spells[spellId]
	if (state.gcd > 0) {
		log('global cooldown')
		return
	}
	if (spell.cost > state.player.mana) {
		log('not enough mana')
		return
	}
	if (state.timeoutId) {
		log('clearing spell cast', spellId)
		clearTimeout(state.timeoutId)
	}

	log('casting', spell.name)
	state.castingSpellId = spellId
	state.castTime = spell.cast
	state.gcd = state.config.globalCooldown

	state.timeoutId = setTimeout(() => {
		log('finished casting', spell.name)
		state.player.mana = state.player.mana - spell.cost

		const newHp = state.party.tank.health + spell.heal
		state.party.tank.health = clamp(newHp, 0, state.party.tank.maxHealth)
		delete state.timeoutId
		delete state.castingSpellId
	}, spell.cast)
}

export function update(state, delta) {
	if (state.config.elapsedTime > 1) {
		// Slowly reduce the tank's healt.
		state.party.tank.health = state.party.tank.health - 1
	}

	// Regenerate mana.
	state.player.mana = clamp(state.player.mana + 0.2, 0, state.player.maxMana)

	// Count down cast time, if needed
	const {castTime} = state
	if (castTime > 0) {
		let newTime = castTime - delta
		state.castTime = newTime > 0 ? newTime : 0
	}

	// Reset global cooldown.
	const {gcd} = state
	if (gcd > 0) {
		let newTime = gcd - delta
		state.gcd = newTime > 0 ? newTime : 0
	}

	// Stop game if the tank has died.
	if (state.party.tank.health < 0) {
		state.party.tank.health = 0
		setTimeout(() => {
			window.cancelAnimationFrame(state.globalTimer)
			state.gameOver = true
			const msg = `Game Over! You survived for ${state.config.elapsedTime} seconds`
			console.log(msg)
			// alert(msg)
		}, 16)
		return
	}
}
