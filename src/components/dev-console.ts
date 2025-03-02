import {GameLoop} from '../nodes/game-loop'
import {html, render} from '../utils'

/**
 * Interface for console commands
 */
export interface Command {
	name: string
	description: string
	execute: (game: GameLoop, args?: string[]) => void
}

/**
 * Developer Console web component
 */
export class DevConsole extends HTMLElement {
	private commands: Map<string, Command> = new Map()
	private game!: GameLoop // Using definite assignment assertion
	private isVisible = false
	private history: string[] = []
	private historyIndex = 0
	private inputElement: HTMLInputElement | null = null
	private outputElement: HTMLDivElement | null = null
	private consoleContainer: HTMLDivElement | null = null
	private boundHandleKeydown: (e: KeyboardEvent) => void

	constructor() {
		super()
		// Create shadow DOM
		this.attachShadow({mode: 'open'})

		// Bind methods to ensure proper 'this' context
		this.boundHandleKeydown = this.handleKeydown.bind(this)

		// Add key handler immediately - will work even before init is called
		document.addEventListener('keydown', this.boundHandleKeydown)
		console.log('DevConsole constructor: added global keydown listener')
	}

	/**
	 * Initialize the console with the game instance
	 */
	init(game: GameLoop) {
		console.log('Initializing DevConsole with game instance')
		this.game = game
		this.registerCommands()
		this.render()

		// After rendering, capture DOM elements
		if (this.shadowRoot) {
			this.consoleContainer = this.shadowRoot.querySelector('.DevConsole')
			this.outputElement = this.shadowRoot.querySelector('.DevConsole-output')
			this.inputElement = this.shadowRoot.querySelector('.DevConsole-input')
		}

		// Add the welcome message
		this.logToConsole('Welcome to WebHealer Developer Console!')
		this.logToConsole('Type /help to see available commands')

		console.log('DevConsole initialization complete')

		// Test if keybind is working
		console.log('Press ` (backtick/tilde) key to toggle the developer console')
	}

	/**
	 * Web component lifecycle - when element is added to DOM
	 */
	connectedCallback() {
		console.log('DevConsole connected to DOM')
		// Only render the initial structure - the actual content will be rendered when init() is called
		if (this.shadowRoot && !this.shadowRoot.firstChild) {
			this.render()
		}
	}

	/**
	 * Web component lifecycle - when element is removed from DOM
	 */
	disconnectedCallback() {
		console.log('DevConsole disconnected from DOM')
		// Clean up event listeners
		document.removeEventListener('keydown', this.boundHandleKeydown)
	}

