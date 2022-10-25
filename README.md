# arns-react
A React App for the Arweave Name System Registry, which lets users search for and purchase Names.

## Getting Started

clone the repo, 
run npm install, 
run npm setup:contracts - this will start arlocal, and deploy the contracts
run npm start - app will start on localHost:3000 and connect to arlocal.

## Testing

### Running tests


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

//todo

## Dependencies

//todo
