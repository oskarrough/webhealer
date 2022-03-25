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
		heal: 1000,
	},
	renew: {
		name: 'Renew',
		cost: 410,
		cast: 0,
		heal: 970,
		duration: 15000, // ticks ever 3 secs?
	},
}

const scaled = {}
Object.keys(spells).map((key) => {
	const spell = spells[key]
	spell.cost = spell.cost / 10
	spell.heal = spell.heal / 10
	scaled[key] = spell
})

export default scaled
