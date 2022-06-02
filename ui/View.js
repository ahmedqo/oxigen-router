import Component, { html, sass } from "oxigen-core/index.js";
import Router from "../core/index.js";

const View = Component({
    taged: "oxi-view",
    props: {
        current: { type: "object" },
        params: { type: "object" },
        queries: { type: "object" },
    },
    setup: {
        mounted() {
            Router.change((route, params, queries) => {
                this.queries = queries;
                this.params = params;
                this.current = route;
            });
        },
    },
    styles() {
        return sass `
            :host {
                display: block;
            }
        `;
    },
    render() {
        return html `<slot />`;
    },
});

export default View;