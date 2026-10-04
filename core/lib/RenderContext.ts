import { setElementStyle } from '../styles';
import { px } from './px';

const NS = 'http://www.w3.org/2000/svg';

// TODO: different render contexts for box, relation and labels
export class RenderContext {
    private root: SVGElement;

    constructor() {
        this.root = document.createElementNS(NS, 'svg');
        this.root.setAttribute('style', 'border: 1px solid black');
        this.root.setAttributeNS(
            'http://www.w3.org/2000/xmlns/',
            'xmlns:xlink',
            'http://www.w3.org/1999/xlink',
        );

        setElementStyle(this.root, {
            border: '0',
            padding: '0',
            margin: '0',
            display: 'block',
            pointerEvents: 'none',
            position: 'absolute',
            zIndex: Number.MAX_SAFE_INTEGER,
        });

        this.update();

        document.body.appendChild(this.root);
    }

    public update() {
        const width = window.innerWidth - 0.5;
        const height = window.innerHeight - 0.5;

        setElementStyle(this.root, {
            left: px(document.documentElement.scrollLeft),
            top: px(document.documentElement.scrollTop),
            width: px(width),
            height: px(height),
        });

        this.root.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    public createElement<T extends keyof SVGElementTagNameMap>(tag: T): SVGElementTagNameMap[T] {
        return document.createElementNS(NS, tag);
    }

    public appendChild(element: SVGElement) {
        this.root.appendChild(element);
    }
}
