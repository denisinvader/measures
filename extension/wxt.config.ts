import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        browser_specific_settings: {
            gecko: {
                data_collection_permissions: {
                    required: ['none'],
                },
            },
        },
        action: {
            default_area: 'navbar',
            default_title: 'Toggle Measures',
        },
    },
});
