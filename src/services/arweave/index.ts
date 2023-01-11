import Arweave from 'arweave/node/common';

import { SmartweaveContractSource } from '../../types';
import { ArweaveCompositeDataProvider } from './ArweaveCompositeDataProvider';
import { WarpDataProvider } from './WarpDataProvider';

export const defaultDataProvider = (
  arweave: Arweave,
): SmartweaveContractSource =>
  new ArweaveCompositeDataProvider([new WarpDataProvider(arweave)], arweave);
