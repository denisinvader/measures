import { setElementStyle } from '../styles';
import { px } from './px';

const NS = 'http://www.w3.org/2000/svg';

type Group = 'size' | 'relation' | 'label';

// TODO: different render contexts for box, relation and labels
export class RenderContext {
    private root: SVGElement;
    private defs: SVGDefsElement;
    private groups: Record<Group, SVGGElement>;

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

        this.defs = this.create('defs');
        this.root.appendChild(this.defs);

        this.groups = {
            size: this.create('g'),
            relation: this.create('g'),
            label: this.create('g'),
        };
        this.root.appendChild(this.groups.size);
        this.root.appendChild(this.groups.relation);
        this.root.appendChild(this.groups.label);

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

    public create<T extends keyof SVGElementTagNameMap>(tag: T): SVGElementTagNameMap[T] {
        return document.createElementNS(NS, tag);
    }

    public append(target: Group | 'defs', element: SVGElement) {
        if (target === 'defs') {
            this.defs.appendChild(element);
            return;
        }

        this.groups[target].appendChild(element);
    }

    /** @deprecated jff */
    public createElement<T extends keyof SVGElementTagNameMap>(tag: T): SVGElementTagNameMap[T] {
        return document.createElementNS(NS, tag);
    }

    /** @deprecated jff */
    public appendChild(element: SVGElement) {
        this.root.appendChild(element);
    }
}
