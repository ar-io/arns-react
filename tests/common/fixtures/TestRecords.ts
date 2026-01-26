import { AoArNSNameData } from '@ar.io/sdk/web';
import { TRANSACTION_TYPES } from '@src/types';

const TEST_RECORDS: Record<string, AoArNSNameData> = {
  ardrive: {
    processId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
    startTimestamp: 1711122719,
    type: TRANSACTION_TYPES.BUY,
    undernameLimit: 10,
    purchasePrice: 0,
  },
  'xn--go8h6v': {
    processId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
    startTimestamp: 1711122719,
    type: TRANSACTION_TYPES.BUY,
    undernameLimit: 10,
    purchasePrice: 0,
  },
};

export default TEST_RECORDS;
