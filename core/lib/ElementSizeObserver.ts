import { Rect } from './Rect';
import type { RenderContext } from './RenderContext';
import { LabelRenderer } from './LabelRenderer';
import { ClipPathRenderer } from './ClipPathRenderer';
import { RectRenderer } from './RectRenderer';
import { formatRectSize } from './formatRectSize';

export class ElementSizeObserver {
    private targetElement: HTMLElement | SVGElement;

    private clipPathRenderer: ClipPathRenderer;
    private labelRenderer: LabelRenderer;
    private rectRenderer: RectRenderer;

    public constructor(referenceElement: HTMLElement | SVGElement, renderContext: RenderContext) {
        this.targetElement = referenceElement;

        this.clipPathRenderer = new ClipPathRenderer(renderContext, referenceElement);
        this.labelRenderer = new LabelRenderer(renderContext, 'bottom');
        this.rectRenderer = new RectRenderer(renderContext, this.clipPathRenderer.id);

        this.update();
    }

    public update() {
        const nextRect = Rect.fromDOMRect(this.targetElement.getBoundingClientRect());

        this.clipPathRenderer.update();
        this.rectRenderer.update(nextRect);
        this.labelRenderer.update(nextRect, formatRectSize(nextRect));
    }

    public destroy() {
        this.labelRenderer.unmount();
        this.rectRenderer.unmount();
        this.clipPathRenderer.unmount();
    }
}
