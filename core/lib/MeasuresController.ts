import { Rect } from '../primitives';
import { getTextNodeRange, isValidTextNode } from '../utils';
import { RelationObserver } from './RelationObserver';
import { SizeObserver } from './SizeObserver';
import { RenderContext } from './RenderContext';

export class MeasuresController {
    private sizeObservers: Map<Node, SizeObserver>;
    private lockedSizeNodes: Set<Node>;

    private relationObservers: Map<Node, Map<Node, RelationObserver>>;
    // TODO: implement relations locks
    // private lockedRelationObservers: Map<Node, Node>;

    private lastRAF: number;

    private renderContext: RenderContext;

    private currentReferenceNode: Node | null;
    private currentRelationNode: Node | null;

    private autoObserveCleanup: () => void;

    // TODO: remember x and y
    private lastHoverElement: Node | null;

    private shouldObserveTexts: boolean;

    constructor() {
        this.sizeObservers = new Map();
        this.lockedSizeNodes = new Set();

        this.relationObservers = new Map();
        // this.lockedRelationObservers = new Map();

        this.lastRAF = 0;

        this.renderContext = new RenderContext();

        this.currentReferenceNode = null;
        this.currentRelationNode = null;
        this.lastHoverElement = null;

        this.shouldObserveTexts = true;

        this.autoObserveCleanup = () => {};
    }

    private subscribeToRAF() {
        this.lastRAF = requestAnimationFrame(() => this.handleRAF());
    }

    private cancelLastRAF() {
        cancelAnimationFrame(this.lastRAF);
    }

    private handleRAF() {
        if (!this.sizeObservers.size && !this.relationObservers.size) {
            return;
        }

        this.renderContext.update();

        this.sizeObservers.forEach((t) => t.update());
        this.relationObservers.forEach((s) => s.forEach((o) => o.update()));

        this.subscribeToRAF();
    }

    public observe(node: Node) {
        if (this.sizeObservers.has(node)) {
            return;
        }

        if (isValidTextNode(node) || node instanceof HTMLElement || node instanceof SVGElement) {
            this.sizeObservers.set(node, new SizeObserver(node, this.renderContext));

            this.cancelLastRAF();

            this.subscribeToRAF();
        }
    }

    public unobserve(node: Node) {
        if (this.lockedSizeNodes.has(node)) {
            return;
        }
        const observer = this.sizeObservers.get(node);
        if (!observer) {
            return;
        }

        this.cancelLastRAF();

        observer.destroy();
        this.sizeObservers.delete(node);

        if (this.sizeObservers.size || this.relationObservers.size) {
            this.subscribeToRAF();
        }
    }

    public observeRelation(source: Node, target: Node) {
        let sourceObservers = this.relationObservers.get(source);
        if (sourceObservers && sourceObservers.has(target)) {
            return;
        }

        if (
            (isValidTextNode(source) ||
                source instanceof HTMLElement ||
                source instanceof SVGElement) &&
            (isValidTextNode(target) ||
                target instanceof HTMLElement ||
                target instanceof SVGElement)
        ) {
            if (!sourceObservers) {
                sourceObservers = new Map<Node, RelationObserver>();
                this.relationObservers.set(source, sourceObservers);
            }

            sourceObservers.set(target, new RelationObserver(this.renderContext, source, target));

            this.cancelLastRAF();

            this.subscribeToRAF();
        }
    }

