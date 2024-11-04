import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register ts-node as the loader with ESM support
register('ts-node/esm', pathToFileURL('./'));
