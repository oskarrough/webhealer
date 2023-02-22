const {produce} = window.immer
import spells from './spells.js'
import {log, clamp} from './utils.js'

// This action runs on every frame.
export function tick(state, delta) {
	state = reduceTankEffects(state, delta)
	// Clear any spell that finished casting.
	if (state.timers.castTime === 0 && state.lastSpellId) {
		// console.log('clearing spells')
		state = applyTankEffects(state, delta)
		state = applySpell(state, delta)
	}
	return produce(state, (draft) => {
		const now = performance.now()
		const player = state.player
		const tank = state.party.tank

	})
}

// Casting a spell is a two-step process.
export function castSpell(game, {spellId}) {
	const player = game.find('Player')
	const spell = spells[spellId]

	// const sameSpell = spellId === player.lastSpellId
	if (player.gcd) throw new Error('Can not cast during global cooldown')
	if (spell.cost > player.mana) throw new Error('Not enough player mana')

	log('casting spell', spell.name)
	player.casting = {
		time: game.elapsedTime,
		spell,
	}
}

export function applySpell(game, spell) {
	// const now = performance.now()
	const player = game.find('Player')

	// Regular healing spells.
	if (spell.heal && !spell.ticks) {
		heal(game, {amount: spell.heal})
	}

	// Scheduled healing spells.
	if (spell.duration && spell.ticks) {
		console.log('@todo')
		// game.runAction(heal, {
		// 	timing: {delay: spell.duration / spell.ticks, repeat: spell.ticks},
		// 	amount: spell.heal / spell.ticks,
		// })
	}

	// All healing spells.
	player.mana = player.mana - spell.cost
	delete player.casting
	log('finished casting', spell.name)
}

export function interrupt(game) {
	log('interrupt')
	const player = game.find('Player')
	delete player.casting
}

export function bossAttack(game, {amount}) {
	const tank = game.find('Tank')
	tank.health = tank.health - amount
}

export function heal(game, {amount}) {
	const tank = game.find('Tank')
	tank.health = clamp(tank.health + amount, 0, tank.baseHealth)
}

// Keep track of effects on the tank.
function applyTankEffects(state, delta) {
	return produce(state, (draft) => {
		const spell = spells[state.lastSpellId]

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
