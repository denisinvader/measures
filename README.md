# Measures

Script and browser extension to measure elements on any page.

## Development

```sh
nvm use
pnpm i
```

### Workspace

- [`core`](./core/) — core logic and interactions for content script;
- [`extension`](./extension/) — WXT project, extension bundles here;
- [`landing`](./landing/) — measures.mpanichev.ru source code;
- [`script`](./script/) — npm package to access from UNPKG or jsDeliver.

### Extension

Extension scripts run from it's package.

```sh
cd extension

// Start Firefox in dev-mode
pnpm dev:firefox

// Bundle zip
pnpm zip:firefox
```
