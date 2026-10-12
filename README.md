# Measures

A tool for measuring the dimensions, spacing, and distances between elements on any website.

[Live demo and guide.](https://measures.mpanichev.ru)

## Development

Install dependencies:

```sh
nvm use
pnpm i
```

Run sandbox with measures script:

```sh
pnpm sandbox
```

[Contributing.](./CONTRIBUTING.md)

### Workspace

- [`core`](./core/) — core logic and interactions for content script;
- [`extension`](./extension/) — WXT project, extension bundles here;
- [`script`](./script/) — npm package to access from UNPKG or jsDelivr;
- [`sandbox`](./sandbox/) — pages for testing during local development;
- [`landing`](./landing/) — measures.mpanichev.ru source code.

### Extension

Extension scripts run from it's package.

```sh
cd extension

# Start Firefox in dev-mode
pnpm dev:firefox

# Bundle zip
pnpm zip:firefox
```

## License

[GNU AGPL 3.0](./LICENSE) © [Mikhail Panichev](https://mpanichev.ru)
