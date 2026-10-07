import { setElementStyle } from '../../utils';
import { Line, Rect, type Side } from '../../primitives';
import { COLORS } from '../theme';
import type { RenderContext } from '../RenderContext';

const FONT_SIZE = 12;
const PADDING_X = 0.25 * FONT_SIZE;
const PADDING_Y = 0.125 * FONT_SIZE;
const OFFSET = 8;

interface LabelViewState {
    reference: Line | Rect;
    text: string;
    hidden?: boolean;
}

export class LabelView {
    private targetSide: Side;

    private state: Required<LabelViewState>;

    private $: {
        root: SVGGElement;
        text: SVGTextElement;
        rect: SVGRectElement;
    };

    constructor(renderContext: RenderContext, targetSide: Side, fill: string) {
        this.targetSide = targetSide;

        this.state = {
            reference: new Rect(0, 0, 0, 0),
            text: '',
            hidden: true,
        };

        this.$ = {
            root: renderContext.create('g'),
            text: renderContext.create('text'),
            rect: renderContext.create('rect'),
        };

        setElementStyle(this.$.rect, {
            fill,
            strokeWidth: '0',
        });
        this.$.rect.setAttribute('rx', Math.max(PADDING_X, PADDING_Y).toString());
        this.$.root.appendChild(this.$.rect);

        setElementStyle(this.$.text, {
            fill: COLORS.white,
            fontFamily: 'system-ui',
            fontSize: `${FONT_SIZE}px`,
            fontWeight: 'bold',
            dominantBaseline: 'central',
        });
        this.$.text.setAttribute(
            'transform',
            `translate(${PADDING_X + 1} ${PADDING_Y + FONT_SIZE / 2})`,
        );
        this.$.root.appendChild(this.$.text);

        renderContext.append('label', this.$.root);
    }

    private render({ reference, text, hidden }: LabelViewState): void {
        if (hidden) {
            this.$.root.setAttribute('opacity', '0');
            return;
        }
        if (!hidden && this.state.hidden) {
            this.$.root.removeAttribute('opacity');
        }

        const { center } = reference instanceof Rect ? reference.sides[this.targetSide] : reference;

        this.$.text.textContent = text;

        const textWidth = this.$.text.getBoundingClientRect().width;
        const rect = new Rect(0, 0, textWidth + 2 * PADDING_X, FONT_SIZE + 2 * PADDING_Y);

        rect.applyToSVGRect(this.$.rect);

        let xShift = 0;
        let yShift = 0;
        if (this.targetSide === 'top') {
            xShift = -rect.width / 2;
            yShift = -rect.height - OFFSET;
        }
        if (this.targetSide === 'right') {
            yShift = -rect.height / 2;
            xShift = OFFSET;
        }
        if (this.targetSide === 'bottom') {
            xShift = -rect.width / 2;
            yShift = OFFSET;
        }
        if (this.targetSide === 'left') {
            xShift = -rect.width - OFFSET;
            yShift = -rect.height / 2;
        }

        this.$.root.setAttribute(
            'transform',
            `translate(${center.x + xShift} ${center.y + yShift})`,
        );
    }

    public update({ reference, text, hidden = false }: LabelViewState): void {
        if (
            this.state.text === text &&
            this.state.reference.toString() === reference.toString() &&
            this.state.hidden === !!hidden
        ) {
            return;
        }

        this.render({ reference, text, hidden });

        this.state = { reference, text, hidden };
    }

    public unmount() {
        this.$.root.remove();
        this.$.text.remove();
        this.$.rect.remove();
    }
}
