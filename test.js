import test from 'ava'
import {clamp, roundOne} from './public/utils.js'

// Here we can add our tests. See below for examples.

test('it works', t => {
	t.pass()
})

test('it can clamp numbers', t => {
	t.truthy(clamp(5, 0, 3) === 3)
	t.truthy(clamp(5, 6, 10) === 6)
})

test('it can round numbers to one decimal', t => {
	t.truthy(roundOne(1) === 1)
	t.truthy(roundOne(1.234) === 1.2)
})
