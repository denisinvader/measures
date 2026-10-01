import { styles } from './ElementSizeBox.styles';
import { setElementStyle } from '../styles';
import { formatRectSize } from './formatRectSize';
import { isElementFixedPositioned } from './isElementFixedPositioned';
import { Rect } from './Rect';

const px = (v: number) => `${v}px`;

const getClipParent = (e: HTMLElement | SVGElement): Element | null => {
    if (e instanceof HTMLElement) {
        return e.offsetParent;
    }

    let current = e.parentElement;

    while (current) {
        if (current === document.body) {
            return null;
        }

        const { overflowX, overflowY, clipPath } = getComputedStyle(current);
        if (overflowX !== 'visible' || overflowY !== 'visible' || clipPath) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
};

export class ElementSizeBoxV2 {
    private targetElement: HTMLElement | SVGElement;
    private clipParent: Element;

    private elements: {
        root: HTMLElement;
        ghostRect: HTMLElement;
        visibleRect: HTMLElement;
        sizeLabel: HTMLElement;
    };

    private isFixed: boolean;

    private targetRect: Rect;
    private clipParentRect: Rect;
    private viewportRect: Rect;

    public constructor(targetElement: HTMLElement | SVGElement) {
        this.targetElement = targetElement;
        this.clipParent = getClipParent(targetElement) || document.documentElement;

        this.targetRect = Rect.fromDOMRect(targetElement.getBoundingClientRect());
        this.clipParentRect = Rect.fromDOMRect(this.clipParent.getBoundingClientRect());
        this.viewportRect = new Rect(0, 0, window.innerWidth, window.innerHeight);
        this.isFixed = isElementFixedPositioned(targetElement);

        this.elements = {
            root: document.createElement('div'),
            ghostRect: document.createElement('div'),
            visibleRect: document.createElement('div'),
            sizeLabel: document.createElement('div'),
        };

        setElementStyle(this.elements.root, { pointerEvents: 'none' });
        setElementStyle(this.elements.ghostRect, { ...styles.box, borderStyle: 'dashed' });
        setElementStyle(this.elements.visibleRect, styles.box);
        setElementStyle(this.elements.sizeLabel, { ...styles.boxSizeLabel, whiteSpace: 'nowrap' });

        this.elements.ghostRect.appendChild(this.elements.sizeLabel);
        this.elements.root.appendChild(this.elements.ghostRect);
        this.elements.root.appendChild(this.elements.visibleRect);

        document.body.appendChild(this.elements.root);

        this.render();
    }

    public render() {
        const [ghostRect, ghostClips] = this.targetRect.getIntersection(this.viewportRect);
        const [visibleRect, visibleClips] = this.targetRect.getIntersection(this.clipParentRect);
        if (!visibleRect.isValid || !ghostRect.isValid) {
            setElementStyle(this.elements.root, { display: 'none' });
            return;
        }

        setElementStyle(this.elements.root, {
            display: 'block',
        });

        setElementStyle(this.elements.ghostRect, {
            width: px(ghostRect.width),
            height: px(ghostRect.height),
            left: this.isFixed
                ? px(ghostRect.x)
                : px(document.documentElement.scrollLeft + ghostRect.x),
            top: this.isFixed
                ? px(ghostRect.y)
                : px(document.documentElement.scrollTop + ghostRect.y),
            position: this.isFixed ? 'fixed' : 'absolute',
        });

        setElementStyle(this.elements.visibleRect, {
            width: px(visibleRect.width),
            height: px(visibleRect.height),
            left: this.isFixed
                ? px(visibleRect.x)
                : px(document.documentElement.scrollLeft + visibleRect.x),
            top: this.isFixed
                ? px(visibleRect.y)
                : px(document.documentElement.scrollTop + visibleRect.y),
            position: this.isFixed ? 'fixed' : 'absolute',
        });

        const sideToBorder = {
            top: 'borderTopWidth',
            right: 'borderRightWidth',
            bottom: 'borderBottomWidth',
            left: 'borderLeftWidth',
        } as const;
        (['top', 'left', 'right', 'bottom'] as const).forEach((side) => {
            this.elements.ghostRect.style[sideToBorder[side]] = ghostClips[side] ? '0' : 'thin';
            this.elements.visibleRect.style[sideToBorder[side]] = visibleClips[side] ? '0' : 'thin';
        });

        this.elements.sizeLabel.innerText = [
            isElementFixedPositioned(this.targetElement) && 'F',
            formatRectSize(this.targetRect),
        ]
            .filter(Boolean)
            .join(' | ');
    }

    public update() {
        const nextRect = Rect.fromDOMRect(this.targetElement.getBoundingClientRect());
        const nextClipParentRect = Rect.fromDOMRect(this.clipParent.getBoundingClientRect());
        const nextViewportRect = new Rect(0, 0, window.innerWidth, window.innerHeight);

        if (
            this.targetRect.equals(nextRect) &&
            this.clipParentRect.equals(nextClipParentRect) &&
            this.viewportRect.equals(nextViewportRect)
        ) {
            return;
        }

        this.targetRect = nextRect;
        this.clipParentRect = nextClipParentRect;
        this.viewportRect = nextViewportRect;

        this.render();
    }

    public destroy() {
        document.body.removeChild(this.elements.root);
    }
}
