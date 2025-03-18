# arns-react

A React App for the Arweave Name System Registry, which lets users search for
and purchase Names.

## Getting Started

### Run

```shell
yarn
yarn dev
```

### Build

```shell
yarn build
```

### Test

```shell
yarn test
```

## Contributions

### Components

These rules are to help keep the repo tidy and help know where everything is. A
moment in the mind is worth nine in the fire.

- When creating a component, create a folder for it, which includes its .tsx
  file named for its exported component, a testing folder named '**tests**', and
  its CSS file named as styles.css.
- When creating a test, each testing file should be name as:
  `<component-name>.test.ts` .
- When creating a util, it should be in the src/utils folder, which has its own
  testing folder.
- When adding images, they should go in the assets/images/<theme-type> folder.
  Dark-mode and light-mode specific images get their own folders, images shared
  across themes go in the common folder.
- When adding a translation, it goes in the assets/translations folder, named as
  `<native-languages-name>.json`. Translated text in the json should

### Notifications

When using the notification API you can import the `eventEmitter` from the
`events.ts` file. From the `errors.ts` file you can import
`NotificationOnlyError` which will not emit the error to sentry, otherwise for
errors that should be reported, such as unhandled errors, use the `Error` object
or create a custom error that extends it in the `errors.ts` file.

### Smartweave Contract Deploys

We currently deploy contracts manually due to Warp Deploy Plugin not
implementing tree shaking. This saves 2mb on the build size - once warp adds
deploy functionality in the core package, we should switch to that, or when our
deployment method becomes more complicated (e.g L2 usage)
