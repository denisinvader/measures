import { Rect } from '../primitives/Rect';
import { ClipPathRenderer } from './ClipPathRenderer';
import { LabelRenderer } from './LabelRenderer';
import { RectRenderer } from './RectRenderer';
import { RenderContext } from './RenderContext';
import { COLORS } from './theme';

export class ElementSizeObserver {
    private targetElement: HTMLElement | SVGElement;

    private clipPathRenderer: ClipPathRenderer;
    private labelRenderer: LabelRenderer;
    private rectRenderer: RectRenderer;

    public constructor(referenceElement: HTMLElement | SVGElement, renderContext: RenderContext) {
        this.targetElement = referenceElement;

        this.clipPathRenderer = new ClipPathRenderer(renderContext, referenceElement);
        this.labelRenderer = new LabelRenderer(renderContext, 'bottom', COLORS.blue);
        this.rectRenderer = new RectRenderer(renderContext, this.clipPathRenderer.id);

        this.update();
    }

    public update() {
        const nextRect = Rect.fromDOMRect(this.targetElement.getBoundingClientRect());

        this.clipPathRenderer.update();
        this.rectRenderer.update(nextRect);
        this.labelRenderer.update({
            reference: nextRect,
            text: nextRect.formatSize(),
        });
    }

    public destroy() {
        this.labelRenderer.unmount();
        this.rectRenderer.unmount();
        this.clipPathRenderer.unmount();
    }
}
