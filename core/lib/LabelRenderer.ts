import { setElementStyle } from '../utils';
import { Rect } from '../primitives/Rect';
import { type Side } from '../primitives/sides';
import { COLORS } from './theme';
import { RenderContext } from './RenderContext';
import { Line } from '../primitives/Line';

const FONT_SIZE = 11;
const PADDING = 0.125 * FONT_SIZE;

interface LabelViewState {
    reference: Line | Rect;
    text: string;
    hidden?: boolean;
}

export class LabelRenderer {
    // FIXME: implement
    // @ts-expect-error sefe
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
            `translate(${PADDING + 1} ${PADDING + FONT_SIZE / 2})`,
        );
        this.$.root.appendChild(this.$.text);

        renderContext.append('label', this.$.root);
    }

    public render({ reference, text, hidden }: LabelViewState) {
        if (hidden) {
            this.$.root.setAttribute('opacity', '0');
            return;
        }
        if (!hidden && this.state.hidden) {
            this.$.root.removeAttribute('opacity');
        }

        const { center } = reference instanceof Rect ? reference.sides.bottom : reference;
        const { x, y } = center;

        this.$.text.textContent = text;

        const textWidth = this.$.text.getBoundingClientRect().width;
        const rect = new Rect(0, 0, textWidth + 2 * PADDING, FONT_SIZE + 2 * PADDING);

        rect.applyToSVGRect(this.$.rect);

        this.$.root.setAttribute('transform', `translate(${x - rect.width / 2} ${y})`);
    }

    public update({ reference, text, hidden = false }: LabelViewState) {
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
        this.$.text.remove();
        this.$.rect.remove();
        this.$.root.remove();
    }
}
