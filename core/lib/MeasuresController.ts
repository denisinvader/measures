import { ElementSizeObserver } from './ElementSizeObserver';
import { RenderContext } from './RenderContext';

// TODO: rename
export class MeasuresController {
    // TODO: rename to saved size-targets or smth
    private targets: Map<Node, ElementSizeObserver>;
    // TODO: rename
    private lastRAF: number;

    private renderContext: RenderContext;

    private currentReference: Node | null;
    private autoObserveCleanup: () => void;

    constructor() {
        this.targets = new Map();
        this.lastRAF = 0;

        this.renderContext = new RenderContext();

        this.currentReference = null;
        this.autoObserveCleanup = () => {};
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

    mouseMoveHandler(e: MouseEvent) {
        if (e.target === this.currentReference) {
            return;
        }

        if (this.currentReference) {
            this.unobserve(this.currentReference);
        }

        if (e.target === document.body || !(e.target instanceof Node)) {
            return;
        }

        this.observe(e.target);
        this.currentReference = e.target;
    }

    autoObserve() {
        const handler = (e: MouseEvent) => this.mouseMoveHandler(e);

        document.addEventListener('mouseover', handler);

        this.autoObserveCleanup = () => {
            document.removeEventListener('mouseover', handler);
        };
    }

    public cleanup() {
        this.autoObserveCleanup();
        this.stopRaf();

        this.targets.forEach((bb) => bb.destroy());
        this.targets = new Map();
    }
}
