import { MeasuresController } from '@measures/core';

export default defineContentScript({
    matches: ['<all_urls>', '*://*.google.com/*'],
    matchAboutBlank: true,
    main() {
        let cc: MeasuresController | null = null;

        browser.runtime.onMessage.addListener((message) => {
            if (message === 'enable') {
                cc = new MeasuresController();
                cc.autoObserve();
            } else if (message === 'disable') {
                if (!cc) {
                    return;
                }
                cc.destroy();
                cc = null;
            }
        });
    },
});
