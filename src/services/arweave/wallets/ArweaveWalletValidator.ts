export abstract class ArweaveWalletValidator {
  validateWallet(jwk?: any) {
    //this is gonna be a standard validation for every wallet provider
    // for jwk wallet, producing a valid address that matches regex is enough
    return true;
  }
}
