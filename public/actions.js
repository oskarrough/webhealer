// import produce from '../web_modules/immer.js'
import spells from './spells.js'
const {log} = console

const globalCoolDown = 1500

export function newGame() {
	const state = {
		maxMana: 900,
		mana: 900,
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
		globalTimer: null,
		beginningOfTime: performance.now(),
		gcd: 0
	}
	return state
}

export function castSpell(state, spellId) {
	const spell = spells[spellId]
	if (state.gcd > 0) {
		log('global cooldown')
		return
	}
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
	state.gcd = globalCoolDown

	state.timeoutId = setTimeout(() => {
		log('finished casting', spell.name)
		state.mana = state.mana - spell.cost
		state.party.tank.health = state.party.tank.health + spell.heal
		delete state.timeoutId
		delete state.castingSpellId
	}, spell.cast)
}
