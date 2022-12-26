import { ArweaveTransactionId, SmartweaveContractSource } from '../../types';
import { ArweaveCompositeDataProvider } from './ArweaveCompositeDataProvider';
import { WarpDataProvider } from './WarpDataProvider';

export const defaultDataProvider = (
  contractId: ArweaveTransactionId,
): SmartweaveContractSource =>
  new ArweaveCompositeDataProvider([new WarpDataProvider(contractId)]);
