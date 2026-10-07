import { getNodeRects } from './getNodeRects';
import { ClipPathRenderer } from './ClipPathRenderer';
import { DistanceLinesRenderer } from './DistanceLinesRenderer';
import { RectRenderer } from './RectRenderer';
import { RenderContext } from './RenderContext';

export class DistanceObserver {
    private sourceNode: Node;
    private targetNode: Node;

    private targetClipPathRenderer: ClipPathRenderer;
    private targetRectRenderer: RectRenderer;
    private distanceLinesRenderer: DistanceLinesRenderer;

    constructor(renderContext: RenderContext, sourceNode: Node, targetNode: Node) {
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;

        this.targetClipPathRenderer = new ClipPathRenderer(renderContext, targetNode);
        this.targetRectRenderer = new RectRenderer(renderContext, this.targetClipPathRenderer.id);
        this.distanceLinesRenderer = new DistanceLinesRenderer(renderContext);
    }

    public update() {
        const [sourceRect] = getNodeRects(this.sourceNode);
        const [targetRect, ...targetLinesRects] = getNodeRects(this.targetNode);

        this.targetClipPathRenderer.update();
        this.targetRectRenderer.update(targetRect, targetLinesRects);
        this.distanceLinesRenderer.update(sourceRect, targetRect);
    }

    public unmount() {
        this.distanceLinesRenderer.unmount();
        this.targetRectRenderer.unmount();
        this.targetClipPathRenderer.unmount();
    }
}
