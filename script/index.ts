import { MeasuresController } from '@measures/core';

const init = () => {
    const controller = new MeasuresController();

    controller.autoObserve();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
