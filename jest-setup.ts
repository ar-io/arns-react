// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import '@testing-library/jest-dom';
import 'core-js';
import matchMediaMock from 'match-media-mock';
import React from 'react';
import { TextDecoder, TextEncoder } from 'util';

window.matchMedia = window.matchMedia || matchMediaMock.create();

global.React = React;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
