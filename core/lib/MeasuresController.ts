import { ElementSizeObserver } from './ElementSizeObserver';
import { RenderContext } from './RenderContext';

// TODO: rename
export class MeasuresController {
    // TODO: rename to saved size-targets or smth
    private targets: Map<Node, ElementSizeObserver>;
    // TODO: rename
    private lastRAF: number;

    private renderContext: RenderContext;

    constructor() {
        this.targets = new Map();
        this.lastRAF = 0;

        this.renderContext = new RenderContext();
    }

    // TODO: rename
    private goRaf() {
        this.lastRAF = requestAnimationFrame(() => this.tick());
    }

    private stopRaf() {
        cancelAnimationFrame(this.lastRAF);
    }

    private tick() {
        if (!this.targets.size) {
            return;
        }

        this.renderContext.update();

        this.targets.forEach((t) => t.update());

        this.goRaf();
    }

    public observe(node: Node) {
        if (this.targets.has(node)) {
            return;
        }

        if (node instanceof HTMLElement || node instanceof SVGElement) {
            this.targets.set(node, new ElementSizeObserver(node, this.renderContext));

            this.stopRaf();

            this.goRaf();
        }
    }

    public unobserve(node: Node) {
        const bb = this.targets.get(node);
        if (!bb) {
            return;
        }

        this.stopRaf();

        bb.destroy();
        this.targets.delete(node);

        if (this.targets.size) {
            this.goRaf();
        }
    }

    public cleanup() {
        this.stopRaf();

        this.targets.forEach((bb) => bb.destroy());
        this.targets = new Map();
    }
}
