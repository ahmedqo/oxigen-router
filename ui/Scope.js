import Component from "oxigen-core/index.js";

const Scope = Component({
    taged: "oxi-scope",
    props: {
        path: {
            type: "string",
        },
    },
    setup: {
        mounted() {
            const _root = this.parentElement;
            const _el = ["OXI-SWITCH", "OXI-SCOPE", "OXI-ROUTE"];
            if (!_el.includes(_root.tagName)) {
                throw Error("Scope can only be used inside of " + _el);
            }
            if (_root.tagName === _el[1]) {
                const v1 = _root.path.endsWith("/") ? _root.path.slice(-1) : _root.path;
                const v2 = this.path.startsWith("/") ? this.path.slice(1) : this.path;
                this.path = [v1, v2].join("/");
            }
        },
    },
});

export default Scope;