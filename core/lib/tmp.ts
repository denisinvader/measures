import { autoUpdate, computePosition, size } from '@floating-ui/dom';
import { setElementStyle } from './setElementStyle';

const COLORS = {
    blue: '#4269d0',
    orange: '#efb118',
    red: '#ff725c',
    cyan: '#6cc5b0',
    green: '#3ca951',
    pink: '#ff8ab7',
    purple: '#a463f2',
    lightBlue: '#97bbf5',
    brown: '#9c6b4e',
    gray: '#9498a0',
    white: '#ffffff',
    black: '#313131',
} as const;

const strategy = 'absolute';

export const createNodeBox = function createNodeBox(target: HTMLElement | SVGElement) {
    const root = document.createElement('div');

    setElementStyle(root, {
        position: strategy,
        top: 0,
        left: 0,
    });

    const box = document.createElement('div');

    setElementStyle(box, {
        position: 'absolute',
        left: 0,
        top: 0,
        border: `1px solid ${COLORS.blue}`,
        width: '200px',
        height: '200px',
    });

    root.appendChild(box);

    document.body.appendChild(root);

    const updatePosition = () => {
        computePosition(target, root, {
            strategy,
            placement: 'top-start',
            middleware: [
                size({
                    apply({ rects }) {
                        setElementStyle(box, {
                            width: `${rects.reference.width}px`,
                            height: `${rects.reference.height}px`,
                        });
                    },
                }),
            ],
        }).then(({ x, y }) => {
            setElementStyle(root, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
    };

    const cleanup = autoUpdate(target, root, updatePosition);

    return { root, cleanup } as const;
};
