// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import '@testing-library/jest-dom';
import 'core-js';
import React from 'react';
import { TextDecoder, TextEncoder } from 'util';

global.React = React;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
