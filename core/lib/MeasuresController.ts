import { DistanceObserver } from './DistanceObserver';
import { ElementSizeObserver } from './ElementSizeObserver';
import { RenderContext } from './RenderContext';

// TODO: https://jsfiddle.net/hodca/mcab43nd/87/
// TODO: rename
export class MeasuresController {
    private sizeObservers: Map<Node, ElementSizeObserver>;
    private lockedSizeNodes: Set<Node>;

    private relationObservers: Map<Node, Map<Node, DistanceObserver>>;
    // private lockedRelationObservers: Map<Node, Node>;

    private lastRequestAnimationFrame: number;

    private renderContext: RenderContext;

    private currentReference: Node | null;
    private relatedReference: Node | null;
    private autoObserveCleanup: () => void;

    private lastHoverElement: Node | null;

    constructor() {
        this.sizeObservers = new Map();
        this.lockedSizeNodes = new Set();

        this.relationObservers = new Map();
        // this.lockedRelationObservers = new Map();

        this.lastRequestAnimationFrame = 0;

        this.renderContext = new RenderContext();

        this.currentReference = null;
        this.relatedReference = null;
        this.lastHoverElement = null;
        this.autoObserveCleanup = () => {};
    }

    // TODO: rename
    private goRaf() {
        this.lastRequestAnimationFrame = requestAnimationFrame(() => this.tick());
    }

    private stopRaf() {
        cancelAnimationFrame(this.lastRequestAnimationFrame);
    }

    private tick() {
        if (!this.sizeObservers.size && !this.relationObservers.size) {
            return;
        }

        this.renderContext.update();

        this.sizeObservers.forEach((t) => t.update());
        this.relationObservers.forEach((s) => s.forEach((o) => o.update()));

        this.goRaf();
    }

    public observe(node: Node) {
        if (this.sizeObservers.has(node)) {
            return;
        }

        if (node instanceof HTMLElement || node instanceof SVGElement) {
            this.sizeObservers.set(node, new ElementSizeObserver(node, this.renderContext));

            this.stopRaf();

            this.goRaf();
        }
    }

    public unobserve(node: Node) {
        if (this.lockedSizeNodes.has(node)) {
            return;
        }
        const bb = this.sizeObservers.get(node);
        if (!bb) {
            return;
        }

        this.stopRaf();

        bb.destroy();
        this.sizeObservers.delete(node);

        if (this.sizeObservers.size || this.relationObservers.size) {
            this.goRaf();
        }
    }

    public observeRelation(source: Node, target: Node) {
        let sourceObservers = this.relationObservers.get(source);
        if (sourceObservers && sourceObservers.has(target)) {
            return;
        }

        if (
            (source instanceof HTMLElement || source instanceof SVGElement) &&
            (target instanceof HTMLElement || target instanceof SVGElement)
        ) {
            if (!sourceObservers) {
                sourceObservers = new Map<Node, DistanceObserver>();
                this.relationObservers.set(source, sourceObservers);
            }

            sourceObservers.set(target, new DistanceObserver(this.renderContext, source, target));

            this.stopRaf();

            this.goRaf();
        }
    }

    public unobserveRelation(source: Node, target: Node) {
        const sourceObservers = this.relationObservers.get(source);
        if (!sourceObservers) {
            return;
        }

        const bb = sourceObservers.get(target);
        if (!bb) {
            return;
        }

        this.stopRaf();

        bb.unmount();

        sourceObservers.delete(target);

        if (!sourceObservers.size) {
            this.relationObservers.delete(source);
        }

        if (this.sizeObservers.size || this.relationObservers.size) {
            this.goRaf();
        }
    }

    public unobserveAllRelations(source: Node) {
        const sourceObservers = this.relationObservers.get(source);
        if (!sourceObservers) {
            return;
        }

        sourceObservers.forEach((d, target) => {
            d.unmount();
            sourceObservers.delete(target);
        });

        if (!sourceObservers.size) {
            this.relationObservers.delete(source);
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

        if (!e.shiftKey || !this.currentReference) {
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

            if (this.relatedReference) {
                this.unobserveRelation(this.currentReference, this.relatedReference);
                this.relatedReference = null;
            }

            return;
        }

        if (this.relatedReference) {
            this.unobserveRelation(this.currentReference, this.relatedReference);
        }

        if (
            e.target === this.currentReference ||
            e.target === document.body ||
            !(e.target instanceof Node)
        ) {
            return;
        }

        this.observeRelation(this.currentReference, e.target);
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

            if (this.relatedReference) {
                this.unobserveRelation(this.currentReference, this.relatedReference);
            }

            this.currentReference = null;
            this.relatedReference = null;
        }
    }

    keyDownHandler(e: KeyboardEvent) {
        if (e.key === 'a') {
            if (this.currentReference) {
                if (this.lockedSizeNodes.has(this.currentReference)) {
                    this.lockedSizeNodes.delete(this.currentReference);
                } else {
                    this.lockedSizeNodes.add(this.currentReference);
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

        if (e.key === 'Shift') {
            if (this.currentReference && this.relatedReference) {
                this.unobserveRelation(this.currentReference, this.relatedReference);
                this.currentReference = null;
                this.relatedReference = null;
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

        this.sizeObservers.forEach((bb) => bb.destroy());
        this.sizeObservers = new Map();

        this.relationObservers.forEach((s) => s.forEach((d) => d.unmount()));
        this.relationObservers = new Map();
    }

    public destroy() {
        this.cleanup();

        this.renderContext.unmount();
    }
}
