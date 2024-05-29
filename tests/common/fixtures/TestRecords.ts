import { ArNSNameData } from '@ar.io/sdk/web';
import { TRANSACTION_TYPES } from '@src/types';

const TEST_RECORDS: Record<string, ArNSNameData> = {
  ardrive: {
    contractTxId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
    startTimestamp: 1711122719,
    type: TRANSACTION_TYPES.BUY,
    undernames: 10,
    purchasePrice: 0,
  },
  'xn--go8h6v': {
    contractTxId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
    startTimestamp: 1711122719,
    endTimestamp: 1711122739,
    type: TRANSACTION_TYPES.LEASE,
    undernames: 10,
    purchasePrice: 0,
  },
};

export default TEST_RECORDS;
