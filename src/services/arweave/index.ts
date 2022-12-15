import { SmartweaveContractSource } from '../../types';
import { ArweaveCompositeDataProvider } from './ArweaveCompositeDataProvider';
import { WarpDataProvider } from './WarpDataProvider';

export const defaultDataProvider = (): SmartweaveContractSource =>
  new ArweaveCompositeDataProvider([new WarpDataProvider()]);
