// import produce from '../web_modules/immer.js'
import spells from './spells.js'
const {log} = console

const globalCoolDown = 1500

export function newGame() {
	const state = {
		player: {
			maxMana: 300,
			mana: 300,
		},
		party: {
			tank: {
				health: 320,
				maxHealth: 320,
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
			fps: 30,
			elapsedTime: 0,
		},
		globalTimer: null,
		beginningOfTime: performance.now(),
		gcd: 0,
	}
	return state
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
	state.gcd = globalCoolDown

	state.timeoutId = setTimeout(() => {
		log('finished casting', spell.name)
		state.player.mana = state.player.mana - spell.cost

		const newHp = state.party.tank.health + spell.heal
		state.party.tank.health =
			newHp > state.party.tank.maxHealth ? state.party.tank.maxHealth : newHp
		delete state.timeoutId
		delete state.castingSpellId
	}, spell.cast)
}
