import { WalletUploadSource } from '../../../types';
import { ArweaveWalletValidator } from './ArweaveWalletValidator';

export class JsonWalletProvider
  extends ArweaveWalletValidator
  implements WalletUploadSource
{
  constructor() {
    this.wallet = {};
  }
  getWallet() {
    // the logic to trigger the upload file process, and storing in local storage
    // and triggering update global state helper function
  }
}
