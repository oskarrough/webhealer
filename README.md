# Web Healer

Thinking about it...

## Game Concept and ideas

- Most spells trigger a global cooldown (GCD) of 1.5 seconds. During this time you cannot cast any other spells.
- Mana regen is paused for 2 seconds whenever a cast completes.
- Experience
- Combat stats?  Amount healed, Overhealing, Mana spent
- Talents and talent points

- Skills
	- Renew
	- Dispel
	- Heal
	- Fast Heal
	- Shield
	- Vampiric Something

## Development

No build. The `public` folder can be deployed to any static web server.

While developing locally, run 

- `npm start` for a server that reloads on file change

All scripts are checked with eslint, formatted with prettier and tested with ava.

- `npm test`
- `npm test:watch`

## Code Structure

It's a static HTML website that starts with `public/index.html`. It loads the `game-loop.js` script, which starts everything.

It maintains a (customizable) frame loop that runs update() and render() once every tick.

The entire game state is stored in a single object named `state`. This is passed around everywhere. To update the game state, create a function in `actions.js` that receives a state and returns a new, updated one. To keep the state immutable, we use `immer.js`.

The render loop continously renders the game state to the screen. We're not using anything fancy here, just a `html`<p>helper</p>`. In this case it's the `uhtml` dependency.

All dependencies are manually downloaded from CDNs and put into the repo, loaded as ES modules.

## References

- Games as World of Warcraft, Mini Healer, Little Healer
- https://gameprogrammingpatterns.com/game-loop.html
