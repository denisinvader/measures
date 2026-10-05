import { setElementStyle } from '../utils';
import type { Rect } from '../primitives/Rect';
import { forEachSide, type Sides } from '../primitives/sides';
import { COLORS } from './theme';
import type { RenderContext } from './RenderContext';

export class DistanceLinesRenderer {
    private sourceRect?: Rect;
    private targetRect?: Rect;

    private $: Sides<{
        normal: SVGLineElement;
        tangent: SVGLineElement;
    }>;

    constructor(renderContext: RenderContext) {
        this.$ = {
            top: { normal: renderContext.create('line'), tangent: renderContext.create('line') },
            right: { normal: renderContext.create('line'), tangent: renderContext.create('line') },
            bottom: { normal: renderContext.create('line'), tangent: renderContext.create('line') },
            left: { normal: renderContext.create('line'), tangent: renderContext.create('line') },
        };

        forEachSide(this.$, (lines) => {
            setElementStyle(lines.normal, {
                stroke: COLORS.red,
                strokeWidth: '1.5',
            });
            renderContext.append('relation', lines.normal);

            setElementStyle(lines.tangent, {
                stroke: COLORS.red,
                strokeWidth: '0.75',
                strokeDasharray: '4,6',
            });
            renderContext.append('relation', lines.tangent);
        });
    }

    private render(sourceRect: Rect, targetRect: Rect) {
        forEachSide(this.$, (lines, side) => {
            lines.tangent.x1.baseVal.value = 0;
            lines.tangent.x2.baseVal.value = 0;
            lines.tangent.y1.baseVal.value = 0;
            lines.tangent.y2.baseVal.value = 0;

            lines.normal.x1.baseVal.value = sourceRect.sides[side].centerX;
            lines.normal.x2.baseVal.value = targetRect.sides[side].centerX;
            lines.normal.y1.baseVal.value = sourceRect.sides[side].centerY;
            lines.normal.y2.baseVal.value = targetRect.sides[side].centerY;
        });

        this.sourceRect = sourceRect;
        this.targetRect = targetRect;
    }

    public update(sourceRect: Rect, targetRect: Rect) {
        if (
            this.sourceRect &&
            this.sourceRect.equals(sourceRect) &&
            this.targetRect &&
            this.targetRect.equals(targetRect)
        ) {
            return;
        }

        this.render(sourceRect, targetRect);
    }

    public unmount() {
        forEachSide(this.$, (lines) => {
            lines.normal.remove();
            lines.tangent.remove();
        });
    }
}
