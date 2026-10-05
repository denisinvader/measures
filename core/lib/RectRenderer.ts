import { COLORS, setElementStyle } from '../styles';
import { Rect } from './Rect';
import { RenderContext } from './RenderContext';

export class RectRenderer {
    private $: {
        ghostRect: SVGRectElement;
        rect: SVGRectElement;
    };
    private referenceRect?: Rect;

    public constructor(renderContext: RenderContext, clipPathId?: string | null) {
        this.$ = {
            ghostRect: renderContext.create('rect'),
            rect: renderContext.create('rect'),
        };

        setElementStyle(this.$.ghostRect, {
            fill: 'none',
            stroke: COLORS.blue,
            strokeWidth: '0.75',
            strokeDasharray: '4,6',
        });
        renderContext.append('size', this.$.ghostRect);

        setElementStyle(this.$.rect, {
            fill: 'none',
            stroke: COLORS.blue,
            strokeWidth: '1.5',
        });
        if (clipPathId) {
            this.$.rect.setAttribute('clip-path', `url(#${clipPathId})`);
        }
        renderContext.append('size', this.$.rect);
    }

    public render(referenceRect: Rect) {
        referenceRect.applyToSVG(this.$.rect);
        referenceRect.applyToSVG(this.$.ghostRect);
    }

    public update(referenceRect: Rect) {
        if (this.referenceRect && this.referenceRect.equals(referenceRect)) {
            return;
        }

        this.referenceRect = referenceRect;

        this.render(referenceRect);
    }

    public unmount() {
        this.$.rect.remove();
        this.$.ghostRect.remove();
    }
}
