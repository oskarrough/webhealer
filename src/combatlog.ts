import Pino from 'pino'
import {html} from 'uhtml'

/**
	import {logger} from 'combatlog'
	logger.debug('hello world')
	logger.info('hello world')
	logger.warn('hello world')
	logger.error('hello world')
*/

interface LogEvent {
	level: {
		label: string
		value: number
	}
	messages: (string | number | object)[]
	ts: number
}

const logs: LogEvent[] = []

function afterLog(log: LogEvent) {
	const el = document.querySelector('.Combatlog ul')
	if (!el) {
		console.warn('No element to render the log')
		return
	}
	const li = html.node`
		<li class=${log.level.label}>
			<em>${log.level.label}</em>
			<time>${formatTimestamp(log.ts)}</time>
			<span>${log.messages.map((msg) => html`<span>${msg}</span>`)}</span>
		</li>
	`
	el.appendChild(li)
	el.scrollTop = el.scrollHeight
}

const formatter = new Intl.DateTimeFormat('de', {
	// day: '2-digit',
	// month: '2-digit',
	// year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	fractionalSecondDigits: 2, // include milliseconds
})
function formatTimestamp(timestamp: number) {
	return formatter.format(new Date(timestamp))
}

export default function createLogger(logLevel?: string, renderToDom = true) {
	const logger = Pino({
		browser: {
			transmit: {
				send(_level, logEvent) {
					logs.push(logEvent)
					if (renderToDom) afterLog(logEvent)
				},
			},
		},
	})
	if (logLevel) logger.level = logLevel
	return logger
}

const logger = createLogger('debug')
// logger.debug('Logger initialized')
// logger.info('hello world', 'what', {more: 42})
// logger.warn('hello world')
// logger.error('hello world')

export {logger}

// Shortcut for logger.info()
export function log(...args: any) {
	return logger.info(args)
}
