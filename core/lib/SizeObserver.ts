import { Rect } from '../primitives';
import { getNodeDOMRects } from '../utils';
import { ClipPathObserver } from './ClipPathObserver';
import { RectView, LabelView } from './views';
import type { RenderContext } from './RenderContext';
import { COLORS } from './theme';

export class SizeObserver {
    private referenceNode: Element | Node;

    private clipPathObserver: ClipPathObserver;
    private labelView: LabelView;
    private rectView: RectView;

    public constructor(referenceNode: Element | Node, renderContext: RenderContext) {
        this.referenceNode = referenceNode;

        this.clipPathObserver = new ClipPathObserver(renderContext, referenceNode);
        this.labelView = new LabelView(renderContext, 'bottom', COLORS.blue);
        this.rectView = new RectView(renderContext, this.clipPathObserver.id);

        this.update();
    }

    public update() {
        const [boxRect, ...linesRects] = getNodeDOMRects(this.referenceNode).map(Rect.fromDOMRect);

        this.clipPathObserver.update();
        this.rectView.update(boxRect, linesRects);
        this.labelView.update({
            reference: boxRect,
            text: boxRect.formatSize(),
        });
    }

    public destroy() {
        this.labelView.unmount();
        this.rectView.unmount();
        this.clipPathObserver.unmount();
    }
}
