import spells from './spells.js'
import {log, clamp} from './utils.js'

// Casting a spell is a two-step process.
export function castSpell(game, {spellId}) {
	const player = game.find('Player')
	const spell = spells[spellId]

	// const sameSpell = spellId === player.lastSpellId
	if (player.gcd) throw new Error('Can not cast during global cooldown')
	if (spell.cost > player.mana) throw new Error('Not enough player mana')

	log('castSpell', spell.name)
	player.casting = {
		time: game.elapsedTime,
		spell,
	}
}

export function applySpell(game, spell) {
	log('applySpell', spell.name)
	// const now = performance.now()
	const player = game.find('Player')

	// Regular healing spells.
	if (spell.heal && !spell.ticks) {
		heal(game, {amount: spell.heal})
	}

	// Scheduled healing spells.
	if (spell.duration && spell.ticks) {
		console.log('applySpell: Scheduled action')
		game.runAction(heal, {
			timing: {delay: spell.duration / spell.ticks, repeat: spell.ticks},
			amount: spell.heal / spell.ticks,
		})
	}

	// All healing spells.
	player.mana = player.mana - spell.cost
	delete player.casting
}

export function interrupt(game) {
	log('interrupt')
	const player = game.find('Player')
	delete player.casting
}

export function damage(game, {amount}) {
	const tank = game.find('Tank')
	tank.health = tank.health - amount
}

export function heal(game, {amount}) {
	const tank = game.find('Tank')
	tank.health = clamp(tank.health + amount, 0, tank.baseHealth)
}

// Reduce tanke effects by one.
export function reduceTankEffects(game) {
	const tank = game.find('Tank')
	const now = performance.now()
	tank.effects.forEach((effect, index) => {
		if (!effect.ticks) {
			// Remove the effect
			tank.effects.splice(index, 1)
		} else {
			const timeSince = now - effect.updatedAt
			const msPerTick = effect.duration / effect.appliedTicks
			if (timeSince > msPerTick) {
				// const healPerTick = effect.heal / effect.appliedTicks
				// draft.party.tank.health = clamp(tank.health + healPerTick, 0, tank.baseHealth)
				tank.effects[index].ticks--
				tank.effects[index].updatedAt = now
			}
		}
	})
}

export function applyTankEffects(game) {
	const player = game.find('Player')
	const tank = game.find('Tank')

	const spell = player.casting?.spell

	if (!spell?.ticks) return

	const effectIndex = tank.effects.findIndex((e) => e.name === spell.name)
	const effectExists = effectIndex > -1

	if (effectExists) {
		log('refreshing effect on tank', spell.name, spell.ticks)
		tank.effects[effectIndex].ticks = spell.ticks
	} else {
		log('applying effect on tank', spell.name, spell.ticks)
		tank.effects.push({
			...spell,
			updatedAt: performance.now(),
			appliedTicks: spell.ticks,
		})
	}
}
