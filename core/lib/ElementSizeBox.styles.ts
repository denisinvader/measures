import type * as CSS from 'csstype';
import { COLORS } from '../styles';

export const styles = {
    root: {
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: 1000,
    },
    box: {
        border: `thin solid ${COLORS.blue}`,
        position: 'absolute',
    },
    boxSizeLabel: {
        backgroundColor: COLORS.blue,
        color: COLORS.white,
        fontFamily: 'system-ui',
        fontSize: '11px',
        fontWeight: 'bold',
        lineHeight: 1,
        padding: '.25em',
        position: 'absolute',
        textAlign: 'center',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
    },
} as const satisfies Record<string, CSS.Properties>;
