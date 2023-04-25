# pdns-react

A React App for the Arweave Name System Registry, which lets users search for and purchase Names.

## Getting Started

### Run

```shell
npm ci
npm run dev
```

### Build

```shell
npm run build
```

### Test

```shell
npm test
```

## Contributions

### Components

These rules are to help keep the repo tidy and help know where everything is. A moment in the mind is worth nine in the fire.

- When creating a component, create a folder for it, which includes its .tsx file named for its exported component, a testing folder named '**tests**', and its CSS file named as styles.css.
- When creating a test, each testing file should be name as: `<component-name>.test.ts` .
- When creating a util, it should be in the src/utils folder, which has its own testing folder.
- When adding images, they should go in the assets/images/<theme-type> folder. Dark-mode and light-mode specific images get their own folders, images shared across themes go in the common folder.
- When adding a translation, it goes in the assets/translations folder, named as `<native-languages-name>.json`. Translated text in the json should
