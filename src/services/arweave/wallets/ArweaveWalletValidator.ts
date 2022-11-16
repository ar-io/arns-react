export abstract class ArweaveWalletValidator {
  validateWallet(jwk?: any) {
    //this is gonna be a standard validation for every wallet provider
    return true;
  }
}
