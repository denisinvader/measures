import { getNodeRects } from './getNodeRects';
import { ClipPathRenderer } from './ClipPathRenderer';
import { LabelRenderer } from './LabelRenderer';
import { RectRenderer } from './RectRenderer';
import { RenderContext } from './RenderContext';
import { COLORS } from './theme';

// TODO: rename to SizeObserver
export class ElementSizeObserver {
    private referenceNode: Element | Node;

    private clipPathRenderer: ClipPathRenderer;
    private labelRenderer: LabelRenderer;
    private rectRenderer: RectRenderer;

    public constructor(referenceNode: Element | Node, renderContext: RenderContext) {
        this.referenceNode = referenceNode;

        this.clipPathRenderer = new ClipPathRenderer(renderContext, referenceNode);
        this.labelRenderer = new LabelRenderer(renderContext, 'bottom', COLORS.blue);
        this.rectRenderer = new RectRenderer(renderContext, this.clipPathRenderer.id);

        this.update();
    }

    public update() {
        const [boxRect, ...linesRects] = getNodeRects(this.referenceNode);

        this.clipPathRenderer.update();
        this.rectRenderer.update(boxRect, linesRects);
        this.labelRenderer.update({
            reference: boxRect,
            text: boxRect.formatSize(),
        });
    }

    public destroy() {
        this.labelRenderer.unmount();
        this.rectRenderer.unmount();
        this.clipPathRenderer.unmount();
    }
}
