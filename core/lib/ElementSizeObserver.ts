import { COLORS, setElementStyle } from '../styles';
import { Rect } from './Rect';
import { findClipParent } from './findClipParent';
import type { RenderContext } from './RenderContext';
import { forEachSide, type Sides } from './sides';
import { LabelRenderer } from './LabelRenderer';
import { formatRectSize } from './formatRectSize';

const s = (d: unknown) => `${d}`;

export class ElementSizeObserver {
    private targetElement: HTMLElement | SVGElement;
    private targetRect: Rect;

    private clipParent: Element;
    private clipParentRect: Rect;

    private elements: {
        ghostRect: SVGRectElement;
        sides: Sides<SVGLineElement>;
    };

    private labelRenderer: LabelRenderer;

    public constructor(targetElement: HTMLElement | SVGElement, renderContext: RenderContext) {
        this.targetElement = targetElement;
        this.clipParent = findClipParent(targetElement) || document.documentElement;

        this.targetRect = Rect.fromDOMRect(targetElement.getBoundingClientRect());
        this.clipParentRect = Rect.fromDOMRect(this.clipParent.getBoundingClientRect());

        this.elements = {
            ghostRect: renderContext.createElement('rect'),
            sides: {
                top: renderContext.createElement('line'),
                right: renderContext.createElement('line'),
                bottom: renderContext.createElement('line'),
                left: renderContext.createElement('line'),
            },
        };

        setElementStyle(this.elements.ghostRect, {
            fill: 'none',
            stroke: COLORS.blue,
            strokeWidth: '0.75',
            strokeDasharray: '4,6',
        });
        renderContext.appendChild(this.elements.ghostRect);

        forEachSide(this.elements.sides, (el) => {
            setElementStyle(el, { fill: 'none', stroke: COLORS.blue });
            renderContext.appendChild(el);
        });

        this.labelRenderer = new LabelRenderer(renderContext, 'bottom');

        this.render();
    }

    public render() {
        this.elements.ghostRect.setAttribute('x', s(this.targetRect.x));
        this.elements.ghostRect.setAttribute('y', s(this.targetRect.y));
        this.elements.ghostRect.setAttribute('width', s(this.targetRect.width));
        this.elements.ghostRect.setAttribute('height', s(this.targetRect.height));

        const visibleRect = this.targetRect.intersect(this.clipParentRect);
        forEachSide(this.elements.sides, (line, side) => {
            const visibleSide = visibleRect.sides[side];

            if (!visibleRect.isValid || visibleRect.sides[side].isClipped) {
                setElementStyle(line, { strokeWidth: '0' });
                return;
            }

            setElementStyle(line, { strokeWidth: '1.5' });
            line.setAttribute('x1', s(visibleSide.x1));
            line.setAttribute('x2', s(visibleSide.x2));
            line.setAttribute('y1', s(visibleSide.y1));
            line.setAttribute('y2', s(visibleSide.y2));
        });

        this.labelRenderer.render(this.targetRect, formatRectSize(this.targetRect));

        // this.elements.sizeLabel.innerText = [formatRectSize(this.targetRect)]
        //     .filter(Boolean)
        //     .join(' | ');
    }

    public update() {
        const nextRect = Rect.fromDOMRect(this.targetElement.getBoundingClientRect());
        const nextClipParentRect = Rect.fromDOMRect(this.clipParent.getBoundingClientRect());

        if (this.targetRect.equals(nextRect) && this.clipParentRect.equals(nextClipParentRect)) {
            return;
        }

        this.targetRect = nextRect;
        this.clipParentRect = nextClipParentRect;

        this.render();
    }

    public destroy() {
        this.labelRenderer.unmount();

        this.elements.ghostRect.remove();

        forEachSide(this.elements.sides, (e) => e.remove());
    }
}
