import { ArweaveWalletValidator } from "./ArweaveWalletValidator";
import {WalletUploadSource} from '../../../types'
  
  export class JsonWalletProvider
    extends ArweaveWalletValidator
    implements WalletUploadSource
  {
    constructor(){
      this.wallet = {}
    }
    getWallet() {
      // the logic to trigger the upload file process, and storing in local storage
      // and triggering update global state helper function
    }
  }