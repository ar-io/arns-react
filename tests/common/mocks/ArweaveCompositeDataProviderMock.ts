import { AoArNSNameData } from '@ar.io/sdk/web';

const ArweaveCompositeDataProviderMock = jest.fn(() => ({
  getArBalance: jest.fn(() => Promise.resolve()),
  getContractState: jest.fn(() => Promise.resolve()),
  writeTransaction: jest.fn(() => Promise.resolve()),
  getContractBalanceForWallet: jest.fn(() => Promise.resolve()),
  getContractsForWallet: jest.fn(() => Promise.resolve()),
  getTransactionStatus: jest.fn(() => Promise.resolve()),
  getTransactionTags: jest.fn(() => Promise.resolve()),
  validateTransactionTags: jest.fn(() => Promise.resolve()),
  validateArweaveId: jest.fn(() => Promise.resolve()),
  validateConfirmations: jest.fn(() => Promise.resolve()),
  validateArweaveAddress: jest.fn(() => Promise.resolve()),
  deployContract: jest.fn(() => Promise.resolve()),
  registerAtomicName: jest.fn(() => Promise.resolve()),
  getArPrice: jest.fn(() => Promise.resolve()),
  getCurrentBlockHeight: jest.fn(() => Promise.resolve(1)),
  getContractInteractions: jest.fn(() => Promise.resolve()),
  getPendingContractInteractions: jest.fn(() => Promise.resolve()),
  getConfirmedContractInteractions: jest.fn(() => Promise.resolve()),
  getFailedContractInteractions: jest.fn(() => Promise.resolve()),
  getSuccessfulContractInteractions: jest.fn(() => Promise.resolve()),
  getContractInteraction: jest.fn(() => Promise.resolve()),
  getContractInteractionsByAddress: jest.fn(() => Promise.resolve()),
  getContractInteractionsByBlockHeight: jest.fn(() => Promise.resolve()),
  getContractInteractionsByTimestamp: jest.fn(() => Promise.resolve()),
  getContractInteractionsByTransactionId: jest.fn(() => Promise.resolve()),
  getContractInteractionsByWalletAddress: jest.fn(() => Promise.resolve()),
  getRecord: jest.fn<Promise<AoArNSNameData>, any[]>(() => {
    throw new Error('Not implemented');
  }),
  getRecords: jest.fn(() => Promise.resolve()),
  isDomainReserved: jest.fn(() => Promise.resolve()),
  isDomainAvailable: jest.fn(() => Promise.resolve()),
  getTokenBalance: jest.fn(() => Promise.resolve()),
}));

export default ArweaveCompositeDataProviderMock;