    public unobserveRelation(source: Node, target: Node) {
        const sourceObservers = this.relationObservers.get(source);
        if (!sourceObservers) {
            return;
        }

        const observer = sourceObservers.get(target);
        if (!observer) {
            return;
        }

        this.cancelLastRAF();

        observer.unmount();

        sourceObservers.delete(target);

        if (!sourceObservers.size) {
            this.relationObservers.delete(source);
        }

        if (this.sizeObservers.size || this.relationObservers.size) {
            this.subscribeToRAF();
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

    private getTargetNode(element: Element, x: number, y: number): Node {
        const textNodes = Array.from(element.childNodes).filter(isValidTextNode);

        for (let i = 0; i < textNodes.length; i += 1) {
            const node = textNodes[i];
            const range = getTextNodeRange(node);
            const rect = Rect.fromDOMRect(range.getBoundingClientRect());

            if (rect.hasPoint({ x, y })) {
                return node;
            }
        }

        return element;
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

        if (!e.shiftKey || !this.currentReferenceNode) {
            if (e.target === document.body || !(e.target instanceof Element)) {
                return;
            }

            const target = this.shouldObserveTexts
                ? this.getTargetNode(e.target, e.clientX, e.clientY)
                : e.target;

            if (target === this.currentReferenceNode) {
                return;
            }

            if (this.currentReferenceNode) {
                this.unobserve(this.currentReferenceNode);
            }

            this.observe(target);
            this.currentReferenceNode = target;

            if (this.currentRelationNode) {
                this.unobserveRelation(this.currentReferenceNode, this.currentRelationNode);
                this.currentRelationNode = null;
            }

            return;
        }

        if (this.currentRelationNode) {
            this.unobserveRelation(this.currentReferenceNode, this.currentRelationNode);
        }

        if (e.target === document.body || !(e.target instanceof Element)) {
            return;
        }

        const target = this.shouldObserveTexts
            ? this.getTargetNode(e.target, e.clientX, e.clientY)
            : e.target;

        if (target === this.currentReferenceNode) {
            return;
        }

        this.observeRelation(this.currentReferenceNode, target);
        this.currentRelationNode = target;
    }

    bodyMouseLeaveHandler(e: MouseEvent) {
        if (
            e.relatedTarget &&
            e.relatedTarget instanceof Node &&
            document.documentElement.contains(e.relatedTarget)
        ) {
            return;
        }

        if (this.currentReferenceNode) {
            this.unobserve(this.currentReferenceNode);

            if (this.currentRelationNode) {
                this.unobserveRelation(this.currentReferenceNode, this.currentRelationNode);
            }

            this.currentReferenceNode = null;
            this.currentRelationNode = null;
        }
    }

    bodyKeyDownHandler(e: KeyboardEvent) {
        if (e.key.toLowerCase() === 't') {
            this.shouldObserveTexts = !this.shouldObserveTexts;
        }

        if (e.key.toLowerCase() === 'a') {
            if (this.currentReferenceNode) {
                if (this.lockedSizeNodes.has(this.currentReferenceNode)) {
                    this.lockedSizeNodes.delete(this.currentReferenceNode);
                } else {
                    this.lockedSizeNodes.add(this.currentReferenceNode);
                }
            }
        }

        if (e.key === 'Alt') {
            if (this.lastHoverElement) {
                this.observe(this.lastHoverElement);
                this.currentReferenceNode = this.lastHoverElement;
            }
        }
    }

    bodyKeyUpHandler(e: KeyboardEvent) {
        if (e.key === 'Alt') {
            if (this.currentReferenceNode) {
                this.unobserve(this.currentReferenceNode);
                this.currentReferenceNode = null;
            }
        }

        if (e.key === 'Shift') {
            // TODO: check if reverence currently hovered
            if (this.currentReferenceNode && this.currentRelationNode) {
                this.unobserveRelation(this.currentReferenceNode, this.currentRelationNode);
                this.unobserve(this.currentReferenceNode);
                this.currentReferenceNode = null;
                this.currentRelationNode = null;
            }
        }
    }

    autoObserve() {
        const mouseHanlder = this.mouseMoveHandler.bind(this);
        const bodyMouseLeaveHandler = this.bodyMouseLeaveHandler.bind(this);
        const bodyKeyDownHandler = this.bodyKeyDownHandler.bind(this);
        const bodyKeyUpHandler = this.bodyKeyUpHandler.bind(this);

        document.addEventListener('mousemove', mouseHanlder);
        document.addEventListener('mouseover', mouseHanlder);
        document.body.addEventListener('mouseleave', bodyMouseLeaveHandler);
        document.body.addEventListener('keydown', bodyKeyDownHandler);
        document.body.addEventListener('keyup', bodyKeyUpHandler);

        this.autoObserveCleanup = () => {
            document.removeEventListener('mousemove', mouseHanlder);
            document.removeEventListener('mouseover', mouseHanlder);
            document.body.removeEventListener('mouseleave', bodyMouseLeaveHandler);
            document.body.removeEventListener('keydown', bodyKeyDownHandler);
            document.body.removeEventListener('keyup', bodyKeyUpHandler);

            this.autoObserveCleanup = () => {};
        };
    }

    public cleanup() {
        this.autoObserveCleanup();
        this.cancelLastRAF();

        this.sizeObservers.forEach((o) => o.destroy());
        this.sizeObservers = new Map();

        this.relationObservers.forEach((s) => s.forEach((o) => o.unmount()));
        this.relationObservers = new Map();
    }

    public destroy() {
        this.cleanup();

        this.renderContext.unmount();
    }
}
