import { Rect } from '../primitives/Rect';
import { ClipPathRenderer } from './ClipPathRenderer';
import { DistanceLinesRenderer } from './DistanceLinesRenderer';
import { RectRenderer } from './RectRenderer';
import { RenderContext } from './RenderContext';

export class DistanceObserver {
    private sourceElement: HTMLElement | SVGElement;
    private targetElement: HTMLElement | SVGElement;

    private targetClipPathRenderer: ClipPathRenderer;
    private targetRectRenderer: RectRenderer;
    private distanceLinesRenderer: DistanceLinesRenderer;

    constructor(
        renderContext: RenderContext,
        sourceElement: HTMLElement | SVGElement,
        targetElement: HTMLElement | SVGElement,
    ) {
        this.sourceElement = sourceElement;
        this.targetElement = targetElement;

        this.targetClipPathRenderer = new ClipPathRenderer(renderContext, targetElement);
        this.targetRectRenderer = new RectRenderer(renderContext, this.targetClipPathRenderer.id);
        this.distanceLinesRenderer = new DistanceLinesRenderer(renderContext);
    }

    public update() {
        const sourceRect = Rect.fromDOMRect(this.sourceElement.getBoundingClientRect());
        const targetRect = Rect.fromDOMRect(this.targetElement.getBoundingClientRect());

        this.targetClipPathRenderer.update();
        this.targetRectRenderer.update(targetRect);
        this.distanceLinesRenderer.update(sourceRect, targetRect);
    }

    public unmount() {
        this.distanceLinesRenderer.unmount();
        this.targetRectRenderer.unmount();
        this.targetClipPathRenderer.unmount();
    }
}
