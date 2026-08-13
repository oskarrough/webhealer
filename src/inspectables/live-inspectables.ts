import type {GameAction} from '../actions'
import type {GameLoop} from '../nodes/game-loop'
import {FACTION} from '../nodes/types'
import type {Unit} from '../nodes/unit'
import type {Action, BooleanField, Inspectable, InspectableSection, NumberField} from './contracts'

export function liveInspectables(game: GameLoop): Inspectable[] {
	const units: Unit[] = [...(game.party ?? []), ...(game.fight?.enemies ?? [])]
	return units.map((unit) => liveInspectable(game, unit))
}

/** A unit already in the fight: its bars and the buttons that end it, all through `perform`. */
function liveInspectable(game: GameLoop, unit: Unit): Inspectable {
	const {health, mana} = unit
	// Only what the bar currently holds. A maximum is not a dial: `maxHealth` *is* stamina and
	// `maxMana` is intellect times a constant, so typing one only works out what stat would have
	// produced it. Tune the stat.
	const healthField: NumberField = {
		kind: 'number',
		key: 'hp',
		label: 'Health',
		get: () => health.current,
		set: (value) => {
			game.perform({type: 'setHealth', unit: unit.id, value})
		},
		min: 0,
	}
	const manaField: NumberField | undefined = mana
		? {
				kind: 'number',
				key: 'mana',
				label: 'Mana',
				get: () => mana.current,
				set: (value) => {
					game.perform({type: 'setMana', unit: unit.id, value})
				},
				min: 0,
			}
		: undefined

	const actions: Action[] = [
		{
			label: 'Full heal',
			run: () => {
				game.perform({type: 'heal', unit: unit.id})
			},
		},
		{
			label: 'Kill',
			variant: 'danger',
			run: () => {
				game.perform({type: 'kill', unit: unit.id})
			},
		},
	]
	if (unit.faction === 'enemy') {
		actions.push({
			label: 'Remove',
			variant: 'danger',
			run: () => {
				game.perform({type: 'remove', unit: unit.id})
			},
		})
	}

	return {
		id: `live:${unit.id}`,
		kind: 'live',
		title: unit.name || unit.unitId || '?',
		subtitle: unit.faction,
		fields: [healthField, ...(manaField ? [manaField] : [])],
		actions,
	}
}

export function globalsInspectable(game: GameLoop): Inspectable {
	const toggle = (key: 'godMode' | 'infiniteMana', label: string): BooleanField => ({
		kind: 'boolean',
		key,
		label,
		get: () => game[key],
		set: (value) => {
			game.perform({type: 'set', key, value})
		},
	})
	const button = (label: string, action: GameAction, variant?: Action['variant']): Action => ({
		label,
		variant,
		run: () => {
			game.perform(action)
		},
	})

	return {
		id: 'globals',
		kind: 'globals',
		title: 'Game',
		subtitle: 'Global toggles',
		fields: [
			toggle('godMode', 'God mode'),
			toggle('infiniteMana', 'Infinite mana'),
			{
				kind: 'number',
				key: 'gcd',
				label: 'Global cooldown (ms)',
				get: () => game.gcd,
				set: (value) => {
					game.perform({type: 'set', key: 'gcd', value})
				},
				min: 0,
				step: 100,
			},
		],
		actions: [
			button('Heal party', {type: 'healParty'}),
			// The two ways a fight ends, on demand — the fastest route to the game over panel.
			button('Kill enemies', {type: 'wipe', faction: FACTION.ENEMY}),
			button('Wipe party', {type: 'wipe', faction: FACTION.PARTY}),
			button('Restart fight', {type: 'restart'}),
			button('Reset balance', {type: 'resetBalance'}, 'danger'),
		],
	}
}

export function liveInspectableSections(game: GameLoop): InspectableSection[] {
	return [
		{section: 'Live', items: liveInspectables(game)},
		{section: 'Game', items: [globalsInspectable(game)]},
	]
}
