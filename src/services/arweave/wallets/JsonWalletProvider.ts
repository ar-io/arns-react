import { JWKInterface } from 'arweave/node/lib/wallet';
import { isString } from 'lodash';

import { WalletUploadSource } from '../../../types';
import { ArweaveWalletValidator } from './ArweaveWalletValidator';

export class JsonWalletProvider
  extends ArweaveWalletValidator
  implements WalletUploadSource
{
  constructor() {
    super();
  }
  getWallet(e: any): JWKInterface | void {
    // the logic to trigger the upload file process, and storing in local storage
    // and triggering update global state helper function
    const key = e.target.files[0];
    try {
      if (key.type !== 'application/json') {
        throw Error('Invalid keyfile, must be a json file');
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          throw Error('Cannot read keyfile');
        }
        const str = e.target.result;
        if (!isString(str)) {
          return;
        }
        const json = JSON.parse(str);

        return json;
      };
      reader.readAsText(key);
    } catch (error) {
      console.error(error);
      //todo set up an error alert for the user that is was not a valid keyfile
      return undefined;
    }
  }
}
