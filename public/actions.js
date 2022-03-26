import produce from '../web_modules/immer.js'
import spells from './spells.js'
import {clamp} from './utils.js'
const {log} = console

// This action runs on every frame.
export function tick(baseState, delta) {
	let nextState = baseState

	if (baseState.castTime === 0 && baseState.castingSpellId) {
		nextState = finishCast(baseState)
	}

	return produce(nextState, (draft) => {
		const now = performance.now()

		draft.config.elapsedTime = now - nextState.beginningOfTime
		draft.ticks = nextState.ticks + 1

		if (nextState.config.elapsedTime > 1) {
			// Slowly reduce the tank's healt.
			draft.party.tank.health = nextState.party.tank.health - 0.25 * (draft.ticks / 80)
		}

		// Regenerate mana after X seconds
		const oldPlayer = nextState.player
		if (oldPlayer.lastCastTime) {
			const timeSince = performance.now() - oldPlayer.lastCastTime
			if (timeSince > 2000) {
				draft.player.mana = clamp(oldPlayer.mana + 0.7, 0, oldPlayer.baseMana)
			}
		}

		// Count down cast time, if needed
		if (nextState.castTime > 0) {
			const newTime = nextState.castTime - delta
			draft.castTime = newTime > 0 ? newTime : 0
		}

		// Reset global cooldown.
		if (nextState.gcd > 0) {
			const newTime = nextState.gcd - delta
			draft.gcd = newTime > 0 ? newTime : 0
		}

		// Stop game if the tank has died.
		if (nextState.party.tank.health < 0) {
			draft.party.tank.health = 0
			draft.gameOver = true
		}
	})
}

export function newGame() {
	return {
		player: {
			mana: 500,
			baseMana: 500,
		},
		party: {
			tank: {
				health: 1120,
				baseHealth: 1120,
			},
			rangedDps: {
				health: 180,
				baseHealth: 180,
			},
		},
		config: {
			fps: 30,
			elapsedTime: 0,
			globalCooldown: 1500,
		},
		ticks: 0,
		beginningOfTime: performance.now(),
		gcd: 0,
	}
}

export function castSpell(baseState, spellId) {
	const spell = spells[spellId]
	// const sameSpell = spellId === baseState.castingSpellId

	if (baseState.gcd > 0) {
		throw new Error('can not cast while there is global cooldown')
	}

	if (spell.cost > baseState.player.mana) {
		throw new Error('not enough mana')
	}

	if (window.webhealer.castTimer) {
		log('clearing existing spell cast', {old: baseState.castingSpellId, new: spellId})
		clearTimeout(window.webhealer.castTimer)
	}

	return produce(baseState, (draft) => {
		log('started casting', spell.name)
		draft.castingSpellId = spellId
		draft.castTime = spell.cast
		draft.gcd = baseState.config.globalCooldown
	})
}

function finishCast(baseState) {
	const spell = spells[baseState.castingSpellId]

	return produce(baseState, (draft) => {
		log('finished casting', spell.name)
		draft.player.mana = baseState.player.mana - spell.cost
		const newHp = baseState.party.tank.health + spell.heal
		draft.party.tank.health = clamp(newHp, 0, baseState.party.tank.baseHealth)
		draft.player.lastCastTime = performance.now()
		delete draft.castingSpellId
		delete window.webhealer.castTimer
	})
}

export function interrupt(baseState) {
	console.log('interrupt')
	return produce(baseState, (draft) => {
		clearTimeout(window.webhealer.castTimer)
		draft.gcd = baseState.config.globalCooldown
		draft.castTime = 0
		draft.castingSpellId = null
	})
}
