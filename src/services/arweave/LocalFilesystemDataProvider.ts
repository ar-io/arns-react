import { SmartweaveContractSource, ArNSContractState, ArweaveTransactionId} from '../types';
import axios from 'axios';

export class LocalFileSystemDataProvider implements SmartweaveContractSource {
  async getContractState(txId: ArweaveTransactionId): Promise<ArNSContractState | undefined> {
    try {
      const localFile = `../../../data/contracts/${txId}.json`;
      const { data } = await axios.get(localFile);
      const arnsContractState = data as ArNSContractState;
      return arnsContractState;
    } catch (err) {
      console.log('Unable to load contract state.');
    }
    return;
  }
}
