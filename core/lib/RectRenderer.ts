import { setElementStyle } from '../utils';
import { Rect } from '../primitives/Rect';
import { COLORS } from './theme';
import { RenderContext } from './RenderContext';

export class RectRenderer {
    private $: {
        ghostRect: SVGRectElement;
        linesPath: SVGPathElement;
        rect: SVGRectElement;
    };
    private referenceRect?: Rect;

    public constructor(renderContext: RenderContext, clipPathId?: string | null) {
        this.$ = {
            ghostRect: renderContext.create('rect'),
            linesPath: renderContext.create('path'),
            rect: renderContext.create('rect'),
        };

        if (clipPathId) {
            this.$.rect.setAttribute('clip-path', `url(#${clipPathId})`);
            this.$.linesPath.setAttribute('clip-path', `url(#${clipPathId})`);
        }

        setElementStyle(this.$.ghostRect, {
            fill: 'none',
            stroke: COLORS.blue,
            strokeWidth: '0.75',
            strokeDasharray: '4,6',
        });
        renderContext.append('size', this.$.ghostRect);

        setElementStyle(this.$.linesPath, {
            fill: 'none',
            stroke: COLORS.blue,
            strokeDasharray: '2',
            strokeWidth: '1.5',
        });
        renderContext.append('size', this.$.linesPath);

        setElementStyle(this.$.rect, {
            fill: 'none',
            stroke: COLORS.blue,
            strokeWidth: '1.5',
        });
        renderContext.append('size', this.$.rect);
    }

    private render(referenceRect: Rect, linesRects: Rect[]): void {
        referenceRect.applyToSVGRect(this.$.rect);
        referenceRect.applyToSVGRect(this.$.ghostRect);

        this.$.linesPath.setAttribute(
            'd',
            linesRects.reduce(
                (d, r) => d + `M ${r.x1},${r.y1} H ${r.x2} M ${r.x1},${r.y2} H ${r.x2}`,
                '',
            ),
        );
    }

    public update(referenceRect: Rect, linesRects: Rect[]): void {
        if (this.referenceRect && this.referenceRect.equals(referenceRect)) {
            return;
        }

        this.referenceRect = referenceRect;

        this.render(referenceRect, linesRects);
    }

    public unmount(): void {
        this.$.rect.remove();
        this.$.linesPath.remove();
        this.$.ghostRect.remove();
    }
}
