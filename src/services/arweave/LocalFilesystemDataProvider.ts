import { SmartweaveContractSource, ArNSContractState } from '../types.js';
import axios from 'axios';

export class LocalFileSystemDataProvider implements SmartweaveContractSource {
  async getContractState(txId: string): Promise<ArNSContractState | undefined> {
    try {
      const localFile = new URL(
        `../../../data/contracts/${txId}.json`,
        import.meta.url,
      ).href;
      const { data } = await axios.get(localFile);
      const arnsContractState = data as ArNSContractState;
      return arnsContractState;
    } catch (err) {
      console.log('Unable to load contract state.');
    }
    return;
  }
}
