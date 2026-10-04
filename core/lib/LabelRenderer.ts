import { RenderContext } from './RenderContext';
import { Rect } from './Rect';
import { type Side } from './sides';
import { COLORS, setElementStyle } from '../styles';
import { px } from './px';

const FONT_SIZE = 12;
const PADDING = 0.125 * FONT_SIZE;

const s = (v: unknown) => String(v);

export class LabelRenderer {
    private referenceRect?: Rect;
    private targetSide: Side;
    private text: string;

    private groupElement: SVGGElement;
    private textElement: SVGTextElement;
    private rectElement: SVGRectElement;

    constructor(renderContext: RenderContext, targetSide: Side) {
        this.text = '';
        this.targetSide = targetSide;

        this.groupElement = renderContext.createElement('g');

        this.rectElement = renderContext.createElement('rect');
        // this.rectElement.setAttribute('rx', '3');
        setElementStyle(this.rectElement, {
            fill: COLORS.blue,
            strokeWidth: '0',
        });
        this.groupElement.appendChild(this.rectElement);

        this.textElement = renderContext.createElement('text');
        setElementStyle(this.textElement, {
            fill: COLORS.white,
            fontFamily: 'system-ui',
            fontSize: px(FONT_SIZE),
            fontWeight: 'bold',
            dominantBaseline: 'central',
        });
        this.groupElement.appendChild(this.textElement);

        renderContext.appendChild(this.groupElement);
    }

    public render(referenceRect: Rect, text: string) {
        const x = referenceRect.sides.bottom.centerX;
        const y = referenceRect.sides.bottom.centerY;

        this.textElement.setAttribute('x', '0');
        this.textElement.setAttribute('y', '0');
        this.textElement.textContent = text;

        const textWidth = this.textElement.getBoundingClientRect().width;
        const width = textWidth + 2 * PADDING;
        const height = FONT_SIZE + 2 * PADDING;

        this.rectElement.setAttribute('x', s(-1));
        this.rectElement.setAttribute('y', s(0));
        this.rectElement.setAttribute('width', s(width));
        this.rectElement.setAttribute('height', s(height));

        this.textElement.setAttribute(
            'transform',
            `translate(${PADDING} ${PADDING + FONT_SIZE / 2})`,
        );

        this.groupElement.setAttribute('transform', `translate(${x - width / 2} ${y})`);

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
        this.textElement.remove();
        this.rectElement.remove();
        this.groupElement.remove();
    }
}
