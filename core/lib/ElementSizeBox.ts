import {
    size,
    hide,
    autoUpdate,
    computePosition,
    type Rect,
    type Strategy,
} from '@floating-ui/dom';

import { styles } from './ElementSizeBox.styles';
import { setElementStyle } from '../styles';
import { formatRectSize } from './formatRectSize';

const tmpFindScrollBox = (e: HTMLElement | SVGElement) => {
    let current = e.parentElement;

    while (current) {
        if (current === document.body) {
            return null;
        }

        const { overflowX, overflowY } = getComputedStyle(current);
        if (overflowX !== 'visible' || overflowY !== 'visible') {
            return current;
        }
        current = current.parentElement;
    }
    return null;
};

const hasFixedParent = (e: HTMLElement | SVGElement | null) => {
    let current = e;

    while (current) {
        if (current === document.body) {
            return false;
        }
        const { position } = getComputedStyle(current);
        if (position === 'fixed') {
            return true;
        }
        current = current.parentElement;
    }
    return false;
};

export class ElementSizeBox {
    public referenceElement: HTMLElement | SVGElement;

    private elements: {
        root: HTMLElement;
        box: HTMLElement;
        sizeLabel: HTMLElement;
    };

    private rect: Rect = { x: 0, y: 0, width: 0, height: 0 };
    private autoUpdateCleanup: () => void;

    private tmpHidden = false;
    private tmpEscaped = false;
    private tmpClippingParent: HTMLElement;

    private strategy: Strategy;

    constructor(referenceElement: HTMLElement | SVGElement) {
        this.referenceElement = referenceElement;

        this.elements = {
            root: document.createElement('div'),
            box: document.createElement('div'),
            sizeLabel: document.createElement('div'),
        };

        setElementStyle(this.elements.sizeLabel, styles.boxSizeLabel);
        setElementStyle(this.elements.box, styles.box);

        this.elements.box.appendChild(this.elements.sizeLabel);
        this.elements.root.appendChild(this.elements.box);

        document.body.appendChild(this.elements.root);

        this.autoUpdateCleanup = autoUpdate(referenceElement, this.elements.root, () => {
            this.update();
        });

        this.tmpClippingParent = tmpFindScrollBox(this.referenceElement) || document.body;

        this.strategy = hasFixedParent(this.referenceElement) ? 'fixed' : 'absolute';

        setElementStyle(this.elements.root, { ...styles.root, position: this.strategy });
    }

    public destroy(): void {
        this.autoUpdateCleanup();

        document.body.removeChild(this.elements.root);
    }

    private update() {
        computePosition(this.referenceElement, this.elements.root, {
            strategy: this.strategy,
            placement: 'top-start',
            middleware: [
                size({
                    apply: ({ rects }) => {
                        const { height, width } = rects.reference;
                        if (height == this.rect.height && width === this.rect.width) {
                            return;
                        }

                        this.rect.height = height;
                        this.rect.width = width;

                        this.handleSizeUpdate();

                        this.rect = { ...rects.reference };
                    },
                }),
                hide({
                    strategy: 'referenceHidden',
                    elementContext: 'reference',
                    rootBoundary: 'viewport',
                    boundary: this.tmpClippingParent,
                }),
                hide({
                    strategy: 'escaped',
                    elementContext: 'reference',
                    rootBoundary: 'viewport',
                    boundary: this.tmpClippingParent,
                }),
            ],
        }).then(({ x, y, middlewareData }) => {
            this.rect.x = x;
            this.rect.y = y;

            setElementStyle(this.elements.root, {
                left: `${x}px`,
                top: `${y}px`,
            });

            this.tmpHidden = !!middlewareData.hide?.referenceHidden;
            this.tmpEscaped = !!middlewareData.hide?.escaped;

            // TODO: remove
            this.handleSizeUpdate();

            if (this.tmpHidden && this.tmpClippingParent) {
                setElementStyle(this.elements.root, { display: 'none' });
            } else {
                setElementStyle(this.elements.root, { display: '' });
            }
        });
    }

    private handleSizeUpdate() {
        setElementStyle(this.elements.box, {
            width: `${this.rect.width}px`,
            height: `${this.rect.height}px`,
        });

        this.elements.sizeLabel.innerText =
            (this.tmpHidden ? 'hidden ' : '') +
            (this.tmpEscaped ? 'escaped' : '') +
            ' | ' +
            formatRectSize(this.rect);
    }
}
