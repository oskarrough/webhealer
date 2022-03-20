const spells = {
	instaheal: {
		name: 'Insta Heal',
		heal: 30,
		cost: 80,
		cast: 0,
	},
	heal: {
		name: 'Flash Heal',
		heal: 45, // 307-353
		cost: 60,
		cast: 1000,
	},
	greaterheal: {
		name: 'Greater Heal',
		heal: 90, // 307-353
		cost: 170,
		cast: 2600,
	},
	renew: {
		name: 'Renew',
		heal: 45,
		cost: 30,
		cast: 0,
		duration: 15000, // ticks ever 3 secs?
	},
}

export default spells
