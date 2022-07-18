import Component, { html, sass, when } from "oxigen-core/index.js";
import { redirect, logs } from "../core/index.js";

const Link = Component({
	taged: "oxi-router-link",
	props: {
		path: {
			type: "string",
		},
	},
	attrs: {
		active: {
			type: "boolean",
			value: false,
		},
	},
	setup: {
		mounted() {
			this.addEventListener("click", (e) => {
				document.querySelectorAll("oxi-router-link").forEach((e) => {
					e.attrs.active = false;
				});
				this.attrs.active = true;
				this.emit("oxi-click");
				redirect(this.path);
			});
		},
		updated() {
			const { current } = logs();
			if (current?.route?.input === this.path) {
				this.attrs.active = true;
			} else {
				this.attrs.active = false;
			}
		},
	},
	styles() {
		return sass`
            :host, :host * {
                display: inline-block;
                font-size: 16px;
                font-weight: 600;
                ${when(
					this.attrs.active,
					` 
                        color: #ff0057;
						fill: #ff0057;
                    `,
					`
                        color: #2e3eff;
						fill: #2e3eff;
                    `
				)}
                &(:hover) {
                    cursor: pointer;
                    text-decoration: underline;
                }
            }
        `;
	},
	render() {
		return html`<slot />`;
	},
});

export default Link;
