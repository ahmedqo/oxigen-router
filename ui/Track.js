import Component, { html } from "oxigen-core/index.js";
import Router from "../core/index.js";

const Track = Component({
    taged: "oxi-router-track",
    props: {
        path: {
            type: "string",
        },
        name: {
            type: "string",
        },
        title: {
            type: "string",
        },
        guard: {
            type: "function",
            value: () => true,
        }
    },
    setup: {
        mounted() {
            const _root = this.parentElement;
            const _el = ["OXI-ROUTER-OUTLET", "OXI-ROUTER-SCOPE"];
            if (!_el.includes(_root.tagName)) {
                throw Error("Route can only be used inside of " + _el);
            }
            if (_root.tagName === _el[1]) {
                const v1 = _root.path.endsWith("/") ? _root.path.slice(-1) : _root.path;
                const v2 = this.path.startsWith("/") ? this.path.slice(1) : this.path;
                this.path = [v1, v2].join("/");
            }
            Router.add(
                this.path,
                () => {
                    var view = ``;
                    if (this.title) document.title = this.title
                    for (const node of this.childNodes)
                        view = html ` ${view}${node.cloneNode(true)} `;
                    return view;
                },
                this.name,
                this.guard
            );
        },
    },
});

export default Track;