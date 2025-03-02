# Implementation Plan


## TODO

1. Game Loop & Architecture

- [x] Fix spell system (static vs instance properties)
- [x] Fix keyboard shortcuts for spell casting
- [x] Implement HOT effects system
- [x] Fix static props on Boss class. Look at Spells for inspiration
- [x] Complete the core game loop with proper state management
- [ ] Implement event-driven architecture for game events

## LATER

2. UI Components

- [x] Basic Action Bar for spell selection
- [ ] Improve Action Bar with cooldown indicators
- [ ] Cast Bar with sweet spot indicator
- [ ] Party Frames for target selection and health monitoring
- [x] Basic Health/Mana indicators
- [ ] Improve Health/Mana indicators with animations

3. Spell Casting System

- [x] Fix spell implementation with proper static/instance properties
- [x] Implement Heal Over Time (HOT) effects
- [ ] Complete remaining spell effects
- [ ] Add spells with cooldowns
- [ ] Implement the sweet spot mechanic

4. Targeting System

- [ ] Allow selecting party members via party frames
- [ ] Implement enemy targeting for damage spells

5. Character Stats & Progression

- [ ] Implement core stats (Haste, Spell Power, etc.)
- [ ] Create stat modification system for buffs/debuffs

6. Combat & Boss Mechanics

- [x] Implement boss class with static properties for multiple boss types
- [x] Implement boss attack patterns
- [ ] Add status effects (debuffs, DoTs)
- [ ] Create boss special abilities

7. Development Tools

- [ ] Console for command input
- [ ] Cheat commands for testing

8. Prototype Dungeon Structure

- [ ] Create a simple dungeon with multiple encounters
- [ ] Implement more bosses
- [ ] Implement node-based progression