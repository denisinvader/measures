import { setElementStyle, px } from '../utils';
import { Rect } from '../primitives/Rect';
import { type Side } from '../primitives/sides';
import { COLORS } from './theme';
import { RenderContext } from './RenderContext';
import { AxisSegment } from '../primitives/AxisSegment';

const FONT_SIZE = 11;
const PADDING = 0.125 * FONT_SIZE;

export class LabelRenderer {
    private reference?: AxisSegment | Rect;
    // TODO: implement
    // @ts-expect-error sefe
    private targetSide: Side;
    private text: string;

    private $: {
        root: SVGGElement;
        text: SVGTextElement;
        rect: SVGRectElement;
    };

    constructor(renderContext: RenderContext, targetSide: Side, fill: string = COLORS.blue) {
        this.text = '';
        this.targetSide = targetSide;

        this.$ = {
            root: renderContext.create('g'),
            text: renderContext.create('text'),
            rect: renderContext.create('rect'),
        };

        setElementStyle(this.$.rect, {
            fill,
            strokeWidth: '0',
        });
        this.$.root.appendChild(this.$.rect);

        setElementStyle(this.$.text, {
            fill: COLORS.white,
            fontFamily: 'system-ui',
            fontSize: px(FONT_SIZE),
            fontWeight: 'bold',
            dominantBaseline: 'central',
        });
        this.$.text.setAttribute(
            'transform',
            `translate(${PADDING + 1} ${PADDING + FONT_SIZE / 2})`,
        );
        this.$.root.appendChild(this.$.text);

        renderContext.append('label', this.$.root);
    }

    public render(reference: AxisSegment | Rect, text: string) {
        const { center } = reference instanceof Rect ? reference.sides.bottom : reference;
        const { x, y } = center;

        this.$.text.textContent = text;

        const textWidth = this.$.text.getBoundingClientRect().width;
        const rect = new Rect(0, 0, textWidth + 2 * PADDING, FONT_SIZE + 2 * PADDING);

        rect.applyToSVG(this.$.rect);

        this.$.root.setAttribute('transform', `translate(${x - rect.width / 2} ${y})`);

        this.reference = reference;
        this.text = text;
    }

    public update(reference: AxisSegment | Rect, text: string) {
        if (
            this.text === text &&
            this.reference &&
            ((reference instanceof Rect &&
                this.reference instanceof Rect &&
                this.reference.equals(reference)) ||
                (reference instanceof AxisSegment &&
                    this.reference instanceof AxisSegment &&
                    this.reference.equals(reference)))
        ) {
            return;
        }

        this.render(reference, text);
    }

    public unmount() {
        this.$.text.remove();
        this.$.rect.remove();
        this.$.root.remove();
    }
}
