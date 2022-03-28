import produce from '../web_modules/immer.js'
import spells from './spells.js'
import {clamp} from './utils.js'
const {log} = console

export function newGame() {
	return {
		player: {
			mana: 500,
			baseMana: 500,
			effects: [],
		},
		party: {
			tank: {
				health: 1120,
				baseHealth: 1120,
				effects: [],
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

// This action runs on every frame.
export function tick(state, delta) {
	// Clear any expired spells.
	if (state.castTime === 0 && state.castingSpellId) {
		state = updateEffects(state, delta)
		state = finishCast(state, delta)
	}

	return produce(state, (draft) => {
		const now = performance.now()
		const player = state.player
		const tank = state.party.tank

		// Update internal time tracking.
		draft.config.elapsedTime = now - state.beginningOfTime
		draft.ticks = state.ticks + 1

		// Count down cast time
		if (state.castTime > 0) {
			const newTime = state.castTime - delta
			draft.castTime = newTime > 0 ? newTime : 0
		}

		// Count down global cooldown
		if (state.gcd > 0) {
			const newTime = state.gcd - delta
			draft.gcd = newTime > 0 ? newTime : 0
		}

		// Apply any status effects on the tank.
		tank.effects.forEach((effect, index) => {
			if (effect.ticks > 0) {
				const timeSince = now - effect.appliedAt
				const msPerTick = effect.duration / effect.appliedTicks

				if (timeSince > msPerTick) {
					const healPerTick = effect.heal / effect.appliedTicks
					draft.party.tank.health = clamp(tank.health + healPerTick, 0, tank.baseHealth)
					draft.party.tank.effects[index].ticks--
					draft.party.tank.effects[index].appliedAt = now
				}
			} else {
				// Remove the effect
				draft.party.tank.effects.splice(index, 1)
			}
		})

		// Slowly reduce the tank's healt (with a short delay)
		if (state.config.elapsedTime > 1) {
			draft.party.tank.health = draft.party.tank.health - 0.25 * (draft.ticks / 80)
			// draft.party.tank.health--
		}

		// Regenerate mana after X seconds
		if (player.lastCastTime) {
			const timeSince = now - player.lastCastTime
			if (timeSince > 2000) {
				draft.player.mana = clamp(player.mana + 0.7, 0, player.baseMana)
			}
		}

		// Stop game if the tank has died.
		if (tank.health < 0) {
			draft.party.tank.health = 0
			draft.gameOver = true
		}
	})
}

export function castSpell(state, spellId) {
	const spell = spells[spellId]
	// const sameSpell = spellId === state.castingSpellId

	if (state.gcd > 0) {
		throw new Error('can not cast while there is global cooldown')
	}

	if (spell.cost > state.player.mana) {
		throw new Error('not enough mana')
	}

	if (window.webhealer.castTimer) {
		log('clearing existing spell cast', {old: state.castingSpellId, new: spellId})
		clearTimeout(window.webhealer.castTimer)
	}

	return produce(state, (draft) => {
		log('started casting', spell.name)
		draft.castingSpellId = spellId
		draft.castTime = spell.cast
		draft.gcd = state.config.globalCooldown
	})
}

function finishCast(state, delta) {
	const now = performance.now()
	const spell = spells[state.castingSpellId]

	return produce(state, (draft) => {
		log('finished casting', spell.name)

		// Regular spells without ticks
		if (!spell.ticks) {
			const newHp = state.party.tank.health + spell.heal
			draft.party.tank.health = clamp(newHp, 0, state.party.tank.baseHealth)
		}

		draft.player.mana = state.player.mana - spell.cost
		draft.player.lastCastTime = now
		delete draft.castingSpellId
		delete window.webhealer.castTimer
	})
}

export function interrupt(state) {
	log('interrupt')
	return produce(state, (draft) => {
		clearTimeout(window.webhealer.castTimer)
		draft.gcd = 0
		draft.castTime = 0
		draft.castingSpellId = null
	})
}

function updateEffects(state, delta) {
	return produce(state, (draft) => {
		const spell = spells[state.castingSpellId]
		if (spell.ticks) {
			log('finishing renew', spell.ticks, delta)
			const alreadyExists = state.party.tank.effects.findIndex(
				(e) => e.name === spell.name
			)
			if (alreadyExists > -1) {
				log('reducing ticks')
				// Refresh existing effect.
				draft.party.tank.effects[alreadyExists].ticks = spell.ticks
			} else {
				log('applying new renew')
				// Apply new effect.
				draft.party.tank.effects.push({
					...spell,
					appliedAt: performance.now(),
					appliedTicks: spell.ticks,
				})
			}
		} else {
		}
	})
}

