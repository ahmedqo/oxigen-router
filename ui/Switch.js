import Component from "oxigen-core/index.js";
import Router from "../core/index.js";

const Switch = Component({
    taged: "oxi-switch",
    props: {
        hash: {
            type: "boolean",
            value: false,
        },
    },
    setup: {
        mounted() {
            const _root = this.parentElement;
            const _el = ["OXI-VIEW"];
            if (!_el.includes(_root.tagName)) {
                throw Error("Switch can only be used inside of " + _el);
            }
            Router(_root)
                .hash(this.hash)
                .load(() => {
                    Router.init();
                });
            this.remove();
        },
    },
});

export default Switch;