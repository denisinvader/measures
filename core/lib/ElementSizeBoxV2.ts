import { styles } from './ElementSizeBox.styles';
import { setElementStyle } from '../styles';
import { formatRectSize } from './formatRectSize';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// TODO: round here
const rectFromDom = ({ x, y, width, height }: DOMRect): Rect => ({
    x,
    y,
    width,
    height,
});

const round = (v: number) => {
    return Math.round(v * 100) / 100;
};

const rectsAreEqual = (a: Rect, b: Rect) => {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
};

interface Sides<T = number> {
    top: T;
    right: T;
    bottom: T;
    left: T;
}

const px = (v: number) => `${v}px`;

export class ElementSizeBoxV2 {
    private targetElement: HTMLElement | SVGElement;
    private elements: {
        root: HTMLElement;
        box: HTMLElement;
        sizeLabel: HTMLElement;
    };

    private rect: Rect;
    private prevRect: Rect;

    public constructor(targetElement: HTMLElement | SVGElement) {
        this.targetElement = targetElement;

        this.prevRect = this.rect = rectFromDom(targetElement.getBoundingClientRect());

        this.elements = {
            root: document.createElement('div'),
            box: document.createElement('div'),
            sizeLabel: document.createElement('div'),
        };

        setElementStyle(this.elements.root, styles.root);
        setElementStyle(this.elements.box, styles.box);
        setElementStyle(this.elements.sizeLabel, styles.boxSizeLabel);

        this.elements.box.appendChild(this.elements.sizeLabel);
        this.elements.root.appendChild(this.elements.box);

        document.body.appendChild(this.elements.root);

        this.render();
    }

    public render() {
        setElementStyle(this.elements.root, {
            left: px(this.rect.x),
            top: px(document.documentElement.scrollTop + this.rect.y),
        });

        setElementStyle(this.elements.box, {
            width: px(this.rect.width),
            height: px(this.rect.height),
        });

        this.elements.sizeLabel.innerText = formatRectSize(this.rect);

        this.prevRect = { ...this.rect };
    }

    public update() {
        const nextRect = rectFromDom(this.targetElement.getBoundingClientRect());

        if (rectsAreEqual(nextRect, this.rect)) {
            return;
        }

        this.rect = nextRect;
        this.render();
    }

    public destroy() {
        document.body.removeChild(this.elements.root);
    }
}
