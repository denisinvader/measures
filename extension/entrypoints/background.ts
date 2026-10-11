import { COLORS } from '@measures/core';

const ENABLED_TEXT = 'ON';

export default defineBackground(() => {
    browser.browserAction.onClicked.addListener((tab) => {
        const tabId = tab.id;
        if (!tabId) {
            return;
        }

        browser.browserAction.getBadgeText({ tabId }, (text) => {
            const enabled = text === ENABLED_TEXT;

            if (enabled) {
                browser.browserAction.setBadgeText({
                    tabId,
                    text: '',
                });
                browser.tabs.sendMessage(tabId, 'disable');
            } else {
                browser.browserAction.setBadgeText({
                    tabId,
                    text: ENABLED_TEXT,
                });
                browser.browserAction.setBadgeBackgroundColor({
                    tabId,
                    color: COLORS.red,
                });

                browser.tabs.sendMessage(tabId, 'enable');
            }
        });
    });
});
