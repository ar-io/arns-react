import {
    ArweaveWallet,
    ArweaveTransactionId,
    ArNSDomains
} from '../../types'

export class ArweaveWalletProvider implements ArweaveWallet {

constructor(jwk, arconnect){
  this.jwk = jwk,
  this.arconnect = arconnect,
}
   
    getType():string{
      if(!this.jwk && !this.arconnect){
        throw Error("not a valid wallet")
      }
      if (this.jwk){
        return "jwk"
      }
      if (this.arconnect){
        return "arconnect"
      }
      
        
    }
  getAddress():ArweaveTransactionId{
    // run a conditional to get address from jwk or arconnect
    return "address"
  }
  getArBalance():number{
    // get ar balance using address from above
    return 0
  }
  getIOBalance():number{
    // get io balance using address from above
    return 0
  }
  getANTS():ArweaveTransactionId[]{
    // query for ants uploaded using this users address or ants where the transfer-to function has
    // the users address and download them to check the owner
    return ["soidja"]
  }
  getArNSNames():ArNSDomains{
    // search contract state for ArNS names owned by user
    return {"edwe":"wedwe"}
  }
}