	/**
	 * Web component lifecycle - when attributes change
	 */
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		console.log(`Attribute ${name} changed from ${oldValue} to ${newValue}`)
		// Handle attribute changes if needed
	}

	/**
	 * Web component lifecycle - define observed attributes
	 */
	static get observedAttributes() {
		return [] // No attributes to observe for now
	}

	/**
	 * Render the console UI
	 */
	render() {
		if (!this.shadowRoot) return

		const styles = `
      :host {
        --console-bg: rgba(0, 0, 0, 0.8);
        --console-text: #eee;
        --console-input-bg: rgba(0, 0, 0, 0.5);
        --console-height: 300px;
      }
      
      .DevConsole {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: var(--console-height);
        background-color: var(--console-bg);
        color: var(--console-text);
        font-family: monospace;
        z-index: 9999;
        display: flex;
        flex-direction: column;
      }
      
      .DevConsole[hidden] {
        display: none;
      }
      
      .DevConsole-output {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        line-height: 1.4;
        display: flex;
        flex-direction: column;
      }
      
      .DevConsole-inputWrapper {
        display: flex;
        align-items: center;
        background-color: var(--console-input-bg);
        border-top: 1px solid #444;
        padding: 0 8px;
      }
      
      .DevConsole-prefix {
        color: var(--console-text);
        padding-right: 4px;
      }
      
      .DevConsole-input {
        flex: 1;
        padding: 8px;
        background-color: transparent;
        color: var(--console-text);
        border: none;
        font-family: monospace;
        outline: none;
      }
    `

		render(
			this.shadowRoot,
			() => html`
				<style>
					${styles}
				</style>
				<div class="DevConsole" ?hidden=${!this.isVisible}>
					<div class="DevConsole-output">
						<!-- Output will be added here dynamically -->
						<div style="flex-grow: 1; min-height: 0;"></div>
					</div>
					<div class="DevConsole-inputWrapper">
						<span class="DevConsole-prefix">/</span>
						<input
							type="text"
							class="DevConsole-input"
							placeholder="Type a command (e.g., help)"
							onkeydown=${this.handleInputKeydown}
						/>
					</div>
				</div>
			`,
		)
	}

	/**
	 * Register all available commands
	 */
	private registerCommands() {
		this.registerCommand({
			name: 'help',
			description: 'Show available commands',
			execute: (game) => {
				const commandHelp = Array.from(this.commands.values())
					.map((cmd) => `/${cmd.name} - ${cmd.description}`)
					.join('\n')
				this.logToConsole('Available commands:\n' + commandHelp)
			},
		})

		this.registerCommand({
			name: 'godmode',
			description: 'Toggle invulnerability for players',
			execute: (game) => {
				game.godMode = !game.godMode
				this.logToConsole(`God mode ${game.godMode ? 'enabled' : 'disabled'}`)
			},
		})

		this.registerCommand({
			name: 'infinitemana',
			description: 'Toggle infinite mana for the player',
			execute: (game) => {
				game.infiniteMana = !game.infiniteMana
				if (game.infiniteMana && game.player && game.player.mana) {
					game.player.mana.current = game.player.mana.max
				}
				this.logToConsole(`Infinite mana ${game.infiniteMana ? 'enabled' : 'disabled'}`)
			},
		})

		this.registerCommand({
			name: 'enemies',
			description: 'Manage enemies (removeall, spawn [type])',
			execute: (game, args) => {
				if (!args || args.length === 0) {
					this.logToConsole('Usage: /enemies removeall|spawn [type]')
					return
				}

				if (args[0] === 'removeall') {
					game.enemies = []
					this.logToConsole('All enemies removed')
				} else if (args[0] === 'spawn') {
					// To be implemented for spawning specific enemies
					this.logToConsole('Spawn functionality coming soon')
				}
			},
		})

		this.registerCommand({
			name: 'heal',
			description: 'Heal all party members to full',
			execute: (game) => {
				game.party.forEach((member) => {
					member.health.current = member.health.max
				})
				this.logToConsole('All party members healed to full')
			},
		})

		this.registerCommand({
			name: 'reset',
			description: 'Reset the game state',
			execute: (game) => {
				location.reload()
			},
		})

		this.registerCommand({
			name: 'speed',
			description: 'Set game speed (0.5-2)',
			execute: (game, args) => {
				if (!args || args.length === 0) {
					this.logToConsole('Usage: /speed [0.5-2]')
					return
				}

				const speed = parseFloat(args[0])
				if (isNaN(speed) || speed < 0.1 || speed > 5) {
					this.logToConsole('Speed must be between 0.1 and 5')
					return
				}

				game.speed = speed
				this.logToConsole(`Game speed set to ${speed}`)
			},
		})
	}

	/**
	 * Register a command with the console
	 */
	private registerCommand(command: Command) {
		this.commands.set(command.name.toLowerCase(), command)
	}

	/**
	 * Toggle the console visibility
	 */
	toggleConsole() {
		this.isVisible = !this.isVisible
		console.log(
			`DevConsole: Toggle console visibility to ${this.isVisible ? 'visible' : 'hidden'}`,
		)

		if (!this.shadowRoot || !this.consoleContainer) {
			console.error('Cannot toggle console: shadowRoot or consoleContainer not found')
			return
		}

		// Update hidden attribute
		this.consoleContainer.hidden = !this.isVisible

		// Focus input when showing
		if (this.isVisible && this.inputElement) {
			// Use a small timeout to ensure the focus happens after display changes
			setTimeout(() => {
				if (this.inputElement) {
					this.inputElement.focus()
					// Clear any existing value for a clean start
					this.inputElement.value = ''
					console.log('Set focus to input element')
				}
			}, 50) // Increasing timeout for more reliability
		}
	}

	/**
	 * Execute a command string
	 */
	executeCommand(commandStr: string) {
		if (!commandStr) return

		// Add to history
		this.history.push(commandStr)
		this.historyIndex = this.history.length

		// Log the command
		this.logToConsole(`> ${commandStr}`)

		// Remove leading slash if present
		if (commandStr.startsWith('/')) {
			commandStr = commandStr.substring(1)
		}

		// Split into command and args
		const parts = commandStr.split(' ')
		const command = parts[0].toLowerCase()
		const args = parts.slice(1)

		// Execute the command if it exists
		const cmd = this.commands.get(command)
		if (cmd) {
			cmd.execute(this.game, args)
		} else {
			this.logToConsole(`Unknown command: ${command}. Type /help for available commands.`)
		}
	}

	/**
	 * Log a message to the console
	 */
	logToConsole(message: string) {
		if (!this.outputElement) return

		const lines = message.split('\n')

		lines.forEach((line) => {
			const lineElement = document.createElement('div')
			lineElement.textContent = line
			this.outputElement?.appendChild(lineElement)
		})

		// Auto-scroll to bottom
		this.outputElement.scrollTop = this.outputElement.scrollHeight
	}

	/**
	 * Handle keydown for the console input
	 */
	private handleInputKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && this.inputElement) {
			const command = this.inputElement.value.trim()
			if (command) {
				this.executeCommand(command)
				this.inputElement.value = ''
			}
		} else if (e.key === 'ArrowUp') {
			this.navigateHistory(-1)
			e.preventDefault()
		} else if (e.key === 'ArrowDown') {
			this.navigateHistory(1)
			e.preventDefault()
		}
	}

	/**
	 * Handle global keydown for showing/hiding the console
	 */
	private handleKeydown(e: KeyboardEvent) {
		// Toggle console with backtick/tilde key
		if (e.key === '`' || e.key === '~') {
			this.toggleConsole()
			e.preventDefault()
		}
	}

	/**
	 * Navigate through command history
	 */
	private navigateHistory(direction: number) {
		if (this.history.length === 0 || !this.inputElement) return

		this.historyIndex = Math.max(
			0,
			Math.min(this.history.length, this.historyIndex + direction),
		)

		if (this.historyIndex === this.history.length) {
			this.inputElement.value = ''
		} else {
			this.inputElement.value = this.history[this.historyIndex]
		}

		// Move cursor to end of input
		setTimeout(() => {
			if (this.inputElement) {
				this.inputElement.selectionStart = this.inputElement.value.length
				this.inputElement.selectionEnd = this.inputElement.value.length
			}
		}, 0)
	}

	/**
	 * Create status indicators for display
	 */
	getStatusIndicators() {
		const container = document.createElement('div')
		container.className = 'DevIndicators'

		// Add game speed indicator
		const speedIndicator = document.createElement('div')
		speedIndicator.textContent = `Speed: ${this.game.speed.toFixed(1)}x`
		container.appendChild(speedIndicator)

		// Add godmode indicator if enabled
		if (this.game.godMode) {
			const godModeIndicator = document.createElement('div')
			godModeIndicator.textContent = 'GodMode'
			godModeIndicator.style.color = '#ff0'
			container.appendChild(godModeIndicator)
		}

		// Add infinite mana indicator if enabled
		if (this.game.infiniteMana) {
			const manaIndicator = document.createElement('div')
			manaIndicator.textContent = 'InfMana'
			manaIndicator.style.color = '#0ff'
			container.appendChild(manaIndicator)
		}

		return container
	}
}

// Register the web component
customElements.define('dev-console', DevConsole)
