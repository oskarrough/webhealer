const spells = {
	heal: {
		name: 'Heal',
		cost: 305,
		cast: 3000,
		heal: 675,
	},
	flashheal: {
		name: 'Flash Heal',
		cost: 380,
		cast: 1500,
		heal: 880,
	},
	greaterheal: {
		name: 'Greater Heal',
		cost: 370,
		cast: 3000,
		heal: 1100,
	},
	renew: {
		name: 'Renew',
		cost: 410,
		cast: 0,
		heal: 970,
		duration: 15000,
		ticks: 5,
	},
}

const scaled = {}
Object.keys(spells).map((key) => {
	const spell = spells[key]
	spell.id = key
	spell.cost = Math.round(spell.cost / 4)
	spell.heal = Math.round(spell.heal / 4)
	scaled[key] = spell
})

export default scaled
