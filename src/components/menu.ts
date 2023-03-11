import {html} from 'uhtml'
import {WebHealer} from '../game-loop'
import Audio from '../nodes/audio'

export default function Menu(game: WebHealer) {
	const audio = game.find(Audio)!

	//@ts-ignore
	const handleChange= ({target}) => {
		audio.disabled = !target.checked
		if (audio.element) audio.element.volume = target.checked ? 0.5 : 0
	}

	return html`
		<div class="Menu">
			<label>
				<input type="checkbox" onchange=${handleChange} checked> Volume
			</label>
		</menu>
	`
}

