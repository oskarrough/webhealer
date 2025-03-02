// @ts-nocheck
import {Node, Task, Loop} from 'vroum'

// THESE ARE JUST EXAMPLES, NOT REAL CODE FOR THE GAME

declare global {
	// define data associated with specific event types
	interface EventMap {
		[Player.HEALTH_CHANGE]: void
		[Player.ADD_EFFECT]: HealthEffect
		[Player.REMOVE_EFFECT]: HealthEffect
	}
}

// Health node with convenience health management logic
// Can only be applied to Player nodes
class Health extends Node {
	current = 100
	max = 100

	constructor(public parent: Player) {
		super(parent)
	}

	isFull() {
		return this.current === this.max
	}

	isEmpty() {
		return this.current === 0
	}

	reset() {
		this.set(this.max)
	}

	heal(amount: number) {
		this.set(this.current + amount)
	}

	damage(amount: number) {
		this.set(this.current - amount)
	}

	set(amount: number) {
		this.current = Math.max(0, Math.min(amount, this.max))
		this.parent.emit(Player.HEALTH_CHANGE)
	}
}

// define an interface for the kind of parent you want the Effect node to connect to
// this allows you to apply this Node to different classes of Nodes, as long as they have the right props
interface NodeWithHealthAndEffects extends Node {
	health: Health
	effects: Set<HealthEffect>
}

// time-based Effect base class
class HealthEffect extends Task {
	constructor(public parent: NodeWithHealthAndEffects) {
		super(parent)
	}

	mount() {
		this.parent.effects.add(this)
		this.parent.emit(Player.ADD_EFFECT, this)
	}

	destroy() {
		this.parent.effects.delete(this)
		this.parent.emit(Player.REMOVE_EFFECT, this)
	}
}

// specific effect that heals player over time
class HealOverTime extends HealthEffect {
	interval = 500
	repeat = 5
	duration = 166

	heal = 1

	// don't apply the heal effect when health is full
	shouldTick() {
		if (this.parent.health.isFull()) return false
		else return super.shouldTick()
	}

	tick() {
		this.parent.health.heal(this.heal)
	}
}

// specific effect that applies damage over time
class DamageOverTime extends HealthEffect {
	interval = 500
	repeat = 5
	frames = 10 // makes tick() run exactly 10 frames in a row per cycle

	damage = 1

	// completely remove the DoT effect when health is 0
	shouldEnd() {
		if (this.parent.health.isEmpty()) return true
		else return super.shouldEnd()
	}

	tick() {
		this.parent.health.damage(this.damage)
	}
}

// Player node that groups the different components into one entity
class Player extends Node {
	static HEALTH_CHANGE = 'health-change' as const
	static ADD_EFFECT = 'add-effect' as const
	static REMOVE_EFFECT = 'remove-effect' as const

	health = new Health(this)
	effects = new Set<HealthEffect>()
}

// Root game loop
class GameLoop extends Loop {
	interval = 10

	// game entities
	player = new Player(this)

	// map player effects to li elements rendered in the DOM
	effectLiMap = new Map<HealthEffect, HTMLLIElement>()

	// ui elements
	ui = {
		timer: document.querySelector('p#timer')!,
		hp: document.querySelector('p#hp')!,
		addHealButton: document.querySelector('button#add-heal')!,
		addDamageButton: document.querySelector('button#add-damage')!,
		effectsList: document.querySelector('ul#effects')!,
		playButton: document.querySelector<HTMLButtonElement>('button#play')!,
		pauseButton: document.querySelector<HTMLButtonElement>('button#pause')!,
		resetButton: document.querySelector('button#reset')!,
	}

	mount() {
		this.ui.playButton.addEventListener('click', () => this.play())
		this.ui.pauseButton.addEventListener('click', () => this.pause())
		this.ui.resetButton.addEventListener('click', () => this.resetPlayer())

		// tasks also behave like promises now so you can chain then() calls to run code after the task is done
		// note that the promise from the Task class always resolves to a `void` value
		this.ui.addHealButton.addEventListener('click', () => {
			new HealOverTime(this.player).then(() => {
				console.log('heal effect done')
			})
		})

		// and it makes async/await work out of the box
		this.ui.addDamageButton.addEventListener('click', async () => {
			await new DamageOverTime(this.player)
			console.log('damage effect done')
		})

		this.on(GameLoop.PLAY, this.handlePlay)
		this.on(GameLoop.PAUSE, this.handlePause)

		this.player.on(Player.HEALTH_CHANGE, this.handleHealthChange)
		this.player.on(Player.ADD_EFFECT, this.handleAddEffect)
		this.player.on(Player.REMOVE_EFFECT, this.handleRemoveEffect)
	}

	tick() {
		this.ui.timer.textContent = `${(this.elapsedTime / 1000).toFixed(2)}s`
	}

	resetPlayer() {
		this.player.health.reset()
		for (const effect of this.player.effects) {
			effect.disconnect()
		}
	}

	handlePlay = () => {
		this.ui.playButton.disabled = true
		this.ui.pauseButton.disabled = false
	}

	handlePause = () => {
		this.ui.playButton.disabled = false
		this.ui.pauseButton.disabled = true
	}

	handleHealthChange = () => {
		this.ui.hp.textContent = `${this.player.health.current} HP`
	}

	handleAddEffect = (effect: HealthEffect) => {
		const li = document.createElement('li')
		li.textContent = effect.constructor.name
		this.effectLiMap.set(effect, li)
		this.ui.effectsList.append(li)
	}

	handleRemoveEffect = (effect: HealthEffect) => {
		const li = this.effectLiMap.get(effect)
		if (li) this.ui.effectsList.removeChild(li)
		this.effectLiMap.delete(effect)
	}
}

new GameLoop()
