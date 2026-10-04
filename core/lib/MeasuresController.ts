import { ElementSizeObserver } from './ElementSizeObserver';
import { RenderContext } from './RenderContext';

// TODO: https://jsfiddle.net/hodca/mcab43nd/87/
// TODO: rename
export class MeasuresController {
    // TODO: rename to saved size-targets or smth
    private targets: Map<Node, ElementSizeObserver>;
    private lockedTargets: Set<Node>;
    // TODO: rename
    private lastRAF: number;

    private renderContext: RenderContext;

    private currentReference: Node | null;
    private relatedReference: Node | null;
    private autoObserveCleanup: () => void;

    private lastHoverElement: Node | null;

    constructor() {
        this.targets = new Map();
        this.lockedTargets = new Set();
        this.lastRAF = 0;

        this.renderContext = new RenderContext();

        this.currentReference = null;
        this.relatedReference = null;
        this.lastHoverElement = null;
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
        if (this.lockedTargets.has(node)) {
            return;
        }
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
        if (e.target instanceof Node) {
            this.lastHoverElement = e.target;
        }

        // if (!e.altKey) {
        //     if (this.currentReference) {
        //         this.unobserve(this.currentReference);
        //     }
        //     return;
        // }

        if (e.target === this.currentReference || e.target === this.relatedReference) {
            return;
        }

        if (!e.shiftKey || !this.currentReference) {
            if (this.currentReference) {
                this.unobserve(this.currentReference);
            }

            if (e.target === document.body || !(e.target instanceof Node)) {
                return;
            }

            this.observe(e.target);
            this.currentReference = e.target;

            if (this.relatedReference) {
                this.unobserve(this.relatedReference);
                this.relatedReference = null;
            }

            return;
        }

        if (this.relatedReference) {
            this.unobserve(this.relatedReference);
        }

        if (e.target === document.body || !(e.target instanceof Node)) {
            return;
        }

        this.observe(e.target);
        this.relatedReference = e.target;
    }

    mouseLeaveHandler(e: MouseEvent) {
        if (
            e.relatedTarget &&
            e.relatedTarget instanceof Node &&
            document.documentElement.contains(e.relatedTarget)
        ) {
            return;
        }

        if (this.currentReference) {
            this.unobserve(this.currentReference);
            this.currentReference = null;
        }
    }

    keyDownHandler(e: KeyboardEvent) {
        if (e.key === 'a') {
            if (this.currentReference) {
                if (this.lockedTargets.has(this.currentReference)) {
                    this.lockedTargets.delete(this.currentReference);
                } else {
                    this.lockedTargets.add(this.currentReference);
                }
            }
        }

        if (e.key === 'Alt') {
            if (this.lastHoverElement) {
                this.observe(this.lastHoverElement);
                this.currentReference = this.lastHoverElement;
            }
        }
    }

    keyUpHandler(e: KeyboardEvent) {
        if (e.key === 'Alt') {
            if (this.currentReference) {
                this.unobserve(this.currentReference);
                this.currentReference = null;
            }
        }
    }

    autoObserve() {
        const handler = this.mouseMoveHandler.bind(this);
        const mouseLeaveHandler = this.mouseLeaveHandler.bind(this);
        const keyDownHandler = this.keyDownHandler.bind(this);
        const keyUpHandler = this.keyUpHandler.bind(this);

        document.addEventListener('mousemove', handler);
        document.addEventListener('mouseover', handler);
        document.body.addEventListener('mouseleave', mouseLeaveHandler);
        document.body.addEventListener('keydown', keyDownHandler);
        document.body.addEventListener('keyup', keyUpHandler);

        this.autoObserveCleanup = () => {
            document.removeEventListener('mousemove', handler);
            document.removeEventListener('mouseover', handler);
            document.body.removeEventListener('mouseleave', mouseLeaveHandler);
            document.body.removeEventListener('keydown', keyDownHandler);
            document.body.removeEventListener('keyup', keyUpHandler);

            this.autoObserveCleanup = () => {};
        };
    }

    public cleanup() {
        this.autoObserveCleanup();
        this.stopRaf();

        this.targets.forEach((bb) => bb.destroy());
        this.targets = new Map();
    }
}
