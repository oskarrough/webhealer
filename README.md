[# Web Healer

A little game for the web inspired by healing raids and five man dungeons back in Azeroth. Who remembers Heal Rank 2?

- Play on https://webhealer.0sk.ar

A work in progress and happy to welcome new contributors.

## Game concept & ideas

Random notes to keep for later.

- Most spells trigger a global cooldown (GCD) of 1.5 seconds. During this time you cannot cast any other spells
- Mana regen is paused for 2 seconds whenever a cast completes
- Show combat stats once combat ends: Amount healed, Overhealing, Mana spent
- Experience? Why?
- Talents and talent points?
- Spells
	- Renew
	- Dispel
	- Heal
	- Fast Heal
	- Shield
	- Vampiric Something

## Development

This project used to have no build system, but I gave up. So now you `npm run dev` for a local development server.

### Structure

It's a static HTML website. The `src/main.ts` starts everything.

```mermaid
graph TD
	www((webhealer.0sk.ar)) --> html{index.html}
	html -->|styles| css[index.css]
	html -->|third party| deps[vroum/*]
	html -->|scripts| js[src/main.ts]
	js --> loop[src/game-loop.ts]
```

The game was recently refactored to use the https://gitlab.com/jfalxa/vroum library. This helps organize everything in a tree structure of `Nodes` along with schedulable `Tasks` that run on a requestAnimationFrame loop.

To make it easier to write HTML element with JavaScript, we use https://github.com/WebReflection/uhtml.

```mermaid
graph TD
	WebHealer --> |starts| Loop --> |30fps| Update
	Update --> |requestAnimationFrame| Loop
	Update --> |sets| State((State))
	Update --> |calls| Render --> HTML --> |DOM Events| Actions

	Actions --> Scheduler
	Scheduler --> |next frame| State
	Scheduler --> |timed| State

	State --> |is fed to| Render
```

## References

- Games as World of Warcraft, Mini Healer, Little Healer
- https://gameprogrammingpatterns.com/game-loop.html
- https://www.askmrrobot.com/wow/theory/mechanic/spell/heal?spec=PriestHoly&version=live
- http://www.musinggriffin.com/blog/2015/10/26/mechanics-damage-over-time
- https://www.reddit.com/r/wow/comments/3hrgp5/little_healer_wow_healer_simulator_nostalgia/
- https://flotib.github.io/WoW-Healer-Training/index.html
](https://github.com/oskarrough/webhealer/pull/2)
