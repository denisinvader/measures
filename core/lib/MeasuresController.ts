import { ElementSizeBoxV2 } from './ElementSizeBoxV2';

export class MeasuresController {
    private targets: Map<Node, ElementSizeBoxV2>;
    private lastRAF: number;

    constructor() {
        this.targets = new Map();
        this.lastRAF = 0;
    }

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

        this.targets.forEach((t) => t.update());

        this.goRaf();
    }

    public observe(node: Node) {
        if (this.targets.has(node)) {
            return;
        }

        if (node instanceof HTMLElement || node instanceof SVGElement) {
            this.targets.set(node, new ElementSizeBoxV2(node));

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
