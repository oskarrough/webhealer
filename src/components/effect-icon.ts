import {html} from 'uhtml'

export default function EffectIcon(effect: any) {
	return html`
		<div class="Spell">
			<div class="Spell-inner">
				<h3>${effect.name}</h3>
				<span> <span class="spin">⏲</span> ${effect.cycles} </span>
				<small hidden class="Spell-shortcut">${effect.cycles}</small>
			</div>
		</div>
	`
}
