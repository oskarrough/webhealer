/**
 * Represents the faction a character belongs to
 */
export type Faction = 'party' | 'enemy'

// Constants for faction values
export const FACTION = {
	PARTY: 'party' as Faction,
	ENEMY: 'enemy' as Faction,
} as const
