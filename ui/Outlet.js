import Component, { html, sass } from "oxigen-core/index.js";
import Router from "../core/index.js";

const Outlet = Component({
    taged: "oxi-router-outlet",
    props: {
        hash: {
            type: "boolean",
            value: false,
        },
        current: {
            type: "object"
        },
        params: {
            type: "object"
        },
        queries: {
            type: "object"
        },
        prev: {
            type: "array",
        },
        next: {
            type: "array",
        },
    },
    setup: {
        mounted() {
            Router(this).next((route, params, queries) => {
                    this.queries = queries;
                    this.params = params;
                    this.current = route;
                }, ...this.next)
                .prev(...this.prev)
                .hash(this.hash)
                .load(() => {
                    Router.init();
                });
        },
    },
    styles() {
        return sass `
            @self {
                display: block;
            }
        `;
    },
});

export default Outlet;