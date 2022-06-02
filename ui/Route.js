import Component, { html } from "oxigen-core/index.js";
import Router from "../core/index.js";

const Route = Component({
    taged: "oxi-route",
    props: {
        path: {
            type: "string",
        },
        name: {
            type: "string",
        },
    },
    setup: {
        mounted() {
            const _root = this.parentElement;
            const _el = ["OXI-SWITCH", "OXI-SCOPE"];
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
                    for (const node of this.childNodes) {
                        view = html ` ${view}${node.cloneNode(true)} `;
                    }
                    return view;
                },
                this.name
            );
        },
    },
});

export default Route;