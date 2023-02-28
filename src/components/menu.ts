import {html} from 'uhtml'
import Audio from '../nodes/audio'

export default function Menu(game) {
	const audio = game.find(Audio)!
	const handleChange= ({target}) => {
		audio.disabled = !target.checked
		audio.element.volume = target.checked ? 0.5 : 0
	}
	return html`
		<div class="Menu">
			<label>
				<input type="checkbox" onchange=${handleChange} checked> Volume
			</label>
		</menu>
	`
}

