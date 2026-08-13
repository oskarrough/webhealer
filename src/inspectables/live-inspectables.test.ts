import {afterEach, describe, expect, it} from 'vitest'
import {GameLoop} from '../nodes/game-loop'
import {liveInspectables} from './live-inspectables'

let game!: GameLoop
afterEach(() => game.disconnect())

describe('live inspectables', () => {
	it('composes Full heal from health and mana writes', () => {
		game = new GameLoop({party: [], enemies: []})
		const player = game.player
		player.health.set(1)
		player.mana!.set(1)

		const inspectable = liveInspectables(game).find((candidate) => candidate.id === `live:${player.id}`)!
		inspectable.actions!.find((action) => action.label === 'Full heal')!.run()

		expect(player.health.current).toBe(player.health.max)
		expect(player.mana!.current).toBe(player.mana!.max)
	})
})
