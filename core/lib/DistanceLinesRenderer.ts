import { setElementStyle } from '../utils';
import type { Rect } from '../primitives/Rect';
import { forEachSide, type Side, type Sides } from '../primitives/sides';
import { COLORS } from './theme';
import type { RenderContext } from './RenderContext';
import { Interval } from '../primitives/Interval';
import { AxisSegment } from '../primitives/AxisSegment';
import { LabelRenderer } from './LabelRenderer';

const ZERO_SEGMENT = new AxisSegment('x', 0, 0, 0);

export class DistanceLinesRenderer {
    private sourceRect?: Rect;
    private targetRect?: Rect;

    private $: Sides<{
        join: SVGLineElement;
        tangent: SVGLineElement;
        label: LabelRenderer;
    }>;

    constructor(renderContext: RenderContext) {
        this.$ = {
            top: {
                join: renderContext.create('line'),
                tangent: renderContext.create('line'),
                label: new LabelRenderer(renderContext, 'right', COLORS.red),
            },
            right: {
                join: renderContext.create('line'),
                tangent: renderContext.create('line'),
                label: new LabelRenderer(renderContext, 'bottom', COLORS.red),
            },
            bottom: {
                join: renderContext.create('line'),
                tangent: renderContext.create('line'),
                label: new LabelRenderer(renderContext, 'right', COLORS.red),
            },
            left: {
                join: renderContext.create('line'),
                tangent: renderContext.create('line'),
                label: new LabelRenderer(renderContext, 'bottom', COLORS.red),
            },
        };

        forEachSide(this.$, (lines) => {
            setElementStyle(lines.join, {
                stroke: COLORS.red,
                strokeWidth: '1.5',
            });
            renderContext.append('relation', lines.join);

            setElementStyle(lines.tangent, {
                stroke: COLORS.red,
                strokeWidth: '0.75',
                strokeDasharray: '4,6',
            });
            renderContext.append('relation', lines.tangent);
        });
    }

    private render(sourceRect: Rect, targetRect: Rect) {
        const mapSidesToRender: Partial<Sides<Side>> = {};

        const relations = {
            x: sourceRect.xInterval.getRelationTo(targetRect.xInterval),
            y: sourceRect.yInterval.getRelationTo(targetRect.yInterval),
        };

        if (relations.x === Interval.RELATION_BEFORE) {
            mapSidesToRender.right = 'left';
        } else if (relations.x === Interval.RELATION_AFTER) {
            mapSidesToRender.left = 'right';
        } else {
            mapSidesToRender.left = 'left';
            mapSidesToRender.right = 'right';
        }

        if (relations.y === Interval.RELATION_BEFORE) {
            mapSidesToRender.bottom = 'top';
        } else if (relations.y === Interval.RELATION_AFTER) {
            mapSidesToRender.top = 'bottom';
        } else {
            mapSidesToRender.top = 'top';
            mapSidesToRender.bottom = 'bottom';
        }

        forEachSide(this.$, (lines, side) => {
            ZERO_SEGMENT.applyToSVG(lines.tangent);

            const targetSide = mapSidesToRender[side];
            if (!targetSide) {
                ZERO_SEGMENT.applyToSVG(lines.join);
                return;
            }

            const sourceRectSide = sourceRect.sides[side];
            const targetRectSide = targetRect.sides[targetSide];

            const axisRelation = relations[sourceRectSide.axis];

            let segmentTangent = sourceRectSide.middle;
            if (axisRelation === Interval.RELATION_CONTAINS) {
                segmentTangent = targetRectSide.middle;
            } else if (axisRelation === Interval.RELATION_OVERLAPS) {
                const intersection = sourceRectSide.intersectWith(targetRectSide);
                segmentTangent = intersection.middle;
                // TODO: intersect intervals and get middle
            }

            const segment = new AxisSegment(
                sourceRectSide.tangentAxis,
                sourceRectSide.tangent,
                targetRectSide.tangent,
                segmentTangent,
            );

            segment.applyToSVG(lines.join);

            lines.label.update(segment, segment.formatLength());

            if (
                segment.length &&
                axisRelation !== Interval.RELATION_CONTAINS &&
                !targetRectSide.has(segmentTangent)
            ) {
                const key =
                    relations[targetRectSide.axis] === Interval.RELATION_BEFORE ? 'start' : 'end';

                const support = new AxisSegment(
                    sourceRectSide.axis,
                    sourceRectSide[key],
                    targetRectSide[key],
                    targetRectSide.tangent,
                );

                support.applyToSVG(lines.tangent);
            }
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
            lines.join.remove();
            lines.tangent.remove();
            lines.label.unmount();
        });
    }
}
