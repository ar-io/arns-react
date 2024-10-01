// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import '@testing-library/jest-dom';
import 'core-js';
import { indexedDB } from 'fake-indexeddb';
import 'jest-canvas-mock';
import 'jest-location-mock';
// was needed for github actions environment
import matchMediaMock from 'match-media-mock';
import React from 'react';
import { TextDecoder, TextEncoder } from 'util';

window.matchMedia ??= matchMediaMock.create(); // required for rendering ant design components, specifically at time of addition, the steps component.

global.React = React;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.performance.markResourceTiming = jest.fn();
global.fetch = require('node-fetch');
global.indexedDB = indexedDB;
// forcefully mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
      sign: jest.fn(),
    },
  },
});
