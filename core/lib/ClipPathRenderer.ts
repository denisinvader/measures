import { findClipParents } from './findClipParents';
import { Rect } from './Rect';
import type { RenderContext } from './RenderContext';

const zeroRect = new Rect(0, 0, 0, 0);

export class ClipPathRenderer {
    private clipParents: Element[];
    private $: {
        clipPath: SVGClipPathElement;
        rect: SVGRectElement;
    };
    private clipRect: Rect;
    public readonly id: string | null;

    constructor(renderContext: RenderContext, referenceElement: HTMLElement | SVGElement) {
        this.clipParents = findClipParents(referenceElement);

        this.$ = {
            clipPath: renderContext.create('clipPath'),
            rect: renderContext.create('rect'),
        };

        this.clipRect = Rect.fromViewport();

        if (!this.clipParents.length) {
            this.id = null;
            return;
        }

        this.id = crypto.randomUUID();

        this.$.clipPath.id = this.id;
        this.$.clipPath.appendChild(this.$.rect);
        renderContext.append('defs', this.$.clipPath);

        this.update();
    }

    public render() {
        this.clipRect.applyToSVG(this.$.rect);
    }

    public update() {
        if (!this.clipParents.length) {
            return;
        }

        let nextClipRect = Rect.fromDOMRect(this.clipParents[0].getBoundingClientRect());

        for (let i = 1; i < this.clipParents.length; i += 1) {
            const nextParentRect = Rect.fromDOMRect(this.clipParents[i].getBoundingClientRect());
            nextClipRect = nextClipRect.intersect(nextParentRect);
        }

        if (!nextClipRect.isValid) {
            nextClipRect = zeroRect;
        }

        if (this.clipRect.equals(nextClipRect)) {
            return;
        }

        this.clipRect = nextClipRect;

        this.render();
    }

    public unmount() {
        this.$.rect.remove();
        this.$.clipPath.remove();
    }
}
