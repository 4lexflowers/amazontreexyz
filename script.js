import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';
const PARAMS = {
    size: 100
};
const pane = new Pane();
pane.addBinding(PARAMS, 'size', {min: 10, max: 200});

new p5((p) => {
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
    }
    p.draw = () => {
        p.background(200);
        p.circle(p.mouseX, p.mouseY, PARAMS.size);
    }
});