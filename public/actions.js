// import produce from '../web_modules/immer.js'
import spells from './spells.js'
const {log} = console

export function newGame() {
	const state = {
		maxMana: 600,
		mana: 600,
		party: {
			tank: {
				health: 320,
				maxHealth: 320,
			},
			rangedDps: {
				health: 180,
				maxHealth: 180,
			},
		},
		beginningOfTime: performance.now()
	}
	return state
}

export function castSpell(state, spellId) {
	const spell = spells[spellId]
	if (spell.cost > state.mana) {
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
	state.gcd = 1500

	state.timeoutId = setTimeout(() => {
		log('finished casting', spell.name)
		state.mana = state.mana - spell.cost
		state.party.tank.health = state.party.tank.health + spell.heal
		delete state.timeoutId
		delete state.castingSpellId
	}, spell.cast)
}
