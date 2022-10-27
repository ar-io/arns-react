# arns-react

A React App for the Arweave Name System Registry, which lets users search for and purchase Names.

## Getting Started

### Local Setup

- clone the repo
- `npm install`
- `npm run setup:contracts` - this will start arlocal in --persist mode, generate a wallet, and deploy the contracts
- `npm run dev` - app will start on localhost:5173 and connect to arlocal.
- open browser and navigate to localhost:5173
  The app should now be running, and you can connect your arconnect, arweave.app, or JWK wallet.

## Testing

### Running tests

to test run `npm test`

## Component Contribution

These rules are to help keep the repo tidy and help know where everything is. A moment in the mind is worth nine in the fire.

- When creating a component, create a folder for it, which includes its .tsx file named for its exported component, a testing folder named '**tests**', and its CSS file named as styles.css.
- When creating a test, each testing file should be name as: <file its testing>.test.ts .
- When creating a util, it should be in the src/utils folder, which has its own testing folder.
- When adding images, they should go in the assets/images/<theme-type> folder. Dark-mode and light-mode specific images get their own folders, images shared across themes go in the common folder.
- When adding a translation, it goes in the assets/translations folder, named as <native-languages-name>.json. Translated text in the json should
