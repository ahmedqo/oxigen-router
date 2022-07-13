import Component, { html } from "oxigen-core/index.js";
import Router from "../core/index.js";

const Loader = Component({
    taged: "oxi-router-loader",
    setup: {
        mounted() {
            const _root = this.parentElement;
            const _el = ["OXI-ROUTER-OUTLET"];
            if (!_el.includes(_root.tagName)) {
                throw Error("Loader can only be used inside of " + _el);
            }
            Router.loader(
                () => {
                    var view = ``;
                    for (const node of this.childNodes)
                        view = html ` ${view}${node.cloneNode(true)} `;
                    return view;
                }
            );
        },
    },
});

export default Loader;