abstract class ArweaveWalletValidator {
    validateWallet(jwk?: any){
        //this is gonna be a standard validation for every wallet provider
        return true;
    }
}

interface WalletUploadSource {
    getWallet();
}

class JsonWalletProvidern extends ArweaveWalletValidator implements WalletUploadSource  {
    constructor(dispatch: any) {
        
    }

    getWallet() {
        // the logic to trigger the upload file process, and storing in local storage
        // and triggering update global state helper function
    }
}
