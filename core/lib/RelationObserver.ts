import { Rect } from '../primitives';
import { getNodeDOMRects } from '../utils';
import { ClipPathObserver } from './ClipPathObserver';
import type { RenderContext } from './RenderContext';
import { RectView, RelationView } from './views';

export class RelationObserver {
    private sourceNode: Node;
    private targetNode: Node;

    private targetClipPathObserver: ClipPathObserver;
    private rectView: RectView;
    private relationView: RelationView;

    constructor(renderContext: RenderContext, sourceNode: Node, targetNode: Node) {
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;

        this.targetClipPathObserver = new ClipPathObserver(renderContext, targetNode);
        this.rectView = new RectView(renderContext, this.targetClipPathObserver.id);
        this.relationView = new RelationView(renderContext);
    }

    public update() {
        const [sourceRect] = getNodeDOMRects(this.sourceNode).map(Rect.fromDOMRect);
        const [targetRect, ...linesRects] = getNodeDOMRects(this.targetNode).map(Rect.fromDOMRect);

        this.targetClipPathObserver.update();
        this.rectView.update(targetRect, linesRects);
        this.relationView.update(sourceRect, targetRect);
    }

    public unmount() {
        this.relationView.unmount();
        this.rectView.unmount();
        this.targetClipPathObserver.unmount();
    }
}
