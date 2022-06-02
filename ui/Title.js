import Component from "oxigen-core/index.js";

const Title = Component({
    taged: "oxi-title",
    logic: {
        call() {
            var txt = this.textContent;
            document.title = txt;
        }
    }
});

export default Title;