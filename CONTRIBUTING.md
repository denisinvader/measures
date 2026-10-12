# Contributing

Bug reports and feature requests are welcome; you do not need to contribute code.

## Report a bug

1. Search the existing issues for the same problem.
2. Open a **Bug report** and include the steps that reproduce it.
3. Add the browser, extension or package version, and any useful screenshots or error messages.

Report one problem per issue. Remove private URLs, page content, and personal information before sharing them.

## Request a feature

1. Search the existing issues for the same request.
2. Open a **Feature request** and describe the task you want to complete.
3. Explain what happens today and what behavior would help.

You can suggest an implementation, but a detailed design is not required.

## Contribute code

For a small fix, open a pull request with a clear description and link the related issue if there is one. For a larger change, open an issue first so the scope can be discussed.

Before submitting a pull request, run the checks from the repository root:

```sh
pnpm -r tsc
pnpm lint
pnpm test
```

Include any checks you ran in the pull request description.

## Security and private information

Do not post credentials, private page content, or other sensitive information in a public issue. Check the repository's **Security** tab for private vulnerability reporting options.
