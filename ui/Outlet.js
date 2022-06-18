import Component, { html, sass } from "oxigen-core/index.js";
import Router from "../core/index.js";

const View = Component({
    taged: "oxi-router-outlet",
    props: {
        current: { type: "object" },
        params: { type: "object" },
        queries: { type: "object" },
    },
    setup: {
        mounted() {
            Router(this).change((route, params, queries) => {
                    this.queries = queries;
                    this.params = params;
                    this.current = route;
                })
                .hash(this.hash)
                .load(() => {
                    Router.init();
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