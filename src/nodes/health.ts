import {Node} from 'vroum'
import {log} from '../utils'

/**
 * Events emitted by the Health node
 */
export const HEALTH_EVENTS = {
    CHANGE: 'health:change',
    EMPTY: 'health:empty',
    FULL: 'health:full'
} as const;

/**
 * Health node with simplified health management and event handling
 */
export class Health extends Node {
    current = 0
    max = 0

    constructor(public parent: Node, max: number = 100) {
        super(parent)
        this.max = max
        this.current = max
    }

    /**
     * Set the health to a new value and emit appropriate events
     */
    set(amount: number) {
        const oldValue = this.current
        
        // Clamp the value
        this.current = Math.max(0, Math.min(amount, this.max))
        
        // Only emit events if the value changed
        if (oldValue !== this.current) {
            // Always emit change event
            this.emit(HEALTH_EVENTS.CHANGE, { 
                previous: oldValue, 
                current: this.current 
            })
            
            // Emit special events
            if (this.current <= 0) {
                this.emit(HEALTH_EVENTS.EMPTY)
                log(`${this.parent.constructor.name} has died`)
            } else if (this.current === this.max && oldValue < this.max) {
                this.emit(HEALTH_EVENTS.FULL)
            }
        }
        
        return this.current
    }

    /**
     * Simpler healing function
     */
    heal(amount: number) {
        if (this.current <= 0) return 0 // Can't heal if dead
        
        const oldValue = this.current
        this.set(this.current + amount)
        return this.current - oldValue // Return actual amount healed
    }

    /**
     * Simpler damage function
     */
    damage(amount: number) {
        if (this.current <= 0) return 0 // Already dead
        
        const oldValue = this.current
        this.set(this.current - amount)
        return oldValue - this.current // Return actual amount damaged
    }
} 