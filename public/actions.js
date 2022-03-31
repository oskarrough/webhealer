const {produce} = window.immer
import spells from './spells.js'
import {log, clamp} from './utils.js'

// Rule 1: all exported functions in this file
// must accept state as the first argument and return a new state.

export function newGame() {
	return {
		player: {
			mana: 500,
			baseMana: 500,
			effects: [],
		},
		party: {
			tank: {
				health: 800,
				baseHealth: 800,
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
	state = reduceTankEffects(state, delta)

	// Clear any spell that finished casting.
	if (state.castTime === 0 && state.castingSpellId) {
		// console.log('clearing spells')
		state = applyTankEffects(state, delta)
		state = applySpell(state, delta)
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

		// Regenerate mana after X seconds
		if (player.lastCastTime) {
			const timeSince = now - player.lastCastTime
			if (timeSince > 2000) {
				draft.player.mana = clamp(player.mana + 0.7, 0, player.baseMana)
			}
		}

		if (tank.health < 0) {
			draft.party.tank.health = 0
			draft.gameOver = true
		}
	})
}

// Casting a spell is a two-step process.
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
		log('casting spell', spell.name)
		draft.castingSpellId = spellId
		draft.castTime = spell.cast
		draft.gcd = state.config.globalCooldown
	})
}

function applySpell(state, delta) {
	const now = performance.now()
	const spell = spells[state.castingSpellId]

	// Regular healing spells.
	if (spell.heal && !spell.ticks) state = heal(state, spell.heal)

	return produce(state, (draft) => {
		// Scheduled healing spells.
		if (spell.duration && spell.ticks) {
			state.scheduleAction(
				heal,
				{delay: spell.duration / spell.ticks, repeat: spell.ticks},
				spell.heal / spell.ticks
			)
		}

		// All healing spells.
		draft.player.mana = state.player.mana - spell.cost
		draft.player.lastCastTime = now
		delete draft.castingSpellId
		delete window.webhealer.castTimer
		log('finished casting', spell.name)
	})
}

export function interrupt(state) {
	log('interrupt')
	return produce(state, (draft) => {
		clearTimeout(window.webhealer.castTimer)
		draft.gcd = 0
		draft.castTime = 0
		delete draft.castingSpellId
	})
}

export function bossAttack(state, amount) {
	return produce(state, (draft) => {
		draft.party.tank.health = state.party.tank.health - amount
	})
}

export function heal(state, amount) {
	return produce(state, (draft) => {
		log('healed', amount)
		draft.party.tank.health = clamp(
			state.party.tank.health + amount,
			0,
			state.party.tank.baseHealth
		)
	})
}

// Keep track of effects on the tank.
function applyTankEffects(state, delta) {
	return produce(state, (draft) => {
		const spell = spells[state.castingSpellId]

		if (!spell.ticks) {
			log('no effect to apply')
			return state
		}

		const effectIndex = state.party.tank.effects.findIndex((e) => e.name === spell.name)
		const effectExists = effectIndex > -1

		if (effectExists) {
			log('refreshing effect on tank', spell.name, spell.ticks)
			draft.party.tank.effects[effectIndex].ticks = spell.ticks
		} else {
			log('applying effect on tank', spell.name, spell.ticks)
			draft.party.tank.effects.push({
				...spell,
				updatedAt: performance.now(),
				appliedTicks: spell.ticks,
			})
		}
	})
}

// Reduce tanke effects by one.
function reduceTankEffects(state, delta) {
	const now = performance.now()
	return produce(state, (draft) => {
		state.party.tank.effects.forEach((effect, index) => {
			if (!effect.ticks) {
				// Remove the effect
				draft.party.tank.effects.splice(index, 1)
			} else {
				const timeSince = now - effect.updatedAt
				const msPerTick = effect.duration / effect.appliedTicks
				if (timeSince > msPerTick) {
					// const healPerTick = effect.heal / effect.appliedTicks
					// draft.party.tank.health = clamp(tank.health + healPerTick, 0, tank.baseHealth)
					draft.party.tank.effects[index].ticks--
					draft.party.tank.effects[index].updatedAt = now
				}
			}
		})
	})
}
