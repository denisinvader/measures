import { RenderContext } from './RenderContext';
import { Rect } from './Rect';
import { type Side } from './sides';
import { COLORS, setElementStyle } from '../styles';
import { px } from './px';

const FONT_SIZE = 12;
const PADDING = 0.125 * FONT_SIZE;

export class LabelRenderer {
    private referenceRect?: Rect;
    private targetSide: Side;
    private text: string;

    private $: {
        root: SVGGElement;
        text: SVGTextElement;
        rect: SVGRectElement;
    };

    constructor(renderContext: RenderContext, targetSide: Side) {
        this.text = '';
        this.targetSide = targetSide;

        this.$ = {
            root: renderContext.create('g'),
            text: renderContext.create('text'),
            rect: renderContext.create('rect'),
        };

        setElementStyle(this.$.rect, {
            fill: COLORS.blue,
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

    public render(referenceRect: Rect, text: string) {
        this.$.text.textContent = text;

        const textWidth = this.$.text.getBoundingClientRect().width;
        const rect = new Rect(0, 0, textWidth + 2 * PADDING, FONT_SIZE + 2 * PADDING);

        rect.applyToSVG(this.$.rect);

        const x = referenceRect.sides.bottom.centerX;
        const y = referenceRect.sides.bottom.centerY;

        this.$.root.setAttribute('transform', `translate(${x - rect.width / 2} ${y})`);

        this.referenceRect = referenceRect;
        this.text = text;
    }

    public update(referenceRect: Rect, text: string) {
        if (this.text === text && this.referenceRect && this.referenceRect.equals(referenceRect)) {
            return;
        }

        this.render(referenceRect, text);
    }

    public unmount() {
        this.$.text.remove();
        this.$.rect.remove();
        this.$.root.remove();
    }
}
