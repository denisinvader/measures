import { setElementStyle } from '../../utils';
import { COLORS } from '../theme';
import type { RenderContext } from '../RenderContext';
import { Interval, Line, Rect, type Side, type Sides, forEachSide } from '../../primitives';
import { LabelView } from './LabelView';

const ZERO_LINE = new Line('x', 0, 0, 0);

export class RelationView {
    private sourceRect?: Rect;
    private targetRect?: Rect;

    private $: Sides<{
        normal: SVGLineElement;
        tangent: SVGLineElement;
        label: LabelView;
    }>;

    constructor(renderContext: RenderContext) {
        this.$ = {
            top: {
                normal: renderContext.create('line'),
                tangent: renderContext.create('line'),
                label: new LabelView(renderContext, 'right', COLORS.red),
            },
            right: {
                normal: renderContext.create('line'),
                tangent: renderContext.create('line'),
                label: new LabelView(renderContext, 'bottom', COLORS.red),
            },
            bottom: {
                normal: renderContext.create('line'),
                tangent: renderContext.create('line'),
                label: new LabelView(renderContext, 'right', COLORS.red),
            },
            left: {
                normal: renderContext.create('line'),
                tangent: renderContext.create('line'),
                label: new LabelView(renderContext, 'bottom', COLORS.red),
            },
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

    private render(sourceRect: Rect, targetRect: Rect): void {
        const mapSidesToRender: Partial<Sides<Side>> = {};

        const relations = {
            x: sourceRect.xInterval.getRelationTo(targetRect.xInterval),
            y: sourceRect.yInterval.getRelationTo(targetRect.yInterval),
        };

        if (relations.x === Interval.RELATION_BEFORE) {
            mapSidesToRender.right = 'left';
        } else if (relations.x === Interval.RELATION_AFTER) {
            mapSidesToRender.left = 'right';
        } else if (
            relations.x === Interval.RELATION_OVERLAPS ||
            relations.x === Interval.RELATION_CONTAINS
        ) {
            mapSidesToRender.left = 'left';
            mapSidesToRender.right = 'right';
        }

        if (relations.y === Interval.RELATION_BEFORE) {
            mapSidesToRender.bottom = 'top';
        } else if (relations.y === Interval.RELATION_AFTER) {
            mapSidesToRender.top = 'bottom';
        } else if (
            relations.y === Interval.RELATION_OVERLAPS ||
            relations.y === Interval.RELATION_CONTAINS
        ) {
            mapSidesToRender.top = 'top';
            mapSidesToRender.bottom = 'bottom';
        }

        forEachSide(this.$, (lines, side) => {
            const targetSide = mapSidesToRender[side];
            if (!targetSide) {
                ZERO_LINE.applyToSVGLine(lines.normal);
                ZERO_LINE.applyToSVGLine(lines.tangent);

                lines.label.update({
                    reference: ZERO_LINE,
                    text: '',
                    hidden: true,
                });
                return;
            }

            const sourceRectSide = sourceRect.sides[side];
            const targetRectSide = targetRect.sides[targetSide];

            const axisRelation = relations[sourceRectSide.axis];

            let lineTangetnt = sourceRectSide.middle;
            if (axisRelation === Interval.RELATION_CONTAINS) {
                lineTangetnt = targetRectSide.middle;
            } else if (axisRelation === Interval.RELATION_OVERLAPS) {
                lineTangetnt = sourceRectSide.intersectWith(targetRectSide).middle;
            }

            const normal = new Line(
                sourceRectSide.tangentAxis,
                sourceRectSide.tangent,
                targetRectSide.tangent,
                lineTangetnt,
            );

            normal.applyToSVGLine(lines.normal);

            lines.label.update({
                reference: normal,
                text: normal.formatLength(),
                hidden: !normal.length,
            });

            if (
                normal.length &&
                axisRelation !== Interval.RELATION_CONTAINS &&
                !targetRectSide.has(lineTangetnt)
            ) {
                let key: 'start' | 'end' = 'start';
                if (
                    axisRelation === Interval.RELATION_AFTER ||
                    axisRelation === Interval.RELATION_ENDS
                ) {
                    key = 'end';
                }

                const tangent = new Line(
                    sourceRectSide.axis,
                    sourceRectSide[key],
                    targetRectSide[key],
                    targetRectSide.tangent,
                );

                tangent.applyToSVGLine(lines.tangent);
            }
        });

        this.sourceRect = sourceRect;
        this.targetRect = targetRect;
    }

    public update(sourceRect: Rect, targetRect: Rect): void {
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

    public unmount(): void {
        forEachSide(this.$, (lines) => {
            lines.normal.remove();
            lines.tangent.remove();
            lines.label.unmount();
        });
    }
}
