# arns-react
A React App for the Arweave Name System Registry, which lets users search for and purchase Names.

## Getting Started

### Running the app locally

- clone the repo
- `npm install`
- `npm run setup:contracts` - this will start arlocal in --persist mode, generate a wallet, and deploy the contracts
- `npm run dev` - app will start on localhost:5173 and connect to arlocal.
- open browser and navigate to localhost:5173
The app should now be running, and you can connect your arconnect, arweave.app, or JWK wallet.



## Testing

### Running tests
- testing the entire app end-to-end can be done by running `npm test:e2e`
- testing a contract template can be done by running `npm test:contract:<contract-name>` - available are "arns","ant","io". If you want to load test a contract, run `npm test:contract:<contract-name>:load`. Load testing takes awhile.


### What are we using?

Testing required a bit of configuration to use Jest with vite. We are using:

- jest \ runs our tests
- @testing-library/react \ renders components in our test env
- @testing-library/jest-dom \ asserts components are in the dom and contain data
- @testing-library/user-event \ programmatically interacts with components
- @babel/preset-react >
- @babel/preset-typescript >
- @babel/preset-env \ these babel libs allow use to use JSX, TS, and ES6 modules in tests 
- identity-obj-proxy \ helps with css modules so we can see original class names



## File Structure
These rules are to help keep the repo tidy and help know where everything is. A moment in the mind is worth nine in the fire.

- When creating a component, create a folder for it, which includes its .tsx file named for its exported component, a testing folder named '__tests__', and its CSS file named as styles.css.
- When creating a test, each testing file should be name as: <file its testing>.test.ts .
- When creating a util, it should be in the src/utils folder, which has its own testing folder.
- When adding images, they should go in the assets/images/<theme-type> folder. Dark-mode and light-mode specific images get their own folders, images shared across themes go in the common folder.
- When adding a translation, it goes in the assets/translations folder, named as <native-languages-name>.json. Translated text in the json should

## Dependencies

//todo

## Translations

//in progress
we could use react-i18next lib for translations. It stores translations in JSON files and applies them when the locality is changed.

